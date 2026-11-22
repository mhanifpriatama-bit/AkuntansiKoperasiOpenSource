// Uji mesin POS tanpa browser, termasuk lintas-uji dengan validasi akuntansiApp:
//   node alat/uji-mesin.js
const fs = require('fs'), path = require('path'), as = require('assert');
globalThis.window = globalThis;
const muat = (akar, daftar) => daftar.forEach((f) => new Function(fs.readFileSync(path.join(akar, f), 'utf8')).call(globalThis));
const AK = path.join(__dirname, '..', '..', 'kdmp-akuntansi-unit-baru-modular', 'src');
const urut = [...fs.readFileSync(path.join(AK, 'kerangka.html'), 'utf8').matchAll(/<!--@js (\S+?)-->/g)].map((m) => m[1]).filter((f) => /^js\/(config|core)\//.test(f) || f === 'js/namespace.js');
muat(AK, urut);
muat(path.join(__dirname, '..', 'src'), ['js/mesin.js', 'js/kontrak.js']);
const K = globalThis.KDMP, P = globalThis.POS;

(async () => {
  // --- akuntansiApp: data awal 31 Des 2026 dan template
  const R = (d, no, ak, db, kr, ket) => ({ d, no, ak, db, kr, ket: ket || '', kom: '' });
  const rows = [R('2026-12-31', 'SA-1', '1.1.1.01 Kas Tunai', 15000000, 0), R('2026-12-31', 'SA-1', '1.1.1.02 Kas di Bank BRI', 5000000, 0),
    R('2026-12-31', 'SA-1', '1.1.2.01 Piutang Usaha', 400000, 0), R('2026-12-31', 'SA-1', '1.1.4.02 Persediaan Barang dari Bulog', 3760000, 0),
    R('2026-12-31', 'SA-1', '2.1.3.01 Utang Usaha', 0, 800000), R('2026-12-31', 'SA-1', '3.1.1.01 Simpanan Pokok', 0, 23360000)];
  const barangA = [{ k: 'BRS-5KG', n: 'Beras Premium 5 kg', akun: '1.1.4.02' }, { k: 'GULA-1KG', n: 'Gula 1 kg', akun: '1.1.4.02' }];
  const mutasiA = [{ d: '2026-12-31', no: 'SA', k: 'BRS-5KG', j: 'Saldo Awal', q: 40, h: 62000, ket: '' }, { d: '2026-12-31', no: 'SA2', k: 'BRS-5KG', j: 'Saldo Awal', q: 20, h: 64000, ket: '' }];
  const komponen = K.config.komponenArusKas;
  const tpl = K.core.posKontrak.bangunTemplat({ unit: 'Sembako', tahun: 2027, bulan: 1, rows, barang: barangA, mutasi: mutasiA, coaDaftar: K.core.coa.daftar, komponen, koperasi: 'KDMP', now: '2027-01-02T08:30:00+07:00', idTemplat: 'T1' });
  const tplJson = JSON.parse(JSON.stringify(tpl));
  as.strictEqual(P.kontrak.periksaTemplat(tplJson), null);

  // --- POS: master dan transaksi
  const S = { tpl: tplJson, barang: tplJson.barang.map((b) => ({ ...b, harga: 70000 })), pelanggan: [{ id: 'p1', nama: 'Bu Sri', anggota: true, saldoAwal: 400000 }, { id: 'p2', nama: 'Umum', anggota: false, saldoAwal: 0 }],
    pemasok: [{ id: 's1', nama: 'Bulog', akun: '2.1.3.01', saldoAwal: 800000 }], tx: [] };
  let n = 0; const T = (o) => S.tx.push({ id: 't' + ++n, urut: n, ...o });
  T({ tgl: '2027-01-05', jenis: 'BELI', pemasok: 's1', faktur: '0123', item: [{ k: 'BRS-5KG', q: 30, h: 66000 }], cara: 'kredit' });
  T({ tgl: '2027-01-05', jenis: 'JUAL', pelanggan: 'p1', item: [{ k: 'BRS-5KG', q: 10, harga: 70000 }], tunai: 400000, bank: 100000, kredit: 200000 });
  T({ tgl: '2027-01-05', jenis: 'JUAL', pelanggan: null, item: [{ k: 'BRS-5KG', q: 20, harga: 70000 }], tunai: 1400000, bank: 0, kredit: 0 });
  T({ tgl: '2027-01-06', jenis: 'RJUAL', ref: 't2', pelanggan: 'p1', item: [{ k: 'BRS-5KG', q: 1 }], cara: 'tunai' });
  T({ tgl: '2027-01-07', jenis: 'PELUNASAN', pelanggan: 'p1', tunai: 300000, bank: 0 });
  T({ tgl: '2027-01-08', jenis: 'RBELI', ref: 't1', item: [{ k: 'BRS-5KG', q: 2 }], cara: 'utang' });
  T({ tgl: '2027-01-09', jenis: 'BAYAR', pemasok: 's1', jumlah: 500000, dari: 'bank' });
  T({ tgl: '2027-01-10', jenis: 'SETOR', jumlah: 1000000 });
  T({ tgl: '2027-01-11', jenis: 'OPNAME', item: [{ k: 'BRS-5KG', fisik: 27 }] });
  let H = P.mesin.hitung(S);
  as.deepStrictEqual(H.galat, [], JSON.stringify(H.galat));
  // FIFO: sisa 60 (40@62000,20@64000)+30@66000; jual 10 -> 620000; jual 20 -> 20@62000 = 1240000 (hari yang sama: 30 keluar = 30@62000 = 1860000 total)
  const jual = H.mutasi.find((m) => m.no === 'POS-20270105-JUAL');
  as.strictEqual(jual.q, 30); as.strictEqual(jual.nilai, 40 * 0 + 30 * 62000);
  const rj = H.mutasi.find((m) => m.no === 'POS-20270106-RJUAL'); as.strictEqual(rj.h, 62000);
  const rb = H.mutasi.find((m) => m.no === 'POS-20270108-RBELI-001'); as.strictEqual(rb.lot, 'POS-20270105-BELI-001'); as.strictEqual(rb.nilai, 2 * 66000);
  // Opname: stok sistem sebelum opname = 60+30-30+1-2 = 59, fisik 27 -> keluar 32
  const op = H.mutasi.find((m) => m.no === 'POS-20270111-OPNAME'); as.strictEqual(op.j, 'Keluar'); as.strictEqual(op.q, 32);
  as.strictEqual(H.piutang.p1, 400000 + 200000 - 300000); as.strictEqual(H.utang.s1, 800000 + 1980000 - 500000);

  // Lintas-uji: berkas data POS harus lolos validasi akuntansiApp tanpa galat, dan impor idempoten
  const pos = await P.kontrak.bangunData(S, H, { dari: '2027-01-05', sampai: '2027-01-11', idBatch: 'B1', now: '2027-01-12T07:00:00+07:00' });
  const berkas = JSON.parse(JSON.stringify(pos));
  const ctx = { unit: 'Sembako', rows, barang: barangA, mutasi: mutasiA, impor: {}, templatDikenal: ['T1'], coaAda: (k) => !!K.core.coa.saldoNormal[k], komponen };
  const v = await K.core.posKontrak.validasiData(berkas, ctx);
  as.deepStrictEqual(v.galat, [], JSON.stringify(v.galat));
  as.deepStrictEqual(v.peringatan.filter((w) => w.kode !== 'SALDO'), [], JSON.stringify(v.peringatan));
  // Saldo kontrol harus sama dengan Buku Besar akuntansiApp (selisih pembulatan <= Rp1 sudah ditoleransi; di sini diharapkan nol peringatan)
  as.deepStrictEqual(v.peringatan, [], JSON.stringify(v.peringatan));
  const r1 = K.core.posKontrak.rencanaImpor(berkas, ctx);
  const r2 = K.core.posKontrak.rencanaImpor(berkas, { ...ctx, rows: r1.jurnal, mutasi: r1.mutasi, barang: r1.barang });
  as.strictEqual(r2.jurnal.length, r1.jurnal.length);
  // Arus kas: seluruh kas masuk punya komponen
  const masukTanpaKom = berkas.jurnal.filter((r) => r.ak.startsWith('1.1.1.') && r.db > 0 && !r.kom);
  as.deepStrictEqual(masukTanpaKom.filter((r) => !/Setoran/.test(r.ket)), []);

  // Penolakan: stok minus dan penjualan yang tidak seimbang pembayarannya
  T({ tgl: '2027-01-12', jenis: 'JUAL', pelanggan: null, item: [{ k: 'BRS-5KG', q: 999, harga: 70000 }], tunai: 69930000, bank: 0, kredit: 0 });
  as.ok(P.mesin.hitung(S).galat.some((g) => /Stok minus/.test(g)));
  S.tx.pop(); T({ tgl: '2027-01-12', jenis: 'JUAL', pelanggan: null, item: [{ k: 'BRS-5KG', q: 1, harga: 70000 }], tunai: 1, bank: 0, kredit: 0 });
  as.ok(P.mesin.hitung(S).galat.some((g) => /tidak sama dengan total/.test(g)));
  console.log('uji mesin POS lolos');
})().catch((e) => { console.error('GAGAL', e); process.exit(1); });
