/*
 * Siklus sesi: pengaturan awal (setup), login, memulai sesi, keluar/reset. Logika kunci ada di KDMP.security.kunci;
 * berkas ini menangani tampilan layar login dan menyiapkan state setelah sandi benar.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { klik, ubah, kirim } = KDMP.ui.aksi;
  const kv = KDMP.storage.kv;
  const kripto = KDMP.security.kripto;
  const apl = KDMP.config.aplikasi;
  const app = KDMP.app.state;
  const UNIT = apl.unit;
  let idle;

  /** Menampilkan kotak di tengah layar (login/setup) di atas aplikasi. */
  function kotak(isi) {
    $('#ov').style.display = 'block';
    $('#ov').innerHTML = '<div class=lg><img src="' + apl.logo + '" alt=""><h2>' + apl.judulLogin + '</h2><div class=sub>' + apl.subJudulLogin + '</div>' + isi + '<p id=er class=no></p><div class=c>' + apl.versi + '</div></div>';
  }

  const TAUTAN_PULIH = '<p class=c>Pernah memakai aplikasi ini? <label style="color:#1F3864;text-decoration:underline;cursor:pointer">Pulihkan dari file cadangan lengkap<input type=file accept=.json style=display:none ' + ubah('backup.pulihkan') + '></label> (sandi lama tetap berlaku). <a href=# ' + klik('backup.unduh') + ' style="color:#1F3864">Unduh backup database</a></p>';

  function tampilkanSetup() {
    kotak('<p>Pengaturan awal (sekali). Sandi minimal 6 karakter. <b>Sandi Admin</b> membuka Konsolidasi; sandi tiap unit hanya membuka unitnya. Sandi yang hilang tidak bisa dipulihkan.</p><p class=no><b>Penting:</b> isi <b>sandi Admin yang SAMA</b> di semua komputer (USP, Sembako, dan bendahara) agar paket data unit bisa diimpor ke Konsolidasi.</p>' +
      ['Admin', ...UNIT].map((u) => `<label>Sandi ${u}<br><input id=p_${u} type=password style=width:100%></label><br>`).join('') + '<br><button class=p ' + klik('sesi.setup') + '>Buat</button>' + TAUTAN_PULIH);
  }

  async function lakukanSetup() {
    const sandi = {};
    for (const u of ['Admin', ...UNIT]) {
      sandi[u] = $('#p_' + u).value;
      if (sandi[u].length < 6) return ($('#er').textContent = 'Sandi ' + u + ' minimal 6 karakter');
    }
    const meta = await KDMP.security.kunci.buatMeta(sandi);
    try {
      await kv.set('meta', meta);
      app.kunci.META = meta;
      tampilkanLogin();
    } catch (e) { $('#er').textContent = 'Gagal: ' + ((e && e.message) || e) + ' (pengaturan awal mungkin sudah dibuat dari perangkat lain — muat ulang halaman).'; }
  }

  function tampilkanLogin() {
    kotak('<form ' + kirim('sesi.login') + '><label>Masuk sebagai<br><select id=lu style=width:100%>' +
      [...UNIT, 'KONSOL'].map((u) => `<option value=${u}>${u == 'KONSOL' ? 'Konsolidasi (Admin)' : KDMP.config.unit[u].name}</option>`).join('') +
      '</select></label><br><label>Sandi<br><input id=lp type=password style=width:100%></label><br><br><label><input type=checkbox ' + ubah('sesi.tampilSandi') + '> Tampilkan sandi</label><br><br><button class=p type=submit>Masuk</button></form><p class=c><a href=# ' + klik('sesi.resetSemua') + '>Lupa sandi? Hapus semua data &amp; atur ulang</a></p>' + TAUTAN_PULIH);
    $('#lp').focus();
  }

  async function resetSemua() {
    if (prompt('Semua data di database aplikasi ini akan DIHAPUS permanen (unduh backup dulu bila perlu). Ketik HAPUS untuk melanjutkan:') == 'HAPUS') {
      await kv.clear();
      location.reload();
    }
  }

  async function login() {
    const u = $('#lu').value;
    const p = $('#lp').value;
    try {
      const { DK, RAW } = await KDMP.security.kunci.bukaSesi(app.kunci.META, u, p);
      app.kunci.DK = DK;
      app.kunci.RAW = RAW;
    } catch (e) { return ($('#er').textContent = 'Sandi salah.'); }
    app.kunci.PIN = p;
    await mulai(u);
  }

  /** Menyiapkan state untuk sesi `u` lalu menampilkan tab pertama. */
  async function mulai(u) {
    await KDMP.storage.coaDb.muat();
    KDMP.app.simpan.reset();
    app.unit = u;
    app.konsol = u == 'KONSOL';
    app.kunci.KEY = 'd_' + u;
    const c = app.konsol ? KDMP.config.konsolidasi : KDMP.config.unit[u];
    app.konfig = { name: c.name, color: c.color, LPK: c.LPK, LR: c.LR };

    const muat = async (k, kunci) => {
      const v = await kv.get(k);
      if (!v) return null;
      try { return await kripto.dekripsiJson(kunci, v); } catch (e) { return null; }
    };
    app.data = (await muat(app.kunci.KEY, app.kunci.DK)) || { bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(), kop: apl.singkatan, rows: [], cv: 3 };
    (app.data.rows || []).forEach((r) => { if (r.kom == 'Pembayaran Utang Jangka Panjang') r.kom = 'Pembayaran Pinjaman Jangka Panjang'; });
    app.data.sub = app.data.sub || {};
    if (app.konsol) {
      app.data.imp = app.data.imp || {};
      app.data.units = {};
      for (const k of UNIT) {
        const d = await muat('d_' + k, await kripto.kunciDariMentah(app.kunci.RAW[k]));
        app.data.units[k] = app.data.imp[k] || { rows: d ? d.rows : [], tgl: d ? 'lokal (browser ini)' : 'belum ada data' };
      }
    }
    app.tabs = KDMP.app.navigasi.daftarTab(u);
    app.tab = null;
    app.sv = {}; app.sel = {}; app.keep.clear();

    $('#ov').style.display = 'none';
    $('#ttl').textContent = c.name;
    document.title = c.name;
    $('#lg').src = KDMP.ui.kop.logo();
    $('#bln').innerHTML = apl.namaBulan.map((m, i) => `<option value=${i + 1}>${m}</option>`).join('');
    $('#bln').value = app.data.bulan;
    $('#thn').value = app.data.tahun;
    $('#bln').onchange = (e) => { app.data.bulan = +e.target.value; app.keep.clear(); KDMP.app.simpan.jadwalkan(); KDMP.app.navigasi.pergi(); };
    $('#thn').onchange = (e) => { app.data.tahun = +e.target.value; app.keep.clear(); KDMP.app.simpan.jadwalkan(); KDMP.app.navigasi.pergi(); };
    KDMP.ui.daftarAkun.perbarui();
    // keluar otomatis setelah 10 menit tanpa aktivitas
    const setUlang = () => { clearTimeout(idle); idle = setTimeout(() => location.reload(), 600000); };
    ['click', 'keydown'].forEach((e) => addEventListener(e, setUlang));
    setUlang();
    KDMP.app.navigasi.pergi(app.tabs[0]);
    KDMP.app.sinkron.mulai();
  }

  KDMP.ui.aksi.daftar({
    'sesi.setup': () => lakukanSetup(),
    'sesi.login': () => login(),
    'sesi.tampilSandi': (el) => { $('#lp').type = el.checked ? 'text' : 'password'; },
    'sesi.resetSemua': () => resetSemua(),
    'sesi.keluar': () => location.reload()
  });

  KDMP.app.sesi = { kotak, tampilkanSetup, tampilkanLogin, login, mulai };
})(globalThis.KDMP);
