/*
 * Kontrak pertukaran dengan aplikasi POS (spesifikasi v1.1): template (akuntansiApp -> POS) dan data POS (POS -> akuntansiApp).
 * Logika murni tanpa DOM dan tanpa state global: semua masukan lewat parameter.
 *
 *   bangunTemplat(ctx)            membuat objek template
 *   hitungChecksum(jurnal, mutasi, barangBaru)   SHA-256 heksadesimal (hanya integritas, bukan keaslian)
 *   validasiData(pos, ctx)        {galat:[], peringatan:[]}  (async karena checksum)
 *   rencanaImpor(pos, ctx)        hasil penerapan idempoten + ringkasan pratinjau (tidak mengubah masukan)
 *
 * ctx (data akuntansiApp yang dibutuhkan):
 *   unit, rows (jurnal), barang (Master Barang), mutasi (Mutasi Stok), impor (data.imporPos), templatDikenal [id],
 *   coaAda(kode)->bool, coaDaftar [[kode,nama,normal]], komponen [nama], koperasi, now (ISO), idTemplat
 */
(function (KDMP) {
  'use strict';
  const { kodeAkun, angkaAman, periodeDari } = KDMP.core.format;
  const VERSI = 1;
  const AWALAN = 'POS-';
  const TOLERANSI = 1;

  const adaPos = (no) => String(no || '').startsWith(AWALAN);
  const bulatKe = (x) => Math.round(angkaAman(x) * 100) / 100;
  const ymKe = (iso) => periodeDari(iso);
  const akhirBulanIso = (tahun, bulan) => new Date(Date.UTC(tahun, bulan, 0)).toISOString().slice(0, 10);

  /** SHA-256 (heksadesimal) dari JSON.stringify([jurnal, mutasiStok, barangBaru]) dengan urutan kunci seperti spesifikasi. */
  async function hitungChecksum(jurnal, mutasiStok, barangBaru) {
    const J = (jurnal || []).map((r) => ({ d: r.d, no: r.no, ak: r.ak, db: r.db, kr: r.kr, ket: r.ket, kom: r.kom }));
    const M = (mutasiStok || []).map((r) => ({ d: r.d, no: r.no, k: r.k, j: r.j, q: r.q, h: r.h, nilai: r.nilai, ket: r.ket, lot: r.lot }));
    const B = (barangBaru || []).map((r) => ({ k: r.k, n: r.n, akun: r.akun }));
    const buf = new TextEncoder().encode(JSON.stringify([J, M, B]));
    const h = await globalThis.crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Template untuk POS. Periode = bulan yang akan diisi; stok awal = posisi akhir bulan sebelumnya (lapisan FIFO).
   * @param {{unit, tahun, bulan, rows, barang, mutasi, coaDaftar, komponen, koperasi, now, idTemplat, pemetaan?}} c
   */
  function bangunTemplat(c) {
    const posisiStok = akhirBulanIso(c.bulan == 1 ? c.tahun - 1 : c.tahun, c.bulan == 1 ? 12 : c.bulan - 1);
    const dipakai = (kode) => kode.startsWith('1.1.1.') || kode.startsWith('1.1.2.') || kode.startsWith('1.1.4.') || kode.startsWith('2.1.3.');
    const pem = Object.assign({
      kasTunai: '1.1.1.01', bank: '1.1.1.02', penjualan: '4.1.1.01', hpp: '5.1.1.01', piutang: '1.1.2.01', utangUsaha: '2.1.3.01',
      selisihOpnameKurang: '6.1.9.12', selisihOpnameLebih: '4.1.9.02'
    }, c.pemetaan || {});
    const wajib = new Set(Object.values(pem));
    const coa = c.coaDaftar.filter((a) => dipakai(a[0]) || wajib.has(a[0])).map((a) => [a[0], a[1], a[2]]);
    const st = KDMP.core.persediaan.hitungStokFifo(c.barang, c.mutasi, posisiStok).m;
    const stokAwal = [];
    Object.keys(st).forEach((k) => st[k].lapisan.forEach((l) => stokAwal.push({ k, tgl: posisiStok, q: l.q, h: l.h, lot: l.id })));
    const bulanSaldo = c.bulan == 1 ? 12 : c.bulan - 1;
    const o = KDMP.core.saldo.hitungSaldo(c.rows, c.bulan == 1 ? c.tahun - 1 : c.tahun, bulanSaldo);
    const saldoReferensi = {};
    coa.forEach((a) => { if (dipakai(a[0]) && Math.abs(o.cum[a[0]] || 0) > 0.005) saldoReferensi[a[0]] = bulatKe(o.cum[a[0]]); });
    return {
      app: 'kdmp-pos-template', versi: VERSI, idTemplat: c.idTemplat, dibuat: c.now, unit: c.unit, koperasi: c.koperasi,
      periode: { tahun: c.tahun, bulan: c.bulan }, metodeHpp: 'FIFO', posisiStok,
      coa, komponenArusKas: c.komponen.slice(),
      barang: c.barang.filter((b) => b.k).map((b) => ({ k: b.k, n: b.n, akun: b.akun })),
      stokAwal, saldoReferensi, pemetaan: pem
    };
  }

  const tulis = (arr, tingkat, kode, pesan, baris) => arr.push({ tingkat, kode, pesan, baris });

  /** Menilai sebuah daftar mutasi lengkap dengan FIFO; mengembalikan riwayat per mutasi lewat identitas objek. */
  function nilaiFifo(barang, mutasi, batas) {
    const hasil = KDMP.core.persediaan.hitungStokFifo(barang, mutasi, batas);
    const biaya = new Map();
    Object.keys(hasil.m).forEach((k) => hasil.m[k].h.forEach((x) => biaya.set(x.t, x.cost)));
    return { hasil, biaya };
  }

  /**
   * @param {object} pos  isi berkas data POS
   * @param {object} ctx  lihat atas
   * @returns {Promise<{galat:Array, peringatan:Array}>}
   */
  async function validasiData(pos, ctx) {
    const galat = [], peringatan = [];
    const G = (kode, pesan, baris) => tulis(galat, 'galat', kode, pesan, baris);
    const W = (kode, pesan, baris) => tulis(peringatan, 'peringatan', kode, pesan, baris);

    // 1. Baca berkas
    if (!pos || typeof pos !== 'object' || pos.app !== 'kdmp-pos-data') { G('FORMAT', 'Bukan berkas data POS (app harus kdmp-pos-data).'); return { galat, peringatan }; }
    if (pos.versi !== VERSI) { G('VERSI', 'Versi berkas ' + pos.versi + ' tidak didukung (didukung: ' + VERSI + ').'); return { galat, peringatan }; }
    const jurnal = Array.isArray(pos.jurnal) ? pos.jurnal : [];
    const mutasi = Array.isArray(pos.mutasiStok) ? pos.mutasiStok : [];
    const barangBaru = Array.isArray(pos.barangBaru) ? pos.barangBaru : [];
    const per = pos.periode || {};
    if (!per.dari || !per.sampai || per.dari > per.sampai) { G('PERIODE', 'Periode tidak lengkap atau terbalik.'); return { galat, peringatan }; }

    // 2. Konteks
    if (pos.unit !== ctx.unit) G('UNIT', 'Berkas untuk unit "' + pos.unit + '", sedang login di unit "' + ctx.unit + '".');
    if (!(ctx.templatDikenal || []).includes(pos.idTemplat)) W('TEMPLAT', 'idTemplat tidak dikenal (template tidak diekspor dari data ini).');

    // 3. Jurnal
    const jumlah = {};
    const kodeKas = (k) => k.startsWith('1.1.1.');
    jurnal.forEach((r, i) => {
      const b = i + 1;
      const kode = kodeAkun(r.ak);
      if (!ctx.coaAda(kode)) G('AKUN', 'Kode akun tidak ada di COA: ' + (r.ak || '(kosong)'), b);
      if (!r.d || r.d < per.dari || r.d > per.sampai) G('TANGGAL', 'Tanggal di luar periode: ' + (r.d || '(kosong)'), b);
      if (!adaPos(r.no)) G('NOMOR', 'No Bukti harus berawalan ' + AWALAN + ': ' + (r.no || '(kosong)'), b);
      const db = angkaAman(r.db), kr = angkaAman(r.kr);
      if (db < 0 || kr < 0 || (db > 0 && kr > 0)) G('NILAI', 'db/kr negatif atau keduanya terisi.', b);
      if (r.kom) {
        if (!(ctx.komponen || []).includes(r.kom)) G('KOMPONEN', 'Komponen arus kas tidak dikenal: ' + r.kom, b);
        if (!kodeKas(kode)) G('KOMPONEN', 'kom hanya boleh pada baris kas/bank.', b);
      } else if (kodeKas(kode) && db > 0) W('KOMPONEN', 'Penerimaan kas tanpa komponen arus kas.', b);
      const s = (jumlah[r.no] = jumlah[r.no] || { db: 0, kr: 0 });
      s.db += db; s.kr += kr;
    });
    Object.keys(jumlah).forEach((no) => { if (Math.abs(jumlah[no].db - jumlah[no].kr) > 0.5) G('SEIMBANG', 'Debit ≠ kredit pada No Bukti ' + no + ' (' + jumlah[no].db + ' vs ' + jumlah[no].kr + ').'); });

    // 4. Barang dan stok
    const kodeBarang = new Set(ctx.barang.filter((b) => b.k).map((b) => b.k));
    barangBaru.forEach((b) => { if (!b.k) G('BARANG', 'barangBaru tanpa kode.'); else kodeBarang.add(b.k); });
    mutasi.forEach((r, i) => {
      const b = i + 1;
      if (!kodeBarang.has(r.k)) G('BARANG', 'Kode barang tidak ada di Master Barang maupun barangBaru: ' + r.k, b);
      if (!['Masuk', 'Keluar'].includes(r.j)) G('JENIS', 'Jenis mutasi harus Masuk atau Keluar: ' + r.j, b);
      if (!r.d || r.d < per.dari || r.d > per.sampai) G('TANGGAL', 'Tanggal mutasi di luar periode: ' + (r.d || '(kosong)'), b);
      if (!adaPos(r.no)) G('NOMOR', 'No Bukti mutasi harus berawalan ' + AWALAN + ': ' + (r.no || '(kosong)'), b);
      if (!(angkaAman(r.q) > 0)) G('NILAI', 'Jumlah (q) harus lebih dari 0.', b);
    });

    // 5. Stok setelah penggantian: tidak boleh minus, lot harus ada, nilai Keluar dibandingkan dengan FIFO
    if (!galat.length) {
      const rencana = rencanaImpor(pos, ctx);
      const masuk = new Set(rencana.mutasi.filter((t) => t.j !== 'Keluar').map((t) => t.no));
      const { hasil, biaya } = nilaiFifo(rencana.barang, rencana.mutasi, per.sampai);
      Object.keys(hasil.m).forEach((k) => { if (hasil.m[k].minus) G('STOK', 'Keluar melebihi stok pada barang ' + k + '.'); });
      rencana.mutasiBaru.forEach((t, i) => {
        if (t.j === 'Keluar' && t.lot && !masuk.has(t.lot)) G('LOT', 'lot tidak ditemukan: ' + t.lot, i + 1);
        if (t.j === 'Keluar' && t.nilai != null && biaya.has(t) && Math.abs(biaya.get(t) - angkaAman(t.nilai)) > TOLERANSI) W('HPP', 'Nilai Keluar ' + t.no + ' ' + t.k + ' (' + t.nilai + ') berbeda dari hitungan FIFO (' + Math.round(biaya.get(t)) + ').', i + 1);
      });
    }

    // 6. Total kontrol dan checksum
    const k = pos.kontrol || {};
    const td = jurnal.reduce((s, r) => s + angkaAman(r.db), 0);
    const tk = jurnal.reduce((s, r) => s + angkaAman(r.kr), 0);
    if (k.jumlahJurnal !== jurnal.length) G('KONTROL', 'jumlahJurnal ' + k.jumlahJurnal + ' ≠ ' + jurnal.length + ' baris.');
    if (k.jumlahMutasi !== mutasi.length) G('KONTROL', 'jumlahMutasi ' + k.jumlahMutasi + ' ≠ ' + mutasi.length + ' baris.');
    if (Math.abs(angkaAman(k.totalDebit) - td) > 0.5 || Math.abs(angkaAman(k.totalKredit) - tk) > 0.5) G('KONTROL', 'totalDebit/totalKredit tidak cocok dengan isi jurnal.');
    if (k.checksum !== (await hitungChecksum(jurnal, mutasi, barangBaru))) G('CHECKSUM', 'Checksum tidak cocok: berkas berubah atau rusak setelah dibuat.');

    // 7. Saldo kontrol terhadap Buku Besar setelah penerapan (peringatan)
    if (!galat.length && k.saldoAkhir) {
      const rencana = rencanaImpor(pos, ctx);
      const [t, b] = [+per.sampai.slice(0, 4), +per.sampai.slice(5, 7)];
      const o = KDMP.core.saldo.hitungSaldo(rencana.jurnal.map((r) => Object.assign({}, r)), t, b);
      Object.keys(k.saldoAkhir).forEach((kode) => {
        const bb = bulatKe(o.cum[kode] || 0);
        if (Math.abs(bb - angkaAman(k.saldoAkhir[kode])) > TOLERANSI) W('SALDO', 'Saldo ' + kode + ': POS ' + k.saldoAkhir[kode] + ', Buku Besar ' + bb + '.');
      });
    }

    // 8. Tumpang tindih dengan batch yang lebih baru
    Object.keys(ctx.impor || {}).forEach((id) => {
      const x = ctx.impor[id];
      if (id !== pos.idBatch && x.dari <= per.sampai && x.sampai >= per.dari && (x.dibuat || '') > (pos.dibuat || '')) W('TUMPANG', 'Rentang tumpang tindih dengan batch lebih baru (' + id + ').');
    });
    return { galat, peringatan };
  }

  /**
   * Hasil penerapan idempoten: baris POS- dalam periode diganti isi berkas. Tidak mengubah masukan.
   * @returns {{jurnal:Array, mutasi:Array, barang:Array, mutasiBaru:Array, ringkasan:Object}}
   */
  function rencanaImpor(pos, ctx) {
    const per = pos.periode;
    const dalam = (d) => d && d >= per.dari && d <= per.sampai;
    const jurnalPos = (pos.jurnal || []).map((r) => ({ d: r.d, no: r.no, ak: r.ak, db: angkaAman(r.db), kr: angkaAman(r.kr), ket: r.ket || '', kom: r.kom || '' }));
    const mutasiPos = (pos.mutasiStok || []).map((r) => ({ d: r.d, no: r.no, k: r.k, j: r.j, q: angkaAman(r.q), h: angkaAman(r.h), nilai: r.nilai, ket: r.ket || '', lot: r.lot || '' }));
    const lamaJ = ctx.rows.filter((r) => adaPos(r.no) && dalam(r.d));
    const lamaM = ctx.mutasi.filter((r) => adaPos(r.no) && dalam(r.d));
    const tetapJ = ctx.rows.filter((r) => !(adaPos(r.no) && dalam(r.d)));
    const tetapM = ctx.mutasi.filter((r) => !(adaPos(r.no) && dalam(r.d)));
    const barang = ctx.barang.slice();
    const kode = new Set(barang.map((b) => b.k));
    const barangTambah = (pos.barangBaru || []).filter((b) => b.k && !kode.has(b.k)).map((b) => ({ k: b.k, n: b.n || '', akun: b.akun || '' }));
    const noLama = new Set(lamaJ.map((r) => r.no)), noBaru = new Set(jurnalPos.map((r) => r.no));
    const sum = (a, f) => a.reduce((s, r) => s + f(r), 0);
    const jenis = (no) => String(no).replace(/^POS-\d{8}-/, '').replace(/-\d+$/, '');
    const perJenis = {};
    jurnalPos.forEach((r) => { const j = jenis(r.no); const x = (perJenis[j] = perJenis[j] || { baris: 0, debit: 0, kredit: 0 }); x.baris++; x.debit += r.db; x.kredit += r.kr; });
    return {
      jurnal: tetapJ.concat(jurnalPos),
      mutasi: tetapM.concat(mutasiPos),
      mutasiBaru: mutasiPos,
      barang: barang.concat(barangTambah),
      barangTambah,
      ringkasan: {
        jurnalBaru: jurnalPos.filter((r) => !noLama.has(r.no)).length,
        jurnalDiganti: lamaJ.filter((r) => noBaru.has(r.no)).length,
        jurnalDihapus: lamaJ.filter((r) => !noBaru.has(r.no)).length,
        mutasiBaru: mutasiPos.length, mutasiDihapus: lamaM.length,
        totalDebit: sum(jurnalPos, (r) => r.db), totalKredit: sum(jurnalPos, (r) => r.kr), perJenis,
        barangBaru: barangTambah.map((b) => b.k)
      }
    };
  }

  KDMP.core.posKontrak = { VERSI, AWALAN, hitungChecksum, bangunTemplat, validasiData, rencanaImpor, adaPos };
})(globalThis.KDMP);
