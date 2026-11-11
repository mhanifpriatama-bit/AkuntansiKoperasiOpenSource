/*
 * Tes angka laporan memakai data sintetis (tests/data/data-sintetis.json). Nilai yang diharapkan dihitung
 * dari rumus generator data, bukan disalin dari keluaran program:
 *   SHU 2026 USP = pendapatan 52.250.000 - beban 36.675.000 = 15.575.000; SHU Des 2025 = 500.000.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { muat, dataSintetis } = require('./pembantu/muat');

const K = muat();
const D = dataSintetis();
const { hitungSaldo, labaRugiAkun, shu, shuTahunSebelumnya } = K.core.saldo;
const { susunLaporan, perluasSpesifikasi } = K.core.laporan;
const nama = K.core.coa.nama;

function neraca(unit) {
  const o = hitungSaldo(D[unit].rows, 2026, 10);
  const lr = susunLaporan(K.config.unit[unit].LR, labaRugiAkun(o.cumA));
  const spek = perluasSpesifikasi(K.config.unit[unit].LPK, [o.M], nama);
  return { o, lr, np: susunLaporan(spek, o.M, lr.key) };
}

test('jurnal sintetis seimbang (total debit = total kredit)', () => {
  for (const u of ['USP', 'Sembako']) {
    const o = hitungSaldo(D[u].rows, 2026, 10);
    assert.equal(o.td, o.tk, u);
  }
});

test('USP: SHU kumulatif, SHU tahun lalu, dan saldo kas', () => {
  const { o } = neraca('USP');
  assert.equal(shu(o), 16075000);
  assert.equal(shuTahunSebelumnya(o), 500000);
  assert.equal(o.M['1.1.1.01'] + o.M['1.1.1.02'], 127575000);
});

test('USP: neraca balance (aset = kewajiban + ekuitas)', () => {
  const { np } = neraca('USP');
  assert.equal(np.key.tot_aset, np.key.tot_ke);
  assert.equal(np.key.tot_aset, 458575000);
});

test('Sembako: neraca balance dan laba bulan berjalan sesuai', () => {
  const { np, o } = neraca('Sembako');
  assert.equal(np.key.tot_aset, np.key.tot_ke);
  assert.equal(np.key.tot_aset, 160000000);
  assert.equal(o.M['2.1.9.01'], 20000000); // utang ke USP
});

test('periode lebih awal: akun laba rugi hanya tahun berjalan, neraca tetap kumulatif', () => {
  const o = hitungSaldo(D.USP.rows, 2026, 1);
  // Januari 2026: jasa pinjaman 4.100.000 saja (Des 2025 tidak ikut di akun laba rugi)
  assert.equal(o.cum['4.1.3.02'], 4100000);
  assert.equal(o.cumA['4.1.3.02'], 4100000 + 3500000);
  assert.equal(o.mon['4.1.3.02'], 4100000);
});

test('baris tanpa tanggal & setelah periode diabaikan', () => {
  const rows = [{ d: '', ak: '1.1.1.01 Kas Tunai', db: 999, kr: 0 }, { d: '2026-12-01', ak: '1.1.1.01 Kas Tunai', db: 5, kr: 0 }, { d: '2026-01-01', ak: '1.1.1.01 Kas Tunai', db: 7, kr: 0 }];
  const o = hitungSaldo(rows, 2026, 3);
  assert.equal(o.cum['1.1.1.01'], 7);
});

test('arus kas: saldo akhir sama dengan kas di neraca (semua kas punya komponen)', () => {
  for (const u of ['USP', 'Sembako']) {
    const o = hitungSaldo(D[u].rows, 2026, 10);
    const lak = K.core.arusKas.susunArusKas(o, K.config.arusKas);
    const kas = Object.keys(o.M).filter((c) => c.startsWith('1.1.1.')).reduce((s, c) => s + o.M[c], 0);
    assert.equal(Math.round(lak[lak.length - 1].x - kas), 0, u);
  }
});

test('komponen arus kas otomatis dari akun lawan (gaji -> Beban Administrasi)', () => {
  const rows = D.USP.rows.filter((r) => r.no == 'U-10-04');
  const m = K.core.arusKas.komponenOtomatis(rows, 2026, 2026 * 12 + 10, (k) => !!K.core.coa.saldoNormal[k]);
  const nilai = [...m.values()][0];
  assert.equal(Object.keys(nilai)[0], 'Pembayaran Beban Administrasi');
  assert.equal(nilai['Pembayaran Beban Administrasi'], 3000000);
});

test('konsolidasi neraca: eliminasi RK Piutang vs Utang ke USP = Rp 20.000.000', () => {
  const k = K.core.konsolidasi.kolomKonsolidasi(K.config.konsolidasi.LPK, 'nb', {
    unit: { USP: { rows: D.USP.rows }, Sembako: { rows: D.Sembako.rows } }, tahun: 2026, bulan: 10, eliminasiManual: {}, namaAkun: nama
  });
  const i = k.rows.findIndex((r) => r.it[1] == 'tot_aset');
  const [usp, sem, jumlah, elim, konsol] = k.cols.map((c) => c[i]);
  assert.equal(usp, 458575000);
  assert.equal(sem, 160000000);
  assert.equal(jumlah, usp + sem);
  assert.equal(elim, -20000000);
  assert.equal(konsol, 598575000);
  const j = k.rows.findIndex((r) => r.it[1] == 'tot_ke');
  assert.equal(k.cols[4][j], 598575000); // kewajiban + ekuitas juga turun 20 jt -> tetap balance
});

test('konsolidasi: eliminasi manual ditambahkan ke otomatis', () => {
  const k = K.core.konsolidasi.kolomKonsolidasi(K.config.konsolidasi.LPK, 'nb', {
    unit: { USP: { rows: D.USP.rows }, Sembako: { rows: D.Sembako.rows } }, tahun: 2026, bulan: 10, eliminasiManual: { '1.1.9.08': -1000 }, namaAkun: nama
  });
  const i = k.rows.findIndex((r) => r.it[1] == '1.1.9.08');
  assert.equal(k.cols[3][i], -20001000);
});

test('konsolidasi tetap jalan bila satu unit belum ada datanya', () => {
  const k = K.core.konsolidasi.kolomKonsolidasi(K.config.konsolidasi.LPK, 'nb', { unit: { USP: { rows: D.USP.rows } }, tahun: 2026, bulan: 10, eliminasiManual: {}, namaAkun: nama });
  const i = k.rows.findIndex((r) => r.it[1] == 'tot_aset');
  assert.equal(k.cols[1][i], 0);
  assert.equal(k.cols[0][i], 458575000);
});
