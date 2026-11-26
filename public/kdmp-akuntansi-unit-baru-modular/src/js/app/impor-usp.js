/*
 * Ekspor template USP dan impor data USP (tab Data, unit USP). Kontraknya ada di core/usp-kontrak.
 * Alur impor: pilih berkas -> validasi -> pratinjau -> konfirmasi -> titik pulih otomatis -> terapkan (idempoten) -> catat batch.
 */
(function (KDMP) {
  'use strict';
  const { esc, rupiah, tanggalId } = KDMP.core.format;
  const { klik, ubah } = KDMP.ui.aksi;
  const app = KDMP.app.state;
  const K = () => KDMP.core.uspKontrak;
  let tertunda = null; // {usp, namaBerkas} hasil validasi yang menunggu konfirmasi

  const aktif = () => !app.konsol && app.unit === 'USP';
  const kotak = () => document.getElementById('uspbox');
  const tampil = (h) => { const e = kotak(); if (e) e.innerHTML = h; };
  const ctxData = () => ({
    unit: app.unit, rows: app.data.rows, impor: app.data.imporUsp || {}, templatDikenal: app.data.templatUsp || [],
    coaAda: (k) => !!KDMP.core.coa.saldoNormal[k], komponen: KDMP.config.komponenArusKas
  });

  function html() {
    if (!aktif()) return '';
    return `<h4>Pertukaran data dengan aplikasi USP</h4><div class=bar><button class=p ${klik('usp.ekspor')}>Ekspor template USP (.json)</button><label>Impor data USP <input type=file accept=.json ${ubah('usp.impor')}></label></div><p class=c>Template memuat daftar akun, komponen arus kas, saldo referensi, dan pemetaan peran akun untuk periode yang sedang dibuka (${esc(app.data.tahun)}-${String(KDMP.app.bulan()).padStart(2, '0')}). Impor menggantikan baris ber-No Bukti <b>USP-</b> pada rentang tanggal berkas, jadi aman diulang. Jurnal manual tidak disentuh.</p><div id=uspbox></div>`;
  }

  async function ekspor() {
    await KDMP.app.simpan.saatIni();
    const id = (globalThis.crypto.randomUUID && globalThis.crypto.randomUUID()) || String(Date.now());
    const t = K().bangunTemplat({
      unit: app.unit, tahun: +app.data.tahun, bulan: KDMP.app.bulan(), rows: app.data.rows,
      coaDaftar: KDMP.core.coa.daftar, komponen: KDMP.config.komponenArusKas, koperasi: KDMP.config.aplikasi.namaLengkap,
      now: new Date().toISOString(), idTemplat: id
    });
    app.data.templatUsp = (app.data.templatUsp || []).concat(id);
    KDMP.app.simpan.jadwalkan();
    await KDMP.ui.berkas.simpanJson('KDMP_USP_template_' + t.periode.tahun + String(t.periode.bulan).padStart(2, '0') + '.json', t);
    KDMP.ui.pesan.toast('Template USP diekspor');
  }

  const daftar = (a, kelas) => a.length ? `<ul class=${kelas}>${a.slice(0, 50).map((x) => `<li>${esc(x.pesan)}${x.baris ? ' <span class=c>(baris ' + x.baris + ')</span>' : ''}</li>`).join('')}${a.length > 50 ? `<li>… dan ${a.length - 50} lainnya</li>` : ''}</ul>` : '';

  function pratinjau(usp, v, r, nama) {
    const s = r.ringkasan;
    let h = `<h4>Pratinjau impor: ${esc(nama)}</h4><p class=c>Batch ${esc(usp.idBatch)} · rentang ${tanggalId(usp.periode.dari)} s.d. ${tanggalId(usp.periode.sampai)}</p>`;
    if (v.galat.length) h += `<p class=no><b>${v.galat.length} galat — impor ditolak:</b></p>` + daftar(v.galat, 'no');
    if (v.peringatan.length) h += `<p><b>${v.peringatan.length} peringatan</b> (tidak menghalangi impor):</p>` + daftar(v.peringatan, 'c');
    if (!v.galat.length) {
      h += `<table><tr><th>Baris jurnal baru</th><th>Diganti</th><th>Dihapus</th><th>Total debit</th><th>Total kredit</th></tr><tr><td class=n>${s.jurnalBaru}</td><td class=n>${s.jurnalDiganti}</td><td class=n>${s.jurnalDihapus}</td><td class=n>${rupiah(s.totalDebit)}</td><td class=n>${rupiah(s.totalKredit)}</td></tr></table>`;
      h += '<table><tr><th>Jenis transaksi</th><th>Baris</th><th>Debit</th><th>Kredit</th></tr>' + Object.keys(s.perJenis).map((j) => `<tr><td>${esc(j)}</td><td class=n>${s.perJenis[j].baris}</td><td class=n>${rupiah(s.perJenis[j].debit)}</td><td class=n>${rupiah(s.perJenis[j].kredit)}</td></tr>`).join('') + '</table>';
      h += `<div class=bar><button class=p ${klik('usp.terapkan')}>Terapkan impor</button><button ${klik('usp.batal')}>Batal</button></div><p class=c>Sebelum diterapkan, titik pulih otomatis dibuat ("Sebelum impor USP ${esc(usp.idBatch)}").</p>`;
    }
    tampil(h);
  }

  async function impor(el) {
    const berkas = el.files && el.files[0];
    el.value = '';
    tertunda = null;
    if (!berkas) return;
    let usp;
    try { usp = JSON.parse(await berkas.text()); } catch (e) { return tampil('<p class=no>Berkas bukan JSON yang valid.</p>'); }
    const ctx = ctxData();
    const v = await K().validasiData(usp, ctx);
    if (v.galat.some((g) => ['APP', 'VERSI', 'PERIODE'].includes(g.kode))) return tampil(daftar(v.galat, 'no'));
    const r = K().rencanaImpor(usp, ctx);
    if (!v.galat.length) tertunda = { usp, namaBerkas: berkas.name };
    pratinjau(usp, v, r, berkas.name);
  }

  async function terapkan() {
    if (!tertunda) return;
    const { usp, namaBerkas } = tertunda;
    tertunda = null;
    const r = K().rencanaImpor(usp, ctxData());
    await KDMP.app.simpan.saatIni();
    const lama = await KDMP.storage.kv.get(app.kunci.KEY);
    if (lama) await KDMP.storage.titikPulih.buat(app.unit, 'Sebelum impor USP ' + usp.idBatch, lama);
    app.data.rows = r.jurnal;
    app.data.imporUsp = app.data.imporUsp || {};
    app.data.imporUsp[usp.idBatch] = { ts: Date.now(), dari: usp.periode.dari, sampai: usp.periode.sampai, dibuat: usp.dibuat, namaBerkas };
    KDMP.app.simpan.jadwalkan();
    const s = r.ringkasan;
    tampil(`<p class=ok><b>Impor selesai.</b> ${s.jurnalBaru + s.jurnalDiganti} baris jurnal dari batch ${esc(usp.idBatch)} diterapkan. Buka tab Jurnal, Neraca, dan Arus Kas untuk memeriksa.</p>`);
  }

  KDMP.ui.aksi.daftar({
    'usp.ekspor': () => ekspor(),
    'usp.impor': (el) => impor(el),
    'usp.terapkan': () => terapkan(),
    'usp.batal': () => { tertunda = null; tampil('<p class=c>Impor dibatalkan. Tidak ada data yang berubah.</p>'); }
  });

  KDMP.app.imporUsp = { html };
})(globalThis.KDMP);
