/*
 * Kontrak pertukaran dengan aplikasi USP (spesifikasi v1): data USP -> akuntansiApp. Logika murni, tanpa DOM.
 *
 *   bangunTemplat(c)         objek template untuk USP
 *
 *   hitungChecksum(jurnal)   SHA-256 heksadesimal atas JSON.stringify([jurnal]), urutan kunci d,no,ak,db,kr,ket,kom
 *   validasiData(usp, ctx)   {galat:[], peringatan:[]}  (async karena checksum)
 *   rencanaImpor(usp, ctx)   hasil penerapan idempoten + ringkasan pratinjau (tidak mengubah masukan)
 *
 * ctx: unit, rows (jurnal), impor, templatDikenal [id], coaAda(kode)->bool, komponen [nama]
 */
(function (KDMP) {
  'use strict';
  const { kodeAkun, angkaAman } = KDMP.core.format;
  const VERSI = 1;
  const AWALAN = 'USP-';
  const TOLERANSI = 1;

  const adaUsp = (no) => String(no || '').startsWith(AWALAN);
  const bulatKe = (x) => Math.round(angkaAman(x) * 100) / 100;
  const tulis = (arr, tingkat, kode, pesan, baris) => arr.push({ tingkat, kode, pesan, baris });
  const kodeKas = (k) => k.startsWith('1.1.1.');

  async function hitungChecksum(jurnal) {
    const J = (jurnal || []).map((r) => ({ d: r.d, no: r.no, ak: r.ak, db: r.db, kr: r.kr, ket: r.ket, kom: r.kom || undefined }));
    const buf = new TextEncoder().encode(JSON.stringify([J]));
    const h = await globalThis.crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Template untuk USP: akun yang dipakai USP, komponen arus kas, saldo referensi akhir bulan sebelumnya, dan pemetaan peran.
   * @param {{unit, tahun, bulan, rows, coaDaftar, komponen, koperasi, now, idTemplat, pemetaan?}} c
   */
  function bangunTemplat(c) {
    const pem = Object.assign({
      kasTunai: '1.1.1.01', bank: '1.1.1.02', kredit: '1.1.2.06', crk: '1.1.3.05',
      simpananPokok: '3.1.1.01', simpananWajib: '3.1.2.01', simpananSukarela: '2.1.1.03',
      jasaPinjaman: '4.1.3.02', provisi: '4.1.3.05', denda: '9.1.3.01'
    }, c.pemetaan || {});
    const wajib = new Set(Object.values(pem));
    const neraca = (k) => k.startsWith('1.1.1.') || wajib.has(k);
    const coa = c.coaDaftar.filter((a) => neraca(a[0])).map((a) => [a[0], a[1], a[2]]);
    const tSaldo = c.bulan == 1 ? c.tahun - 1 : c.tahun, bSaldo = c.bulan == 1 ? 12 : c.bulan - 1;
    const o = KDMP.core.saldo.hitungSaldo(c.rows, tSaldo, bSaldo);
    const nominal = new Set(['4', '5', '6', '9']);
    const saldoReferensi = {};
    coa.forEach((a) => { if (!nominal.has(a[0][0]) && Math.abs(o.cum[a[0]] || 0) > 0.005) saldoReferensi[a[0]] = bulatKe(o.cum[a[0]]); });
    return {
      app: 'kdmp-usp-template', versi: VERSI, idTemplat: c.idTemplat, dibuat: c.now, unit: c.unit, koperasi: c.koperasi,
      periode: { tahun: c.tahun, bulan: c.bulan }, dasarJasa: 'KAS',
      posisiSaldo: new Date(Date.UTC(tSaldo, bSaldo, 0)).toISOString().slice(0, 10),
      coa, komponenArusKas: c.komponen.slice(), saldoReferensi, pemetaan: pem
    };
  }

  async function validasiData(usp, ctx) {
    const galat = [], peringatan = [];
    const G = (kode, pesan, baris) => tulis(galat, 'galat', kode, pesan, baris);
    const W = (kode, pesan, baris) => tulis(peringatan, 'peringatan', kode, pesan, baris);

    if (!usp || typeof usp !== 'object' || usp.app !== 'kdmp-usp-data') { G('APP', 'Bukan berkas data USP (app harus kdmp-usp-data).'); return { galat, peringatan }; }
    if (usp.versi !== VERSI) { G('VERSI', 'Versi berkas ' + usp.versi + ' tidak didukung (didukung: ' + VERSI + ').'); return { galat, peringatan }; }
    const jurnal = Array.isArray(usp.jurnal) ? usp.jurnal : [];
    const per = usp.periode || {};
    if (!per.dari || !per.sampai || per.dari > per.sampai) { G('PERIODE', 'Periode tidak lengkap atau terbalik.'); return { galat, peringatan }; }

    if (usp.unit !== ctx.unit) G('UNIT', 'Berkas untuk unit "' + usp.unit + '", sedang login di unit "' + ctx.unit + '".');
    if (!(ctx.templatDikenal || []).includes(usp.idTemplat)) W('TEMPLAT', 'idTemplat tidak dikenal (template tidak diekspor dari data ini).');

    // No Bukti yang seluruh barisnya akun kas/bank = pemindahan antar-kas (setoran ke bank): tanpa komponen arus kas
    const semuaKas = {};
    jurnal.forEach((r) => { semuaKas[r.no] = (semuaKas[r.no] !== false) && kodeKas(kodeAkun(r.ak)); });
    const jumlah = {};
    jurnal.forEach((r, i) => {
      const b = i + 1;
      const kode = kodeAkun(r.ak);
      if (!ctx.coaAda(kode)) G('AKUN', 'Kode akun tidak ada di COA: ' + (r.ak || '(kosong)'), b);
      if (!r.d || r.d < per.dari || r.d > per.sampai) G('TANGGAL', 'Tanggal di luar periode: ' + (r.d || '(kosong)'), b);
      if (!adaUsp(r.no)) G('NOMOR', 'No Bukti harus berawalan ' + AWALAN + ': ' + (r.no || '(kosong)'), b);
      const db = angkaAman(r.db), kr = angkaAman(r.kr);
      if (db < 0 || kr < 0 || (db > 0 && kr > 0)) G('NILAI', 'db/kr negatif atau keduanya terisi.', b);
      if (r.kom) {
        if (!(ctx.komponen || []).includes(r.kom)) G('KOMPONEN', 'Komponen arus kas tidak dikenal: ' + r.kom, b);
        if (!kodeKas(kode)) G('KOMPONEN', 'kom hanya boleh pada baris kas/bank.', b);
      } else if (kodeKas(kode) && !semuaKas[r.no]) G('KOM', 'Baris kas/bank wajib punya komponen arus kas (kom).', b);
      const s = (jumlah[r.no] = jumlah[r.no] || { db: 0, kr: 0 });
      s.db += db; s.kr += kr;
    });
    Object.keys(jumlah).forEach((no) => { if (Math.abs(jumlah[no].db - jumlah[no].kr) > 0.5) G('SEIMBANG', 'Debit ≠ kredit pada No Bukti ' + no + ' (' + jumlah[no].db + ' vs ' + jumlah[no].kr + ').'); });

    const k = usp.kontrol || {};
    const td = jurnal.reduce((s, r) => s + angkaAman(r.db), 0);
    const tk = jurnal.reduce((s, r) => s + angkaAman(r.kr), 0);
    if (k.jumlahJurnal !== jurnal.length) G('KONTROL', 'jumlahJurnal ' + k.jumlahJurnal + ' ≠ ' + jurnal.length + ' baris.');
    if (Math.abs(angkaAman(k.totalDebit) - td) > 0.5 || Math.abs(angkaAman(k.totalKredit) - tk) > 0.5) G('KONTROL', 'totalDebit/totalKredit tidak cocok dengan isi jurnal.');
    if (k.checksum !== (await hitungChecksum(jurnal))) G('CHECKSUM', 'Checksum tidak cocok: berkas berubah atau rusak setelah dibuat.');

    if (!galat.length && k.saldoAkhir) {
      const rencana = rencanaImpor(usp, ctx);
      const [t, b] = [+per.sampai.slice(0, 4), +per.sampai.slice(5, 7)];
      const o = KDMP.core.saldo.hitungSaldo(rencana.jurnal.map((r) => Object.assign({}, r)), t, b);
      Object.keys(k.saldoAkhir).forEach((kode) => {
        const bb = bulatKe(o.cum[kode] || 0);
        if (Math.abs(bb - angkaAman(k.saldoAkhir[kode])) > TOLERANSI) W('SALDO', 'Saldo ' + kode + ': USP ' + k.saldoAkhir[kode] + ', Buku Besar ' + bb + '.');
      });
    }

    Object.keys(ctx.impor || {}).forEach((id) => {
      const x = ctx.impor[id];
      if (id !== usp.idBatch && x.dari <= per.sampai && x.sampai >= per.dari && (x.dibuat || '') > (usp.dibuat || '')) W('TUMPANG', 'Rentang tumpang tindih dengan batch lebih baru (' + id + ').');
    });
    return { galat, peringatan };
  }

  /** Baris USP- dalam periode diganti isi berkas; baris lain (termasuk manual) tidak disentuh. Tidak mengubah masukan. */
  function rencanaImpor(usp, ctx) {
    const per = usp.periode;
    const dalam = (d) => d && d >= per.dari && d <= per.sampai;
    const jurnalUsp = (usp.jurnal || []).map((r) => ({ d: r.d, no: r.no, ak: r.ak, db: angkaAman(r.db), kr: angkaAman(r.kr), ket: r.ket || '', kom: r.kom || '' }));
    const lama = ctx.rows.filter((r) => adaUsp(r.no) && dalam(r.d));
    const tetap = ctx.rows.filter((r) => !(adaUsp(r.no) && dalam(r.d)));
    const noLama = new Set(lama.map((r) => r.no)), noBaru = new Set(jurnalUsp.map((r) => r.no));
    const sum = (a, f) => a.reduce((s, r) => s + f(r), 0);
    const jenis = (no) => String(no).replace(/^USP-\d{8}-/, '').replace(/-\d+$/, '');
    const perJenis = {};
    jurnalUsp.forEach((r) => { const j = jenis(r.no); const x = (perJenis[j] = perJenis[j] || { baris: 0, debit: 0, kredit: 0 }); x.baris++; x.debit += r.db; x.kredit += r.kr; });
    return {
      jurnal: tetap.concat(jurnalUsp),
      ringkasan: {
        jurnalBaru: jurnalUsp.filter((r) => !noLama.has(r.no)).length,
        jurnalDiganti: lama.filter((r) => noBaru.has(r.no)).length,
        jurnalDihapus: lama.filter((r) => !noBaru.has(r.no)).length,
        totalDebit: sum(jurnalUsp, (r) => r.db), totalKredit: sum(jurnalUsp, (r) => r.kr), perJenis
      }
    };
  }

  KDMP.core.uspKontrak = { VERSI, AWALAN, hitungChecksum, bangunTemplat, validasiData, rencanaImpor, adaUsp };
})(window.KDMP);
