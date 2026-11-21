/*
 * Tab Neraca Konsolidasi, Laba Rugi Konsolidasi, dan Data Unit (status & impor data tiap unit).
 * Hitungan ada di KDMP.core.konsolidasi; impor paket/backup ada di KDMP.app.paket.
 */
(function (KDMP) {
  'use strict';
  const { esc, NAMA_BULAN } = KDMP.core.format;
  const { klik, ubah, seret, arg } = KDMP.ui.aksi;
  const { kop, isianIdentitas } = KDMP.ui.kop;
  const { tabelLaporan } = KDMP.ui.tabelLaporan;
  const app = KDMP.app.state;
  const UNIT = KDMP.config.aplikasi.unit;
  const KADALUWARSA = 7 * 864e5; // paket unit dianggap usang setelah 7 hari

  /** Kolom konsolidasi + objek eliminasi manual (state.data['el'+mode]) yang dibuat bila belum ada. */
  function hitungKolom(spek, mode) {
    const ek = 'el' + mode;
    const manual = (app.data[ek] = app.data[ek] || {});
    const k = KDMP.core.konsolidasi.kolomKonsolidasi(spek, mode, {
      unit: app.data.units || {}, tahun: app.data.tahun, bulan: KDMP.app.bulan(), eliminasiManual: manual, namaAkun: KDMP.core.coa.nama
    });
    k.ek = ek;
    return k;
  }

  function renderNeraca() {
    const k = hitungKolom(app.konfig.LPK, 'nb');
    KDMP.ui.dom.isi(kop('NERACA KONSOLIDASI') + tabelLaporan(k.rows, k.cols, [...UNIT, 'Jumlah', 'Eliminasi (isi manual)', 'KONSOLIDASI'], { j: UNIT.length + 1, k: k.ek }) + '<p class=c>Eliminasi RK Piutang Gerai Sembako (USP) vs Utang ke USP (Sembako) dihitung otomatis; kolom Eliminasi bisa ditambah manual (negatif = mengurangi); selisih antar-unit lain, termasuk unit tambahan, diisi manual. Semua akun yang bersaldo di neraca setiap unit ditampilkan per akun dengan nama sesuai Master COA.</p>');
  }

  function renderLabaRugi() {
    const m = KDMP.app.bulan();
    const a = hitungKolom(app.konfig.LR, 'm');
    const b = hitungKolom(app.konfig.LR, 'y');
    const judul = [...UNIT, 'Jumlah', 'Eliminasi', 'KONSOLIDASI'];
    KDMP.ui.dom.isi(kop('LABA RUGI KONSOLIDASI') + '<h4>Bulan ' + NAMA_BULAN[m - 1] + '</h4>' + tabelLaporan(a.rows, a.cols, judul, { j: UNIT.length + 1, k: a.ek }) + '<h4>s.d. bulan ini</h4>' + tabelLaporan(b.rows, b.cols, judul, { j: UNIT.length + 1, k: b.ek }));
  }

  function statusUnit(k, sekarang) {
    const d = app.data;
    const u = d.units[k];
    const im = d.imp && d.imp[k];
    if (!u || (!im && !(u.rows && u.rows.length))) return '<span class=no>belum ada data</span>';
    if (!im) return u.rows.length + ' baris — terbaca langsung dari browser ini <span class=ok>(terbaru)</span>';
    const t = u.ts || u.impT || 0;
    const hari = Math.floor((sekarang - t) / 864e5);
    return u.rows.length + ' baris — paket diekspor ' + (u.tgl || '') + (u.ts ? '' : ' (waktu ekspor tidak tercatat)') +
      (sekarang - t > KADALUWARSA ? ' <b class=no>⚠ sudah ' + hari + ' hari, minta unit ekspor ulang</b>' : ' <span class=ok>(terbaru)</span>') +
      ' <a href=# ' + klik('paket.hapusImpor', { u: k }) + '>[hapus impor]</a>';
  }

  function renderDataUnit() {
    app.data.units = app.data.units || {};
    const sekarang = Date.now();
    const L = UNIT.map((k) => '<tr><td><b>' + esc(k) + '</b><br><small>' + esc(KDMP.config.unit[k].name) + '</small></td><td>' + statusUnit(k, sekarang) + '</td></tr>').join('');
    KDMP.ui.dom.isi(`<div class=bar>${isianIdentitas()}<button ${klik('backup.unduh')}>Unduh Backup Database (.json)</button><label>Pulihkan backup <input type=file accept=.json ${ubah('backup.pulihkan')}></label><button ${klik('sandi.gantiAdmin')}>Ganti sandi Admin</button><button ${klik('sandi.resetUnit')}>Reset sandi unit</button><button ${klik('sesi.keluar')}>Keluar</button></div>
<div id=dz style="border:2px dashed #1F3864;background:#fff;padding:16px;text-align:center;margin:10px 0" ${seret('paket.imporKonsol')}><b>Impor database unit</b><br>Pilih atau tarik file <b>Backup Database (.json)</b> atau paket <code>.kdmp.json</code> dari ${esc(UNIT.join(', '))} sekaligus (boleh sekali pilih beberapa file). Unit tambahan yang belum dikenal di komputer ini ikut dikenali otomatis dari berkasnya. Rumus tetap dihitung ulang otomatis dari jurnal tiap unit.<br><br><input type=file multiple accept=.json ${ubah('paket.imporKonsol')}></div>${KDMP.app.paket.ambilHasilImpor()}
<table style=width:auto><tr><th>Unit</th><th>Status data</th></tr>${L}</table>
<details style="background:#fff;padding:10px 14px;margin:10px 0;border-left:4px solid #1F3864"><summary><b>Tambah unit usaha baru</b></summary><p class=c>Unit baru langsung muncul di layar login, kolom konsolidasi, dan impor. Di komputer unit tersebut, tambahkan unit yang sama (kode sama) lewat tautan <i>+ Tambah unit usaha baru</i> di layar login, lalu ekspor paketnya untuk diimpor di sini.</p>${KDMP.app.unitBaru.formHtml(false)}</details>
<p class=c>Alur: unit login → tab Data → <b>Unduh Backup Database (.json)</b> (atau Ekspor paket) → kirim file → bendahara impor di sini. Tiap unit menghitung Buku Besar, Neraca Saldo, Laba Rugi, Neraca, dan Arus Kas dari jurnalnya sendiri; konsolidasi hanya menjumlahkan hasilnya. Neraca &amp; Laba Rugi Konsolidasi terhitung otomatis. Paket lebih dari 7 hari ditandai peringatan. Paket hanya bisa dibuka bila <b>sandi Admin sama</b> di semua komputer. Data unit yang dipakai di browser/komputer yang sama terbaca otomatis tanpa impor.</p>`);
    KDMP.ui.dom.tambahDiAkhir(KDMP.app.panelDb.html());
  }

  /** Peringatan di atas tab konsolidasi bila data unit belum ada atau paketnya usang. */
  function spanduk() {
    if (!app.konsol || !app.data.units) return '';
    const m = [];
    for (const k of UNIT) {
      const u = app.data.units[k];
      const im = app.data.imp && app.data.imp[k];
      if (!u || (!im && !(u.rows && u.rows.length))) m.push(k + ': belum ada data');
      else if (im) {
        const t = u.ts || u.impT || 0;
        if (Date.now() - t > KADALUWARSA) m.push(k + ': paket sudah ' + Math.floor((Date.now() - t) / 864e5) + ' hari — minta ekspor ulang');
      }
    }
    return m.length ? '<p class=c style="color:#A4161F;font-weight:bold">⚠ Konsolidasi belum lengkap/terbaru — ' + m.join('; ') + '. Buka tab Data Unit.</p>' : '';
  }

  KDMP.ui.aksi.daftar({
    'paket.hapusImpor': (el) => {
      delete app.data.imp[arg(el, 'u')];
      KDMP.app.simpan.jadwalkan();
      setTimeout(() => location.reload(), 600);
    }
  });

  KDMP.app.tab['Neraca Konsolidasi'] = { render: renderNeraca };
  KDMP.app.tab['Laba Rugi Konsolidasi'] = { render: renderLabaRugi };
  KDMP.app.tab['Data Unit'] = { render: renderDataUnit };
  KDMP.fitur.spandukKonsolidasi = spanduk;
  KDMP.fitur.KADALUWARSA = KADALUWARSA;
})(globalThis.KDMP);
