const test = require('node:test');
const assert = require('node:assert/strict');
const { muat } = require('./pembantu/muat');
const K = muat();
const F = K.core.format;

test('rupiah: negatif dalam kurung, nol jadi "-"', () => {
  assert.equal(F.rupiah(1250000), '1.250.000');
  assert.equal(F.rupiah(-1250000), '(1.250.000)');
  assert.equal(F.rupiah(0.4), '-');
});

test('bacaAngka membaca format Indonesia', () => {
  assert.equal(F.bacaAngka('1.250.000,50'), 1250000.5);
  assert.equal(F.bacaAngka(''), 0);
  assert.equal(F.bacaAngka('abc'), 0);
});

test('bacaTanggal: berbagai ketikan, tanggal mustahil ditolak', () => {
  assert.equal(F.bacaTanggal('15/03/2026'), '2026-03-15');
  assert.equal(F.bacaTanggal('15-3-26'), '2026-03-15');
  assert.equal(F.bacaTanggal('15032026'), '2026-03-15');
  assert.equal(F.bacaTanggal('2026-03-15'), '2026-03-15');
  assert.equal(F.bacaTanggal('31/02/2026'), '');
  assert.equal(F.bacaTanggal('bukan tanggal'), '');
});

test('periode & akhir bulan', () => {
  assert.equal(F.periodeDari('2026-03-15'), 2026 * 12 + 3);
  assert.equal(F.periodeDari(''), 0);
  assert.equal(F.akhirBulan(2028, 2), '2028-02-29'); // tahun kabisat
  assert.equal(F.akhirBulanSebelumnya(2026, 1), '2025-12-31');
  assert.equal(F.tanggalPanjang(2026, 10), '31 Oktober 2026');
});

test('esc mengamankan karakter HTML', () => {
  assert.equal(F.esc('a<b & "c"'), 'a&lt;b &amp; &quot;c&quot;');
});

test('hitungRumus: penjumlahan/pengurangan, referensi [kunci] dan E<n>', () => {
  const R = K.core.rumus;
  const nilai = { a: 100, b: 30, c: 5, 26: 7, 18: 3 };
  assert.equal(R.hitungRumus('[a]+[b]-[c]', (k) => nilai[k]), 125);
  assert.equal(R.hitungRumus('E26+E18', (k) => nilai[k]), 10);
  assert.equal(R.hitungRumus('-[c]', (k) => nilai[k]), -5);
  assert.equal(R.hitungRumus(R.bukaSum('SUM(E18:E18)+E26'), (k) => nilai[k]), 10);
});

test('hitungRumus menolak ekspresi di luar + dan - (tidak ada eval)', () => {
  assert.throws(() => K.core.rumus.hitungRumus('alert(1)', () => 0));
  assert.throws(() => K.core.rumus.hitungRumus('[a]*2', () => 1));
});
