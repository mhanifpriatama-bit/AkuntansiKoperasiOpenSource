// Uji aturan transaksi USP: node alat/uji-layanan.js
const as = require('assert');
const L = require('../src/layanan.js');
const ok = (r) => { as.ok(r.ok, r.galat); return r; };
const tolak = (r, bagian) => { as.strictEqual(r.ok, false); as.ok(r.galat.includes(bagian), 'galat "' + r.galat + '" harus memuat "' + bagian + '"'); };
const T0 = { idTemplat: 'T1', periode: { tahun: 2027, bulan: 1 }, posisiSaldo: '2026-12-31',
  coa: [['1.1.1.01', 'Kas Tunai', 'Debit'], ['1.1.1.02', 'Kas di Bank BRI', 'Debit'], ['1.1.2.06', 'Kredit Anggota', 'Debit'], ['1.1.3.05', 'Dana CRK', 'Kredit'], ['2.1.1.03', 'Utang Simpanan Sukarela', 'Kredit'], ['3.1.1.01', 'Simpanan Pokok', 'Kredit'], ['3.1.2.01', 'Simpanan Wajib', 'Kredit'], ['4.1.3.02', 'Pendapatan Jasa Pinjaman', 'Kredit'], ['4.1.3.05', 'Pendapatan Administrasi', 'Kredit'], ['9.1.3.01', 'Pendapatan Denda', 'Kredit']],
  saldoReferensi: { '1.1.1.01': 20000000, '1.1.1.02': 10000000, '1.1.2.06': 0, '1.1.3.05': 0, '2.1.1.03': 0, '3.1.1.01': 0, '3.1.2.01': 0 },
  pemetaan: { kasTunai: '1.1.1.01', bank: '1.1.1.02', kredit: '1.1.2.06', crk: '1.1.3.05', simpananPokok: '3.1.1.01', simpananWajib: '3.1.2.01', simpananSukarela: '2.1.1.03', jasaPinjaman: '4.1.3.02', provisi: '4.1.3.05', denda: '9.1.3.01' } };
const H = '2027-01-31';

(async () => {
  const d = L.dataBaru(); d.template = T0;
  tolak(L.tambahAnggota(d, { nama: 'A', no: 'X1' }), 'minimal');
  tolak(L.tambahAnggota(d, { nama: 'Siti Aminah' }), 'Nomor anggota wajib');
  const ang = ok(L.tambahAnggota(d, { no: 'KMP-0123', nama: 'Siti Aminah', tglMasuk: '2027-01-02' })).anggota;
  as.strictEqual(ang.no, 'KMP-0123');
  tolak(L.tambahAnggota(d, { no: 'kmp-0123', nama: 'Orang Lain' }), 'sudah dipakai'); // pembanding tanpa membedakan huruf besar kecil, seperti POS

  // Simpanan
  tolak(L.setor(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'wajib', jumlah: 0, kasir: 'Rina' }, H), 'Jumlah');
  tolak(L.setor(d, { tgl: '2027-02-05', anggotaId: ang.id, sub: 'wajib', jumlah: 100, kasir: 'Rina' }, H), 'depan');
  tolak(L.setor(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'wajib', jumlah: 100, kasir: '' }, H), 'kasir');
  ok(L.setor(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'pokok', jumlah: 100000, kasir: 'Rina' }, H));
  ok(L.setor(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'sukarela', jumlah: 500000, kasir: 'Rina' }, H));
  tolak(L.tarik(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'sukarela', jumlah: 600000, kasir: 'Rina' }, H), 'melebihi saldo');
  tolak(L.tarik(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'pokok', jumlah: 1000, kasir: 'Rina' }, H), 'sukarela');
  ok(L.tarik(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'sukarela', jumlah: 200000, kasir: 'Rina' }, H));

  // Pinjaman: dua orang berbeda + kasir ketiga
  const pj = ok(L.ajukan(d, { anggotaId: ang.id, pokok: 5000000, tenor: 10, metode: 'flat', suku: 0.02, tgl: '2027-01-06', pengaju: 'Budi' })).pinjaman;
  tolak(L.putuskan(d, pj.id, 'budi', true), 'pengaju sendiri');
  tolak(L.cairkan(d, { pinjamanId: pj.id, tgl: '2027-01-06', kasir: 'Rina' }, H), 'belum disetujui');
  ok(L.putuskan(d, pj.id, 'Hartono', true));
  tolak(L.cairkan(d, { pinjamanId: pj.id, tgl: '2027-01-06', kasir: 'hartono' }, H), 'berbeda');
  const cair = ok(L.cairkan(d, { pinjamanId: pj.id, tgl: '2027-01-06', kasir: 'Rina' }, H)).trx;
  as.deepStrictEqual([cair.pokok, cair.provisi, cair.crk], [5000000, 50000, 50000]);
  as.strictEqual(d.pinjaman[0].status, 'aktif'); as.strictEqual(d.pinjaman[0].jadwal.length, 10);

  // Angsuran: urutan denda -> jasa -> pokok; melebihi tagihan ditolak
  tolak(L.angsur(d, { pinjamanId: pj.id, tgl: '2027-02-06', jumlah: 99999999, kasir: 'Rina' }, '2027-02-28'), 'melebihi');
  const a1 = ok(L.angsur(d, { pinjamanId: pj.id, tgl: '2027-02-06', jumlah: 600000, kasir: 'Rina' }, '2027-02-28')).trx;
  as.deepStrictEqual([a1.jasa, a1.pokok], [100000, 500000]);
  tolak(L.angsur(d, { pinjamanId: pj.id, tgl: '2027-02-06', jumlah: 100, denda: 500, kasir: 'Rina' }, '2027-02-28'), 'denda');
  as.strictEqual(L.tagihan(d, pj.id, '2027-02-06').sisaPokok, 4500000);
  tolak(L.angsur(d, { pinjamanId: pj.id, tgl: '2027-02-06', lunas: true, kasir: 'Rina' }, '2027-02-28'), 'Jasa');
  ok(L.adm(d, { tgl: '2027-01-06', anggotaId: ang.id, jumlah: 25000, kasir: 'Rina' }, H));

  // Kas: saldo sistem, selisih wajib beralasan, pengunci hari
  const sistem = L.kasTunaiSampai(d, '2027-01-05');
  as.strictEqual(sistem, 20000000 + 100000 + 500000 - 200000);
  tolak(L.setorBank(d, { tgl: '2027-01-05', jumlah: 999999999, kasir: 'Rina' }, H), 'melebihi');
  ok(L.setorBank(d, { tgl: '2027-01-05', jumlah: 5000000, kasir: 'Rina' }, H));
  tolak(L.tutupKas(d, { tgl: '2027-01-05', kasir: 'Rina', saldoFisik: 15000000 }, H), 'alasan');
  const tk = ok(L.tutupKas(d, { tgl: '2027-01-05', kasir: 'Rina', saldoFisik: 15399000, alasan: 'selisih uang receh' }, H)).tutup;
  as.strictEqual(tk.selisih, -1000);
  tolak(L.setor(d, { tgl: '2027-01-05', anggotaId: ang.id, sub: 'wajib', jumlah: 1000, kasir: 'Rina' }, H), 'ditutup');
  tolak(L.tutupKas(d, { tgl: '2027-01-05', kasir: 'Rina', saldoFisik: 1 }, H), 'sudah ditutup');

  // Pembalik: hanya sekali, wajib beralasan, pada hari terbuka
  const t1 = d.trx.find((t) => t.jenis === 'simpan' && t.sub === 'pokok');
  tolak(L.balik(d, { trxId: t1.id, tgl: '2027-01-06', kasir: 'Rina', alasan: '' }, H), 'Alasan');
  ok(L.balik(d, { trxId: t1.id, tgl: '2027-01-06', kasir: 'Rina', alasan: 'salah anggota' }, H));
  tolak(L.balik(d, { trxId: t1.id, tgl: '2027-01-06', kasir: 'Rina', alasan: 'lagi' }, H), 'sudah dibalik');
  tolak(L.balik(d, { trxId: cair.id, tgl: '2027-02-06', kasir: 'Rina', alasan: 'x' }, '2027-02-28'), 'angsuran');
  ok(L.balik(d, { trxId: a1.id, tgl: '2027-02-07', kasir: 'Rina', alasan: 'salah catat' }, '2027-02-28'));
  as.strictEqual(L.tagihan(d, pj.id, '2027-02-07').sisaPokok, 5000000);

  // Ekspor: semua hari harus tutup kas, rentang dalam bulan template
  tolak(await L.ekspor(d, { dari: '2027-01-01', sampai: '2027-01-31' }), 'belum ditutup');
  tolak(await L.ekspor(d, { dari: '2027-01-01', sampai: '2027-02-28' }), 'bulan template');
  ok(L.tutupKas(d, { tgl: '2027-01-06', kasir: 'Rina', saldoFisik: L.kasTunaiSampai(d, '2027-01-06') }, H));
  const e = ok(await L.ekspor(d, { dari: '2027-01-01', sampai: '2027-01-31', idBatch: 'B1', dibuat: '2027-02-01T08:00:00+07:00', oleh: 'Bendahara' }));
  const o = e.data;
  as.strictEqual(o.kontrol.totalDebit, o.kontrol.totalKredit); as.ok(o.kontrol.checksum.length === 64);
  as.ok(o.jurnal.every((r) => /^USP-2027010\d-/.test(r.no)));
  as.strictEqual(o.kontrol.saldoAkhir['1.1.2.06'], 5000000); // pencairan, angsuran pertama belum ada di 31 Jan (dibalik di Feb)
  as.strictEqual(d.batch.length, 1);
  as.ok(d.audit.length > 10 && d.audit.every((a) => a.ts && a.aksi), 'log audit tercatat');
  console.log('uji layanan USP lolos');
})().catch((e) => { console.error('GAGAL', e.stack.split('\n').slice(0, 3).join('\n')); process.exit(1); });
