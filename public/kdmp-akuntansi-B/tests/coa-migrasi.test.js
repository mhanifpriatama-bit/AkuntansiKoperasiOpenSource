const test = require('node:test');
const assert = require('node:assert/strict');
const { muat } = require('./pembantu/muat');

test('kode akun: format, kelompok, duplikat', () => {
  const coa = muat().core.coa;
  assert.match(coa.galatKode('abc', -1), /Format kode/);
  assert.match(coa.galatKode('1.1.1.01', -1), /sudah ada/);
  assert.match(coa.galatKode('5.9.9.01', -1), /tidak ada dalam struktur/);
  assert.equal(coa.galatKode('6.1.9.24', -1), '');
  assert.equal(coa.galatKode('7.1.1.01', -1), ''); // golongan 7/8 bebas
});

test('saldo normal bawaan menurut golongan', () => {
  const coa = muat().core.coa;
  assert.equal(coa.saldoNormalBawaan('1.1.1.01'), 'Debit');
  assert.equal(coa.saldoNormalBawaan('2.1.1.01'), 'Kredit');
  assert.equal(coa.saldoNormalBawaan('4.1.1.01'), 'Kredit');
  assert.equal(coa.saldoNormalBawaan('6.1.1.01'), 'Debit');
  assert.equal(coa.saldoNormalBawaan('9.1.1.01'), 'Kredit'); // pendapatan non-operasional
  assert.equal(coa.saldoNormalBawaan('9.2.1.01'), 'Debit');
});

test('tambah / ubah / hapus akun menjaga peta saldo normal & memberi tahu pendengar', () => {
  const coa = muat().core.coa;
  let dipanggil = 0;
  coa.saatBerubah(() => dipanggil++);
  coa.tambah('6.1.9.24', 'Beban Uji', 'Debit');
  assert.equal(coa.nama('6.1.9.24'), 'Beban Uji');
  assert.equal(coa.saldoNormal['6.1.9.24'], 'Debit');
  const i = coa.daftar.findIndex((a) => a[0] == '6.1.9.24');
  coa.ubahSaldoNormal(i, 'Kredit');
  assert.equal(coa.saldoNormal['6.1.9.24'], 'Kredit');
  coa.hapus(i);
  assert.equal(coa.saldoNormal['6.1.9.24'], undefined);
  assert.ok(dipanggil >= 3);
});

test('terapkanAkunLama: kode kas lama dialihkan, akun lama dimasukkan ke COA', () => {
  const K = muat();
  const L = K.config.coaLegacy;
  const alih = Object.keys(L.alihKode)[0];
  const lama = Object.keys(L.akunLama)[0];
  const rows = [{ ak: alih + ' Kas lama', db: 1, kr: 0 }, { ak: lama + ' Akun lama', db: 1, kr: 0 }];
  assert.equal(K.core.coa.terapkanAkunLama(rows), true);
  assert.ok(rows[0].ak.startsWith(L.alihKode[alih] + ' '));
  assert.equal(K.core.coa.saldoNormal[lama], L.akunLama[lama][1]);
  assert.equal(K.core.coa.terapkanAkunLama(rows), false); // idempoten
});

test('migrasiData: kode lama dipetakan ke COA v3 dan ditandai cv=3 (idempoten)', () => {
  const K = muat();
  const [lama, baru] = Object.entries(K.config.coaLegacy.migrasiKode)[0];
  const d = { rows: [{ ak: lama + ' nama lama', db: 5, kr: 0 }], elX: { [lama]: 10 } };
  K.core.coa.migrasiData(d);
  assert.equal(d.cv, 3);
  assert.ok(d.rows[0].ak.startsWith(baru + ' '));
  assert.equal(d.elX[baru], 10);
  const salinan = JSON.stringify(d);
  K.core.coa.migrasiData(d);
  assert.equal(JSON.stringify(d), salinan);
});

test('dariTersimpan: versi 3 dipakai apa adanya; versi lama = bawaan + akun tambahan pengguna', () => {
  const K = muat();
  const v3 = [['1.1.1.01', 'Kas', 'Debit'], ['#v', '3', '']];
  assert.equal(JSON.stringify(K.core.coa.dariTersimpan(v3)), JSON.stringify([['1.1.1.01', 'Kas', 'Debit']]));
  const lama = K.config.coaLegacy.kodeLama.map((k) => [k, 'x', 'Debit']).concat([['6.1.9.77', 'Akun pengguna', 'Debit']]);
  const hasil = K.core.coa.dariTersimpan(lama);
  assert.equal(hasil.length, K.config.coa.length + 1);
  assert.ok(hasil.some((a) => a[0] == '6.1.9.77'));
  assert.equal(K.core.coa.dariTersimpan(null), null);
});
