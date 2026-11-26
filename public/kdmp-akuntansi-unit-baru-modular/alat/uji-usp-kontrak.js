// Uji kontrak USP tanpa browser: node alat/uji-usp-kontrak.js
// Ditulis lebih dulu dari kodenya (core/usp-kontrak.js). Bagian A menjaga contoh; bagian B menguji modul.
const fs = require('fs'), path = require('path'), as = require('assert'), crypto = require('crypto');
const contoh = JSON.parse(fs.readFileSync(path.join(__dirname, 'contoh', 'usp-data-contoh.json'), 'utf8'));
const salin = () => JSON.parse(JSON.stringify(contoh));

// ---- A. Contoh berkas konsisten (tanpa modul) ----
const J = contoh.jurnal, k = contoh.kontrol;
as.strictEqual(J.length, k.jumlahJurnal);
as.strictEqual(J.reduce((s, r) => s + r.db, 0), k.totalDebit);
as.strictEqual(J.reduce((s, r) => s + r.kr, 0), k.totalKredit);
as.strictEqual(k.totalDebit, k.totalKredit);
as.ok(J.every((r) => /^USP-\d{8}-/.test(r.no)), 'semua No Bukti berawalan USP-');
as.strictEqual(crypto.createHash('sha256').update(JSON.stringify([J])).digest('hex'), k.checksum);
// kom wajib di setiap baris kas/bank kecuali pindah kas ke kas
J.filter((r) => /^1\.1\.1\./.test(r.ak) && !/-SETOR$/.test(r.no)).forEach((r) => as.ok(r.kom, 'kom wajib: ' + r.no + ' ' + r.ak));
console.log('A. contoh berkas: OK');

// ---- B. Modul core/usp-kontrak.js ----
globalThis.window = globalThis;
const dasar = path.join(__dirname, '..', 'src');
const urut = [...fs.readFileSync(path.join(dasar, 'kerangka.html'), 'utf8').matchAll(/<!--@js (\S+?)-->/g)].map((m) => m[1]).filter((f) => /^js\/(namespace|config|core)\//.test(f) || f === 'js/namespace.js');
for (const f of urut) new Function(fs.readFileSync(path.join(dasar, f), 'utf8')).call(globalThis);
const K = globalThis.KDMP, U = K.core.uspKontrak;
as.ok(U, 'KDMP.core.uspKontrak belum ada: tulis src/js/core/usp-kontrak.js dan daftarkan di kerangka.html');

const R = (d, no, ak, db, kr, ket, kom) => ({ d, no, ak, db, kr, ket: ket || '', kom: kom || '' });
const nama = { '1.1.1.01': 'Kas Tunai', '1.1.1.02': 'Kas di Bank BRI', '1.1.2.06': 'Kredit Anggota' };
const rows = Object.entries({ '1.1.1.01': 20000000, '1.1.1.02': 10000000, '1.1.2.06': 50000000 }).map(([a, v]) => R('2026-12-31', 'SA-1', a + ' ' + nama[a], v, 0, 'Saldo awal'))
  .concat([R('2026-12-31', 'SA-1', '1.1.3.05 Dana CRK', 0, 1500000, 'Saldo awal'), R('2026-12-31', 'SA-1', '2.1.1.03 Utang Simpanan Sukarela', 0, 8000000, 'Saldo awal'),
    R('2026-12-31', 'SA-1', '3.1.1.01 Simpanan Pokok', 0, 12000000, 'Saldo awal'), R('2026-12-31', 'SA-1', '3.1.2.01 Simpanan Wajib', 0, 18000000, 'Saldo awal'), R('2026-12-31', 'SA-1', '3.1.5.01 Modal Awal', 0, 40500000, 'Saldo awal penyeimbang')]);
as.strictEqual(rows.reduce((s, r) => s + r.db - r.kr, 0), 0, 'saldo awal seimbang');
const ctx = { unit: 'USP', rows, impor: {}, templatDikenal: [contoh.idTemplat], coaAda: (kode) => !!K.core.coa.saldoNormal[kode], komponen: K.config.komponenArusKas };

(async () => {
  // Template
  const tp = U.bangunTemplat({ unit: 'USP', tahun: 2027, bulan: 1, rows, coaDaftar: K.core.coa.daftar, komponen: K.config.komponenArusKas, koperasi: 'KDMP Sinduadi', now: '2027-01-02T08:30:00+07:00', idTemplat: contoh.idTemplat });
  as.strictEqual(tp.app, 'kdmp-usp-template'); as.strictEqual(tp.dasarJasa, 'KAS'); as.strictEqual(tp.posisiSaldo, '2026-12-31');
  as.deepStrictEqual(tp.saldoReferensi, { '1.1.1.01': 20000000, '1.1.1.02': 10000000, '1.1.2.06': 50000000, '1.1.3.05': 1500000, '2.1.1.03': 8000000, '3.1.1.01': 12000000, '3.1.2.01': 18000000 });
  Object.values(tp.pemetaan).forEach((kode) => as.ok(tp.coa.some((a) => a[0] === kode), 'pemetaan harus ada di coa: ' + kode));
  as.strictEqual(tp.pemetaan.crk, '1.1.3.05'); as.deepStrictEqual(tp.komponenArusKas, K.config.komponenArusKas);
  as.strictEqual(await U.hitungChecksum(contoh.jurnal), contoh.kontrol.checksum);
  let v = await U.validasiData(salin(), ctx);
  as.deepStrictEqual(v.galat, [], JSON.stringify(v.galat)); as.deepStrictEqual(v.peringatan, [], JSON.stringify(v.peringatan));

  // Idempoten: impor dua kali sama dengan sekali; masukan tidak berubah
  const r1 = U.rencanaImpor(salin(), ctx);
  const r2 = U.rencanaImpor(salin(), Object.assign({}, ctx, { rows: r1.jurnal }));
  as.strictEqual(r1.ringkasan.jurnalBaru, 21); as.strictEqual(r2.ringkasan.jurnalDiganti, 21); as.strictEqual(r2.jurnal.length, r1.jurnal.length);
  as.strictEqual(ctx.rows.length, 8);

  // Galat yang harus terdeteksi
  let x = salin(); x.jurnal[0].db = 1700001; v = await U.validasiData(x, ctx);
  as.ok(v.galat.some((g) => g.kode === 'SEIMBANG') && v.galat.some((g) => g.kode === 'CHECKSUM'), 'debit-kredit dan checksum');
  x = salin(); x.jurnal[0].no = 'POS-20270105-SIMPAN'; v = await U.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'NOMOR'), 'awalan USP-');
  x = salin(); x.jurnal[0].kom = ''; x.kontrol.checksum = await U.hitungChecksum(x.jurnal); v = await U.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'KOM'), 'kom wajib');
  x = salin(); x.jurnal[0].d = '2027-02-01'; v = await U.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'TANGGAL'), 'tanggal luar periode');
  x = salin(); x.app = 'kdmp-pos-data'; v = await U.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'APP'), 'app salah');
  x = salin(); x.idTemplat = 'ASING'; v = await U.validasiData(x, ctx); as.ok(v.peringatan.some((g) => g.kode === 'TEMPLAT'), 'templat tidak dikenal');
  // Peringatan: saldo akhir tidak cocok dengan Buku Besar
  x = salin(); x.kontrol.saldoAkhir['1.1.3.05'] = 1; v = await U.validasiData(x, ctx); as.ok(v.peringatan.some((g) => g.kode === 'SALDO'), 'saldo referensi');
  // Baris manual tidak disentuh impor
  const manual = R('2027-01-05', 'JM-1', '1.1.1.01 Kas Tunai', 1000, 0, 'manual', K.config.komponenArusKas[2]);
  const r3 = U.rencanaImpor(salin(), Object.assign({}, ctx, { rows: rows.concat([manual]) }));
  as.ok(r3.jurnal.includes(manual), 'baris manual tetap');
  console.log('B. modul USP: OK');
})().catch((e) => { console.error('GAGAL:', e.message); process.exit(1); });
