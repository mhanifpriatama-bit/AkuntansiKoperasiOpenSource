/*
 * Ekspor template POS dan impor data POS (tab Data, unit yang memakai persediaan). Kontraknya ada di core/pos-kontrak.
 * Alur impor: pilih berkas -> validasi -> pratinjau -> konfirmasi -> titik pulih otomatis -> terapkan (idempoten) -> catat batch.
 */
(function (KDMP) {
  'use strict';
  const { esc, rupiah, tanggalId } = KDMP.core.format;
  const { klik, ubah } = KDMP.ui.aksi;
  const app = KDMP.app.state;
  const K = () => KDMP.core.posKontrak;
  let tertunda = null; // {pos, rencana, namaBerkas} hasil validasi yang menunggu konfirmasi

  const aktif = () => !app.konsol && KDMP.core.unit.punyaPersediaan(app.unit);
  const kotak = () => document.getElementById('posbox');
  const tampil = (h) => { const e = kotak(); if (e) e.innerHTML = h; };
  const ctxData = (extra) => Object.assign({
    unit: app.unit, rows: app.data.rows, barang: KDMP.app.sub('pb'), mutasi: KDMP.app.sub('pm'),
    impor: app.data.imporPos || {}, templatDikenal: app.data.templatPos || [],
    coaAda: (k) => !!KDMP.core.coa.saldoNormal[k], komponen: KDMP.config.komponenArusKas
  }, extra || {});
  const fifo = () => KDMP.core.persediaan.metodeUnit(app.data) === 'FIFO';
  const wajibFifo = () => alert('Pertukaran data POS memakai metode FIFO. Ubah dulu di BP Persediaan > Master Barang > "Metode biaya persediaan".');

  function html() {
    if (!aktif()) return '';
    return `<h4>Pertukaran data dengan POS</h4><div class=bar><button class=p ${klik('pos.ekspor')}>Ekspor template POS (.json)</button><label>Impor data POS <input type=file accept=.json ${ubah('pos.impor')}></label></div><p class=c>Template memuat daftar akun, barang, stok awal, dan saldo referensi untuk periode yang sedang dibuka (${esc(app.data.tahun)}-${String(KDMP.app.bulan()).padStart(2, '0')}). Impor menggantikan baris ber-No Bukti <b>POS-</b> pada rentang tanggal berkas, jadi aman diulang.</p><div id=posbox></div>`;
  }

  async function ekspor() {
    if (!fifo()) return wajibFifo();
    await KDMP.app.simpan.saatIni();
    const id = (globalThis.crypto.randomUUID && globalThis.crypto.randomUUID()) || String(Date.now());
    const t = K().bangunTemplat({
      unit: app.unit, tahun: +app.data.tahun, bulan: KDMP.app.bulan(), rows: app.data.rows, barang: KDMP.app.sub('pb'), mutasi: KDMP.app.sub('pm'),
      coaDaftar: KDMP.core.coa.daftar, komponen: KDMP.config.komponenArusKas, koperasi: KDMP.config.aplikasi.namaLengkap,
      now: new Date().toISOString(), idTemplat: id
    });
    app.data.templatPos = (app.data.templatPos || []).concat(id);
    KDMP.app.simpan.jadwalkan();
    await KDMP.ui.berkas.simpanJson('KDMP_POS_template_' + app.unit + '_' + t.periode.tahun + String(t.periode.bulan).padStart(2, '0') + '.json', t);
    KDMP.ui.pesan.toast('Template POS diekspor');
  }

  const daftar = (a, kelas) => a.length ? `<ul class=${kelas}>${a.slice(0, 50).map((x) => `<li>${esc(x.pesan)}${x.baris ? ' <span class=c>(baris ' + x.baris + ')</span>' : ''}</li>`).join('')}${a.length > 50 ? `<li>… dan ${a.length - 50} lainnya</li>` : ''}</ul>` : '';

  function pratinjau(pos, v, r, nama) {
    const s = r.ringkasan;
    let h = `<h4>Pratinjau impor: ${esc(nama)}</h4><p class=c>Batch ${esc(pos.idBatch)} · rentang ${tanggalId(pos.periode.dari)} s.d. ${tanggalId(pos.periode.sampai)}</p>`;
    if (v.galat.length) h += `<p class=no><b>${v.galat.length} galat — impor ditolak:</b></p>` + daftar(v.galat, 'no');
    if (v.peringatan.length) h += `<p><b>${v.peringatan.length} peringatan</b> (tidak menghalangi impor):</p>` + daftar(v.peringatan, 'c');
    if (!v.galat.length) {
      h += `<table><tr><th>Baris jurnal baru</th><th>Diganti</th><th>Dihapus</th><th>Mutasi stok baru</th><th>Mutasi POS lama dihapus</th><th>Total debit</th><th>Total kredit</th></tr><tr><td class=n>${s.jurnalBaru}</td><td class=n>${s.jurnalDiganti}</td><td class=n>${s.jurnalDihapus}</td><td class=n>${s.mutasiBaru}</td><td class=n>${s.mutasiDihapus}</td><td class=n>${rupiah(s.totalDebit)}</td><td class=n>${rupiah(s.totalKredit)}</td></tr></table>`;
      h += '<table><tr><th>Jenis transaksi</th><th>Baris</th><th>Debit</th><th>Kredit</th></tr>' + Object.keys(s.perJenis).map((j) => `<tr><td>${esc(j)}</td><td class=n>${s.perJenis[j].baris}</td><td class=n>${rupiah(s.perJenis[j].debit)}</td><td class=n>${rupiah(s.perJenis[j].kredit)}</td></tr>`).join('') + '</table>';
      if (s.barangBaru.length) h += `<p>Barang baru ditambahkan ke Master Barang: <b>${s.barangBaru.map(esc).join(', ')}</b>. Periksa akun persediaannya.</p>`;
      h += `<div class=bar><button class=p ${klik('pos.terapkan')}>Terapkan impor</button><button ${klik('pos.batal')}>Batal</button></div><p class=c>Sebelum diterapkan, titik pulih otomatis dibuat ("Sebelum impor POS ${esc(pos.idBatch)}").</p>`;
    }
    tampil(h);
  }

  async function impor(el) {
    const berkas = el.files && el.files[0];
    el.value = '';
    tertunda = null;
    if (!berkas) return;
    if (!fifo()) return wajibFifo();
    let pos;
    try { pos = JSON.parse(await berkas.text()); } catch (e) { return tampil('<p class=no>Berkas bukan JSON yang valid.</p>'); }
    const ctx = ctxData();
    const v = await K().validasiData(pos, ctx);
    if (v.galat.some((g) => ['FORMAT', 'VERSI', 'PERIODE'].includes(g.kode))) return tampil(daftar(v.galat, 'no'));
    const r = K().rencanaImpor(pos, ctx);
    if (!v.galat.length) tertunda = { pos, namaBerkas: berkas.name };
    pratinjau(pos, v, r, berkas.name);
  }

  async function terapkan() {
    if (!tertunda) return;
    const { pos, namaBerkas } = tertunda;
    tertunda = null;
    const r = K().rencanaImpor(pos, ctxData());
    await KDMP.app.simpan.saatIni();
    const lama = await KDMP.storage.kv.get(app.kunci.KEY);
    if (lama) await KDMP.storage.titikPulih.buat(app.unit, 'Sebelum impor POS ' + pos.idBatch, lama);
    app.data.rows = r.jurnal;
    app.data.sub.pm = r.mutasi;
    app.data.sub.pb = r.barang;
    app.data.imporPos = app.data.imporPos || {};
    app.data.imporPos[pos.idBatch] = { ts: Date.now(), dari: pos.periode.dari, sampai: pos.periode.sampai, dibuat: pos.dibuat, namaBerkas };
    KDMP.app.simpan.jadwalkan();
    const s = r.ringkasan;
    tampil(`<p class=ok><b>Impor selesai.</b> ${s.jurnalBaru + s.jurnalDiganti} baris jurnal dan ${s.mutasiBaru} mutasi stok dari batch ${esc(pos.idBatch)} diterapkan. Buka tab Jurnal, BP Persediaan, dan Neraca untuk memeriksa.</p>`);
  }

  KDMP.ui.aksi.daftar({
    'pos.ekspor': () => ekspor(),
    'pos.impor': (el) => impor(el),
    'pos.terapkan': () => terapkan(),
    'pos.batal': () => { tertunda = null; tampil('<p class=c>Impor dibatalkan. Tidak ada data yang berubah.</p>'); }
  });

  KDMP.app.imporPos = { html };
})(globalThis.KDMP);
