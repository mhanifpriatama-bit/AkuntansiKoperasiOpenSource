/*
 * Panel "Database aplikasi" di bawah tab Data / Data Unit: simpan manual, titik pulih, dan pintasan COA.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { esc } = KDMP.core.format;
  const { klik, ubah, arg } = KDMP.ui.aksi;
  const kv = KDMP.storage.kv;
  const tp = KDMP.storage.titikPulih;
  const app = KDMP.app.state;

  async function gambarDaftar() {
    const el = $('#snl');
    if (!el) return;
    const ks = await tp.daftar(app.unit);
    el.innerHTML = ks.length
      ? '<table style=width:auto><tr><th>Waktu</th><th>Keterangan</th><th></th></tr>' + ks.map((s) => `<tr><td>${new Date(s.t).toLocaleString('id-ID')}</td><td>${esc(s.l)}</td><td><button ${klik('titikPulih.pulihkan', { k: s.kunci })}>Pulihkan</button> <button ${klik('titikPulih.hapus', { k: s.kunci })}>Hapus</button></td></tr>`).join('') + '</table>'
      : '<p class=c>Belum ada titik pulih.</p>';
  }

  /** HTML panel; daftar titik pulih diisi setelah panel masuk ke halaman. */
  function html() {
    setTimeout(gambarDaftar, 0);
    const kb = Math.round(JSON.stringify(Object.assign({}, app.data, { units: 0 })).length / 1024);
    const terakhir = KDMP.app.simpan.waktuTerakhir();
    return `<h4>Database aplikasi</h4><div class=bar><button class=p ${klik('simpan.manual')}>Simpan sekarang</button><button ${klik('titikPulih.buat')}>Buat titik pulih</button><span class=c>Terakhir tersimpan: ${terakhir || 'belum ada perubahan pada sesi ini'} · ukuran data ±${kb} KB · setiap perubahan otomatis tersimpan; Ctrl+S untuk simpan manual</span></div><div id=snl></div>` +
      (app.konsol ? '' : `<h4>Master akun (COA)</h4><div class=bar><button ${klik('coa.ekspor')}>Ekspor COA</button><label class=btn>Impor COA dari Admin<input type=file accept=.json style=display:none ${ubah('coa.impor')}></label><span class=c>${KDMP.core.coa.daftar.length} akun dipakai unit ini. Perubahan COA dilakukan Admin di tab Master COA.</span></div>`);
  }

  async function buatManual() {
    const l = prompt('Nama titik pulih (opsional):', '');
    if (l === null) return;
    await KDMP.app.simpan.saatIni();
    const v = await kv.get(app.kunci.KEY);
    await tp.buat(app.unit, l || 'Manual', v);
    KDMP.ui.pesan.toast('Titik pulih dibuat');
    gambarDaftar();
  }

  async function pulihkan(kunci) {
    if (!confirm('Data saat ini akan DIGANTI dengan titik pulih ini. Lanjut?')) return;
    const v = await tp.ambil(kunci);
    try {
      const d = await KDMP.security.kripto.dekripsiJson(app.kunci.DK, v.d);
      const units = app.data.units;
      app.data = d;
      if (units) app.data.units = units;
      app.data.sub = app.data.sub || {};
      $('#bln').value = app.data.bulan;
      $('#thn').value = app.data.tahun;
      await KDMP.app.simpan.saatIni();
      KDMP.ui.pesan.toast('Data dipulihkan');
      KDMP.app.navigasi.pergi(app.tabs[0]);
    } catch (e) { alert('Titik pulih tidak dapat dibuka dengan sandi saat ini.'); }
  }

  KDMP.ui.aksi.daftar({
    'titikPulih.buat': () => buatManual(),
    'titikPulih.hapus': async (el) => { if (confirm('Hapus titik pulih ini?')) { await tp.hapus(arg(el, 'k')); gambarDaftar(); } },
    'titikPulih.pulihkan': (el) => pulihkan(arg(el, 'k'))
  });
  KDMP.app.panelDb = { html };
})(globalThis.KDMP);
