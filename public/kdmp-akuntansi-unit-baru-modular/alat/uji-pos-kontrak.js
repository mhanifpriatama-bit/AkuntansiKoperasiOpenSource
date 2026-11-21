// Uji logika kontrak POS tanpa browser: node alat/uji-pos-kontrak.js
const fs = require('fs'), path = require('path'), as = require('assert');
globalThis.window = globalThis;
const dasar = path.join(__dirname, '..', 'src');
const urut = [...fs.readFileSync(path.join(dasar, 'kerangka.html'), 'utf8').matchAll(/<!--@js (\S+?)-->/g)].map((m) => m[1]).filter((f) => /^js\/(namespace|config|core)\//.test(f) || f === 'js/namespace.js');
for (const f of urut) new Function(fs.readFileSync(path.join(dasar, f), 'utf8')).call(globalThis);
const K = globalThis.KDMP, P = K.core.posKontrak;

const R = (d, no, ak, db, kr, ket, kom) => ({ d, no, ak, db, kr, ket: ket || '', kom: kom || '' });
const rows = [
  R('2026-12-31', 'SA-1', '1.1.1.01 Kas Tunai', 15000000, 0, 'Saldo awal'), R('2026-12-31', 'SA-1', '1.1.1.02 Kas di Bank BRI', 5000000, 0, 'Saldo awal'),
  R('2026-12-31', 'SA-1', '1.1.2.01 Piutang Usaha', 2400000, 0, 'Saldo awal'), R('2026-12-31', 'SA-1', '1.1.4.02 Persediaan Barang dari Bulog', 3760000, 0, 'Saldo awal'),
  R('2026-12-31', 'SA-1', '2.1.3.01 Utang Usaha', 0, 800000, 'Saldo awal'), R('2026-12-31', 'SA-1', '3.1.1.01 Simpanan Pokok', 0, 25360000, 'Saldo awal')
];
const barang = [{ k: 'BRS-5KG', n: 'Beras Premium 5 kg', akun: '1.1.4.02' }];
const mutasi = [
  { d: '2026-12-31', no: 'SA', k: 'BRS-5KG', j: 'Saldo Awal', q: 40, h: 62000, ket: '' },
  { d: '2026-12-31', no: 'SA2', k: 'BRS-5KG', j: 'Saldo Awal', q: 20, h: 64000, ket: '' }
];
const komponen = K.config.komponenArusKas;
const ctx = { unit: 'Sembako', rows, barang, mutasi, impor: {}, templatDikenal: ['T1'], coaAda: (k) => !!K.core.coa.saldoNormal[k], komponen };

(async () => {
  // Template
  const t = P.bangunTemplat({ unit: 'Sembako', tahun: 2027, bulan: 1, rows, barang, mutasi, coaDaftar: K.core.coa.daftar, komponen, koperasi: 'KDMP', now: '2027-01-02T08:30:00+07:00', idTemplat: 'T1' });
  as.strictEqual(t.posisiStok, '2026-12-31'); as.strictEqual(t.stokAwal.length, 2);
  as.deepStrictEqual(t.saldoReferensi, { '1.1.1.01': 15000000, '1.1.1.02': 5000000, '1.1.2.01': 2400000, '1.1.4.02': 3760000, '2.1.3.01': 800000 });
  as.strictEqual(t.metodeHpp, 'FIFO');

  // Data POS (contoh spesifikasi)
  const J = (no, ak, db, kr, ket, kom) => R('2027-01-05', no, ak, db, kr, ket, kom);
  const jurnal = [
    J('POS-20270105-JUAL', '1.1.1.01 Kas Tunai', 1000000, 0, 'Tunai anggota', komponen[0]), J('POS-20270105-JUAL', '1.1.1.01 Kas Tunai', 500000, 0, 'Tunai non', komponen[1]),
    J('POS-20270105-JUAL', '1.1.1.02 Kas di Bank BRI', 300000, 0, 'QRIS', komponen[0]), J('POS-20270105-JUAL', '1.1.2.01 Piutang Usaha', 200000, 0, 'Kredit'),
    J('POS-20270105-JUAL', '4.1.1.01 Pendapatan Penjualan Barang Dagangan', 0, 2000000, 'Penjualan'),
    J('POS-20270105-JUAL', '5.1.1.01 Harga Pokok Penjualan Barang Dagangan', 1736000, 0, 'HPP'), J('POS-20270105-JUAL', '1.1.4.02 Persediaan Barang dari Bulog', 0, 1736000, 'HPP'),
    J('POS-20270105-BELI-001', '1.1.4.02 Persediaan Barang dari Bulog', 1980000, 0, 'Beli'), J('POS-20270105-BELI-001', '2.1.3.01 Utang Usaha', 0, 1980000, 'Beli')
  ];
  const ms = [
    { d: '2027-01-05', no: 'POS-20270105-BELI-001', k: 'BRS-5KG', j: 'Masuk', q: 30, h: 66000, nilai: 1980000, ket: '' },
    { d: '2027-01-05', no: 'POS-20270105-JUAL', k: 'BRS-5KG', j: 'Keluar', q: 28, h: 62000, nilai: 1736000, ket: '' }
  ];
  const pos = { app: 'kdmp-pos-data', versi: 1, idBatch: 'B1', idTemplat: 'T1', unit: 'Sembako', dibuat: '2027-01-06T07:45:00+07:00', periode: { dari: '2027-01-05', sampai: '2027-01-05' }, jurnal, mutasiStok: ms, barangBaru: [],
    kontrol: { jumlahJurnal: 9, jumlahMutasi: 2, totalDebit: 5716000, totalKredit: 5716000, saldoAkhir: { '1.1.1.01': 16500000, '1.1.1.02': 5300000, '1.1.2.01': 2600000, '1.1.4.02': 4004000, '2.1.3.01': 2780000 } } };
  pos.kontrol.checksum = await P.hitungChecksum(jurnal, ms, []);
  let v = await P.validasiData(pos, ctx);
  as.deepStrictEqual(v.galat, [], JSON.stringify(v.galat)); as.deepStrictEqual(v.peringatan, [], JSON.stringify(v.peringatan));

  // Idempoten: impor dua kali = sama dengan sekali
  const r1 = P.rencanaImpor(pos, ctx);
  const ctx2 = Object.assign({}, ctx, { rows: r1.jurnal, mutasi: r1.mutasi, barang: r1.barang });
  const r2 = P.rencanaImpor(pos, ctx2);
  as.strictEqual(r2.jurnal.length, r1.jurnal.length); as.strictEqual(r2.ringkasan.jurnalDiganti, 9); as.strictEqual(r1.ringkasan.jurnalBaru, 9);
  as.strictEqual(ctx.rows.length, 6); // masukan tidak berubah

  // Galat: checksum rusak, stok minus, debit-kredit tidak seimbang, akun tidak ada, tanggal luar periode
  const salin = () => JSON.parse(JSON.stringify(pos));
  let x = salin(); x.jurnal[0].db = 1000001; v = await P.validasiData(x, ctx);
  as.ok(v.galat.some((g) => g.kode === 'SEIMBANG') && v.galat.some((g) => g.kode === 'CHECKSUM'));
  x = salin(); x.mutasiStok[1].q = 500; v = await P.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'STOK'));
  x = salin(); x.jurnal[0].ak = '9.9.9.99 Ngawur'; v = await P.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'AKUN'));
  x = salin(); x.jurnal[0].d = '2027-02-01'; v = await P.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'TANGGAL'));
  x = salin(); x.unit = 'USP'; v = await P.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'UNIT'));
  x = salin(); x.jurnal[1].kom = 'Komponen Palsu'; v = await P.validasiData(x, ctx); as.ok(v.galat.some((g) => g.kode === 'KOMPONEN'));
  // Peringatan: nilai Keluar beda dari FIFO, saldo kontrol beda, template tak dikenal
  x = salin(); x.mutasiStok[1].nilai = 1000000; x.kontrol.checksum = await P.hitungChecksum(x.jurnal, x.mutasiStok, []); x.idTemplat = 'ZZ'; x.kontrol.saldoAkhir['1.1.1.01'] = 1;
  v = await P.validasiData(x, ctx); as.deepStrictEqual(v.galat, []); ['HPP', 'SALDO', 'TEMPLAT'].forEach((k) => as.ok(v.peringatan.some((w) => w.kode === k), k));
  // Retur pembelian pada lot asal
  x = salin(); x.mutasiStok.push({ d: '2027-01-05', no: 'POS-20270105-RBELI', k: 'BRS-5KG', j: 'Keluar', q: 2, h: 66000, nilai: 132000, lot: 'POS-20270105-BELI-001', ket: '' });
  x.kontrol.jumlahMutasi = 3; x.kontrol.checksum = await P.hitungChecksum(x.jurnal, x.mutasiStok, []); v = await P.validasiData(x, ctx);
  as.ok(!v.galat.some((g) => g.kode === 'STOK' || g.kode === 'LOT'), JSON.stringify(v.galat));
  console.log('uji kontrak POS lolos');
})().catch((e) => { console.error('GAGAL', e); process.exit(1); });
