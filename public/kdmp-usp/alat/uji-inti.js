// Uji inti hitung USP: node alat/uji-inti.js
const as = require('assert'), fs = require('fs'), path = require('path');
const U = require('../src/inti.js');

// ---- Jadwal ----
const jml = (j, k) => j.reduce((s, a) => s + a[k], 0);
let j = U.jadwal({ pokok: 5000000, tenor: 10, metode: 'flat', suku: 0.02, tglCair: '2027-01-31' });
as.strictEqual(jml(j, 'pokok'), 5000000); as.strictEqual(jml(j, 'jasa'), 1000000);
as.strictEqual(j[0].jatuhTempo, '2027-02-28'); as.strictEqual(j[1].jatuhTempo, '2027-03-31'); // akhir bulan terjaga
j = U.jadwal({ pokok: 1000000, tenor: 3, metode: 'efektif', suku: 0.01, tglCair: '2027-01-05' });
as.deepStrictEqual(j.map((a) => a.jasa), [10000, 6667, 3333]); as.strictEqual(jml(j, 'pokok'), 1000000);
as.strictEqual(j[2].pokok, 1000000 - j[0].pokok - j[1].pokok); // sisa pembulatan ke angsuran terakhir
j = U.jadwal({ pokok: 10000000, tenor: 12, metode: 'anuitas', suku: 0.015, tglCair: '2027-01-05' });
as.strictEqual(jml(j, 'pokok'), 10000000);
const tot = j.map((a) => a.pokok + a.jasa); as.ok(Math.max(...tot.slice(0, 11)) - Math.min(...tot.slice(0, 11)) <= 1, 'anuitas tetap');
as.ok(Math.abs(tot[0] - 916800) <= 1, 'A = P.r/(1-(1+r)^-n) = ' + tot[0]);
j = U.jadwal({ pokok: 1200000, tenor: 12, metode: 'anuitas', suku: 0, tglCair: '2027-01-05' }); as.strictEqual(jml(j, 'jasa'), 0);
as.throws(() => U.jadwal({ pokok: 0, tenor: 1, metode: 'flat', suku: 0, tglCair: '2027-01-01' }));

// ---- Alokasi dan tunggakan ----
const jd = U.jadwal({ pokok: 1000000, tenor: 4, metode: 'flat', suku: 0.02, tglCair: '2027-01-05' }); // tiap bulan 250000 + 20000
let a = U.alokasi(jd, { pokok: 0, jasa: 0 }, 300000, 0);
as.strictEqual(a.jasa, 40000); as.strictEqual(a.pokok, 260000); // 20000 + 20000 jasa dua angsuran dulu, sisa 260000 ke pokok
a = U.alokasi(jd, { pokok: 0, jasa: 0 }, 300000, 50000); as.strictEqual(a.denda, 50000); // denda lebih dulu
a = U.alokasi(jd, { pokok: 1000000, jasa: 80000 }, 10000, 0); as.strictEqual(a.lebih, 10000); // melebihi tagihan
const pinj = { id: 'P1', pokok: 1000000, jadwal: jd };
let r = U.ringkasPinjaman(pinj, [], '2027-03-20', { mode: 'tetap', nilai: 5000 });
as.strictEqual(r.angsuranTunggak, 2); as.strictEqual(r.tunggakan, 540000); as.strictEqual(r.umur, 43); as.strictEqual(r.dendaDisarankan, 5000);
r = U.ringkasPinjaman(pinj, [{ id: 'a', pinjamanId: 'P1', jenis: 'angsur', tgl: '2027-02-05', pokok: 250000, jasa: 20000, denda: 0 }], '2027-02-20');
as.strictEqual(r.tunggakan, 0); as.strictEqual(r.sisaPokok, 750000); as.strictEqual(r.dendaDisarankan, 0);
// pembalik membatalkan
r = U.ringkasPinjaman(pinj, [{ id: 'a', pinjamanId: 'P1', jenis: 'angsur', tgl: '2027-02-05', pokok: 250000, jasa: 20000 }, { id: 'b', pinjamanId: 'P1', jenis: 'angsur', tgl: '2027-02-06', pokok: 250000, jasa: 20000, pembalik: true }], '2027-02-20');
as.strictEqual(r.sisaPokok, 1000000);

// ---- Saldo simpanan ----
const ts = [{ anggotaId: 'A', jenis: 'simpan', sub: 'sukarela', jumlah: 500000 }, { anggotaId: 'A', jenis: 'tarik', sub: 'sukarela', jumlah: 200000 }, { anggotaId: 'B', jenis: 'simpan', sub: 'sukarela', jumlah: 9 }];
as.strictEqual(U.saldoSimpanan(ts, 'A', 'sukarela'), 300000);

// ---- Ekspor ke kontrak: transaksi -> data USP identik dengan contoh di spesifikasi ----
const contoh = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'kdmp-akuntansi-unit-baru-modular', 'alat', 'contoh', 'usp-data-contoh.json'), 'utf8'));
const coa = [['1.1.1.01', 'Kas Tunai', 'Debit'], ['1.1.1.02', 'Kas di Bank BRI', 'Debit'], ['1.1.2.06', 'Kredit Anggota', 'Debit'], ['1.1.3.05', 'Dana CRK', 'Kredit'], ['2.1.1.03', 'Utang Simpanan Sukarela', 'Kredit'], ['3.1.1.01', 'Simpanan Pokok', 'Kredit'], ['3.1.2.01', 'Simpanan Wajib', 'Kredit'], ['4.1.3.02', 'Pendapatan Jasa Pinjaman', 'Kredit'], ['4.1.3.05', 'Pendapatan Administrasi', 'Kredit'], ['9.1.3.01', 'Pendapatan Denda', 'Kredit']];
const template = { idTemplat: contoh.idTemplat, coa, saldoReferensi: { '1.1.1.01': 20000000, '1.1.1.02': 10000000, '1.1.2.06': 50000000, '1.1.3.05': 1500000, '2.1.1.03': 8000000, '3.1.1.01': 12000000, '3.1.2.01': 18000000 },
  pemetaan: { kasTunai: '1.1.1.01', bank: '1.1.1.02', kredit: '1.1.2.06', crk: '1.1.3.05', simpananPokok: '3.1.1.01', simpananWajib: '3.1.2.01', simpananSukarela: '2.1.1.03', jasaPinjaman: '4.1.3.02', provisi: '4.1.3.05', denda: '9.1.3.01' } };
const D = '2027-01-05';
const trx = [
  { id: 1, tgl: D, jenis: 'simpan', sub: 'wajib', jumlah: 1000000, cara: 'tunai' }, { id: 2, tgl: D, jenis: 'simpan', sub: 'pokok', jumlah: 200000, cara: 'tunai' },
  { id: 3, tgl: D, jenis: 'simpan', sub: 'sukarela', jumlah: 500000, cara: 'bank' }, { id: 4, tgl: D, jenis: 'simpan', sub: 'wajib', jumlah: 500000, cara: 'tunai' },
  { id: 5, tgl: D, jenis: 'tarik', sub: 'sukarela', jumlah: 300000, cara: 'tunai' },
  { id: 6, tgl: D, jenis: 'cair', pokok: 10000000, provisi: 100000, crk: 100000, cara: 'tunai' },
  { id: 7, tgl: D, jenis: 'angsur', pokok: 1000000, jasa: 150000, denda: 50000, cara: 'tunai' }, { id: 8, tgl: D, jenis: 'angsur', pokok: 1000000, jasa: 150000, denda: 0, cara: 'bank' },
  { id: 9, tgl: D, jenis: 'adm', jumlah: 25000, cara: 'tunai' }, { id: 10, tgl: D, jenis: 'setorBank', jumlah: 5000000 }
];
(async () => {
  // sesuaikan agar total sama dengan contoh: tunai 1.3jt + 50rb denda, bank 1.0jt => pokok 1jt+1jt, jasa 150rb+150rb... tunai pokok+jasa 1.15jt?
  // Angka dipilih supaya tunai(pokok+jasa)=1.300.000 dan bank=1.000.000 (lihat di bawah)
  trx[6].pokok = 1150000; trx[6].jasa = 150000; trx[7].pokok = 850000; trx[7].jasa = 150000;
  const o = await U.bangunDataUsp({ template, trx, dari: D, sampai: D, idBatch: contoh.idBatch, dibuat: contoh.dibuat, crkPersen: 1 });
  as.deepStrictEqual(o.jurnal, contoh.jurnal);
  as.deepStrictEqual(o.kontrol, contoh.kontrol);
  as.deepStrictEqual(o, contoh);
  // Pembalik: pencairan dibalik -> baris berlawanan pada No Bukti yang sama
  const bal = trx.concat([{ id: 11, tgl: '2027-01-06', jenis: 'angsur', pokok: 850000, jasa: 150000, denda: 0, cara: 'bank', pembalik: true }]);
  const o2 = await U.bangunDataUsp({ template, trx: bal, dari: '2027-01-05', sampai: '2027-01-06', idBatch: 'B2', dibuat: contoh.dibuat });
  const hariIni = o2.jurnal.filter((r) => r.d === '2027-01-06');
  as.strictEqual(hariIni.length, 3); as.strictEqual(hariIni[0].kr, 1000000); as.strictEqual(hariIni[0].kom, U.KOM.PEL); // kas bank dikredit
  as.strictEqual(o2.kontrol.totalDebit, o2.kontrol.totalKredit);
  // Transaksi dibatalkan/di luar rentang tidak ikut
  const o3 = await U.bangunDataUsp({ template, trx: trx.concat([{ id: 12, tgl: D, jenis: 'adm', jumlah: 999, cara: 'tunai', dibatalkan: true }]), dari: D, sampai: D, idBatch: 'B3', dibuat: contoh.dibuat, crkPersen: 1 });
  as.strictEqual(o3.kontrol.checksum, contoh.kontrol.checksum);
  console.log('uji inti USP lolos');
})().catch((e) => { console.error('GAGAL', e.message); process.exit(1); });
