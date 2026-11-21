/*
 * Menambah unit usaha baru (selain USP & Sembako) tanpa mengubah kode.
 *
 * Penyimpanan (IndexedDB):
 *   units_custom  daftar definisi unit tambahan [{kode, nama, warna, templat, persediaan}] (tidak rahasia)
 *   meta.units    kunci data unit baru (dibungkus sandi unit & kunci Admin) - sama seperti unit bawaan
 * Keduanya ditulis dalam SATU transaksi agar tidak ada unit setengah jadi.
 *
 * Dua jalan masuk:
 *  1. Layar login: "Tambah unit usaha baru" - butuh sandi Admin (berlaku di komputer unit maupun bendahara).
 *  2. Tab Data Unit saat login sebagai Konsolidasi (Admin) - memakai kunci Admin sesi.
 * Unit dari komputer lain yang belum dikenal diterima otomatis saat paket/backupnya diimpor ke Konsolidasi
 * (lihat terima() dan app/paket-unit.js).
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { klik } = KDMP.ui.aksi;
  const { esc } = KDMP.core.format;
  const kv = KDMP.storage.kv;
  const kripto = KDMP.security.kripto;
  const kunci = KDMP.security.kunci;
  const U = KDMP.core.unit;
  const app = KDMP.app.state;
  const KUNCI_DB = 'units_custom';

  const salin = (x) => JSON.parse(JSON.stringify(x));

  /** Judul konsolidasi memuat daftar unit; selaraskan judul sesi yang sedang berjalan (header, tab browser, kop laporan). */
  function segarkanJudul() {
    if (!app.konsol || !app.konfig) return;
    app.konfig.name = KDMP.config.konsolidasi.name;
    $('#ttl').textContent = app.konfig.name;
    document.title = app.konfig.name;
  }

  /** Dipanggil saat aplikasi mulai (sebelum layar login): mendaftarkan semua unit tambahan yang tersimpan. */
  async function muat() {
    const a = await kv.get(KUNCI_DB);
    (Array.isArray(a) ? a : []).forEach((d) => {
      try { U.daftarkan(d); } catch (e) { console.warn('Unit tambahan dilewati:', d && d.kode, e.message); }
    });
  }

  /** Formulir tambah unit. `denganSandiAdmin` = true di layar login (belum ada kunci Admin di memori). */
  function formHtml(denganSandiAdmin) {
    const templat = Object.keys(U.TEMPLAT).map((k) => `<option value="${k}">${esc(U.TEMPLAT[k])}</option>`).join('');
    return `<div class=nu style="text-align:left">
<label>Kode unit (huruf/angka, tanpa spasi — mis. Klinik)<br><input id=nu_kode maxlength=16 autocomplete=off style=width:100%></label><br>
<label>Nama unit<br><input id=nu_nama maxlength=60 autocomplete=off style=width:100%></label><br>
<label>Susunan laporan<br><select id=nu_templat style=width:100%>${templat}</select></label><br>
<label>Warna <input id=nu_warna type=color value="#1F3864"></label> &nbsp; <label><input id=nu_persediaan type=checkbox> Pakai tab BP Persediaan</label><br>
<label>Sandi unit baru (min. 6 karakter)<br><input id=nu_sandi type=password style=width:100%></label><br>
${denganSandiAdmin ? '<label>Sandi Admin (yang sama dengan saat pengaturan awal)<br><input id=nu_admin type=password style=width:100%></label><br>' : ''}<br>
<button class=p ${klik('unit.tambah')}>Tambah unit</button>
<p id=nu_err class=no></p></div>`;
  }

  /** Layar "Tambah unit" di atas halaman login. */
  function tampilkanForm() {
    KDMP.app.sesi.kotak('<p><b>Tambah unit usaha baru</b></p>' + formHtml(true) + '<p class=c><a href=# ' + klik('unit.kembali') + '>Kembali ke login</a></p>');
  }

  async function tambah() {
    const err = (m) => { $('#nu_err').textContent = m; };
    const def = {
      kode: $('#nu_kode').value, nama: $('#nu_nama').value, warna: $('#nu_warna').value,
      templat: $('#nu_templat').value, persediaan: $('#nu_persediaan').checked
    };
    const galat = U.validasi(def);
    if (galat) return err(galat);
    const sandi = $('#nu_sandi').value;
    if (sandi.length < 6) return err('Sandi unit minimal 6 karakter.');
    const sesiAdmin = !!(app.konsol && app.kunci.DK);
    try {
      let kunciAdmin;
      if (sesiAdmin) kunciAdmin = app.kunci.DK;
      else {
        try { kunciAdmin = await kunci.kunciAdmin(app.kunci.META, $('#nu_admin').value); } catch (e) { return err('Sandi Admin salah.'); }
      }
      const d = U.normal(def);
      const meta = salin(app.kunci.META);
      const mentah = await kunci.tambahUnit(meta, d.kode, kunciAdmin, sandi);
      await kv.setAll({ meta, [KUNCI_DB]: U.daftarKustom().concat([d]) });
      app.kunci.META = meta;
      U.daftarkan(d);
      if (sesiAdmin) {
        app.kunci.RAW[d.kode] = mentah;
        app.data.units[d.kode] = { rows: [], tgl: 'belum ada data' };
        segarkanJudul();
        KDMP.ui.pesan.toast('Unit ' + d.kode + ' ditambahkan');
        KDMP.app.navigasi.pergi('Data Unit');
      } else {
        KDMP.app.sesi.tampilkanLogin();
        $('#lu').value = d.kode;
        $('#er').className = 'ok';
        $('#er').textContent = 'Unit ' + d.kode + ' ditambahkan. Masuk dengan sandi unit tersebut.';
      }
    } catch (e) { err('Gagal menambah unit: ' + ((e && e.message) || e)); }
  }

  /**
   * Konsolidasi menerima unit dari komputer lain (paket / backup) yang belum punya kunci di meta komputer ini:
   * menyimpan definisi unit dan kunci datanya (dibungkus ulang dengan kunci Admin sesi ini).
   * `mentah` = kunci data unit yang sudah berhasil dibuka dengan sandi Admin dari berkas.
   */
  async function terima(kode, s, wU, mentah) {
    if (!app.konsol || !app.kunci.DK || app.kunci.META.units[kode] || !KDMP.config.unit[kode] || !KDMP.config.unit[kode].kustom) return;
    const meta = salin(app.kunci.META);
    meta.units[kode] = { s, wU, wA: await kripto.enkripsi(app.kunci.DK, mentah) };
    await kv.setAll({ meta, [KUNCI_DB]: U.daftarKustom() });
    app.kunci.META = meta;
    app.kunci.RAW[kode] = mentah;
  }

  /** Mendaftarkan (dalam memori) definisi unit dari berkas impor bila belum dikenal. @returns {boolean} berhasil/ sudah ada */
  function kenali(def, kode) {
    if (KDMP.config.unit[kode]) return true;
    if (!def || def.kode !== kode) return false;
    try { U.daftarkan(def); return true; } catch (e) { return false; }
  }

  /** Membatalkan pendaftaran unit impor yang akhirnya tidak berhasil dibuka (tidak punya kunci di meta). */
  function rapikan() {
    U.daftarKustom().filter((d) => !app.kunci.META.units[d.kode]).forEach((d) => U.batalDaftar(d.kode));
    segarkanJudul(); // unit baru dari impor ikut tampil di judul
  }

  KDMP.ui.aksi.daftar({
    'unit.formLogin': () => tampilkanForm(),
    'unit.kembali': () => KDMP.app.sesi.tampilkanLogin(),
    'unit.tambah': () => tambah()
  });
  KDMP.app.unitBaru = { muat, formHtml, tampilkanForm, terima, kenali, rapikan };
})(globalThis.KDMP);
