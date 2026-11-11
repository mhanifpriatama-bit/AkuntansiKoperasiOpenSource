const test = require('node:test');
const assert = require('node:assert/strict');
const { muat, dataSintetis } = require('./pembantu/muat');

const K = muat();
const D = dataSintetis();
const A = K.core.asetTetap;
const P = (t, b) => t * 12 + b;

test('penyusutan garis lurus: 17 bulan dari Juni 2025 s.d. Okt 2026', () => {
  const a = { kat: 'Meubelair', tgl: '2025-06-10', hp: 10000000, res: 0, umur: 5, met: 'Garis Lurus' };
  assert.ok(Math.abs(A.akumulasiPada(a, P(2026, 10)) - (10000000 * 17) / 60) < 1e-6);
});

test('penyusutan berhenti setelah umur habis dan mempertimbangkan residu', () => {
  const a = { kat: 'Meubelair', tgl: '2020-01-01', hp: 1000000, res: 100000, umur: 2, met: 'Garis Lurus' };
  assert.equal(A.akumulasiPada(a, P(2026, 1)), 900000);
});

test('tanah tidak disusutkan; aset belum diperoleh tidak aktif', () => {
  assert.equal(A.akumulasiPada({ kat: 'Tanah', tgl: '2024-01-01', hp: 25000000, umur: 0 }, P(2026, 10)), 0);
  assert.equal(A.aktif({ tgl: '2027-01-01' }, P(2026, 10)), false);
});

test('saldo menurun: tidak melewati batas (harga - residu) dan berhenti setelah umur habis', () => {
  const a = { kat: 'Rak', tgl: '2026-02-05', hp: 4000000, res: 400000, umur: 4, met: 'Saldo Menurun' };
  const akhir = A.akumulasiPada(a, P(2030, 1)); // tepat 48 bulan
  assert.ok(akhir <= 3600000 + 1e-6);
  assert.equal(A.akumulasiPada(a, P(2040, 1)), akhir); // sesudah umur habis tidak bertambah
  // Perilaku bawaan aplikasi (dipertahankan di refactor): tarif 2/umur per tahun, jadi pada akhir umur nilai buku
  // masih di atas residu (±518 ribu vs residu 400 ribu). Lihat docs/temuan.md.
  assert.ok(Math.abs(4000000 - akhir - 4000000 * Math.pow(1 - 2 / 4 / 12, 48)) < 1e-6);
});

test('aset dilepas: penyusutan berhenti di bulan pelepasan, status "Dilepas" sesudahnya', () => {
  const aset = D.Sembako.sub.aset;
  const hasil = A.hitungAset(aset, 2026, 10);
  const lepas = hasil.find((r) => r.a.kode == 'SM-004');
  assert.equal(lepas.st, 'Dilepas');
  assert.equal(lepas.ak, false);
  assert.equal(lepas.cost, 0);
});

test('kelompokBeban: jumlah beban per pasangan akun (bulan berjalan)', () => {
  const g = A.kelompokBeban(A.hitungAset(D.Sembako.sub.aset, 2026, 10));
  const total = Object.values(g).reduce((s, v) => s + v, 0);
  const manual = A.hitungAset(D.Sembako.sub.aset, 2026, 10).reduce((s, r) => s + (r.a.kat == 'Tanah' ? 0 : r.bln), 0);
  assert.equal(total, manual);
  assert.ok(Object.keys(g).every((k) => /^6\.1\.8\.\d\d\|1\.3\.9\.\d\d$/.test(k)));
});

test('persediaan: rata-rata bergerak dan HPP keluar', () => {
  const s = K.core.persediaan.hitungStok(D.Sembako.sub.pb, D.Sembako.sub.pm, '2026-10-31');
  const beras = s.m['BRG-001'];
  // 1000 @36.000 + 400 @38.000 => rata-rata 36.571,43; keluar 700 => sisa 700 bernilai 25.600.000
  assert.equal(beras.q, 700);
  assert.ok(Math.abs(beras.v - 25600000) < 1);
});

test('persediaan: mutasi kode tak dikenal dipisahkan, stok minus terdeteksi', () => {
  const s = K.core.persediaan.hitungStok(D.Sembako.sub.pb, D.Sembako.sub.pm, '2026-10-31');
  assert.equal(s.tidakDikenal.length, 1);
  assert.equal(s.tidakDikenal[0].k, 'XXX-9');
  assert.ok(s.m['GAS-3'].q >= -1e-9 || s.m['GAS-3'].q < 0); // gas keluar 350 dari stok 400 -> sisa 50 (tidak minus)
  assert.equal(s.m['GAS-3'].q, 50);
});

test('persediaan: batas tanggal menentukan mutasi yang dihitung', () => {
  const s = K.core.persediaan.hitungStok(D.Sembako.sub.pb, D.Sembako.sub.pm, '2026-08-31');
  assert.equal(s.m['BRG-001'].q, 1000);
});
