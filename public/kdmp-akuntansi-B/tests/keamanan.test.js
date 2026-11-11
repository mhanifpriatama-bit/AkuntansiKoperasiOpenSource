const test = require('node:test');
const assert = require('node:assert/strict');
const { muat } = require('./pembantu/muat');

const K = muat();
const kripto = K.security.kripto;
const kunci = K.security.kunci;

test('enkripsi AES-GCM: bolak-balik berhasil, kunci salah gagal', async () => {
  const salt = kripto.acak(16);
  const k1 = await kripto.turunkanKunci('rahasia-1', salt);
  const k2 = await kripto.turunkanKunci('rahasia-2', salt);
  const teks = await kripto.enkripsiJson(k1, { rows: [{ ak: '1.1.1.01 Kas', db: 5 }], cv: 3 });
  assert.match(teks, /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/);
  const asal = await kripto.dekripsiJson(k1, teks);
  assert.equal(asal.rows[0].db, 5);
  await assert.rejects(() => kripto.dekripsiJson(k2, teks));
});

test('meta sandi: unit membuka unitnya, Admin membuka semua, sandi salah ditolak', async () => {
  const meta = await kunci.buatMeta({ Admin: 'admin-123', USP: 'usp-123', Sembako: 'sembako-123' });
  const usp = await kunci.bukaSesi(meta, 'USP', 'usp-123');
  const kons = await kunci.bukaSesi(meta, 'KONSOL', 'admin-123');
  assert.equal(Buffer.from(usp.RAW).toString('hex'), Buffer.from(kons.RAW.USP).toString('hex'));
  await assert.rejects(() => kunci.bukaSesi(meta, 'USP', 'salah'));
  await assert.rejects(() => kunci.bukaSesi(meta, 'USP', 'sembako-123'));
  await assert.rejects(() => kunci.bukaSesi(meta, 'KONSOL', 'usp-123'));
});

test('ganti sandi unit & Admin: sandi lama tidak berlaku, data lama tetap terbuka', async () => {
  const meta = await kunci.buatMeta({ Admin: 'admin-123', USP: 'usp-123', Sembako: 'sembako-123' });
  const awal = await kunci.bukaSesi(meta, 'USP', 'usp-123');
  const teks = await kripto.enkripsiJson(awal.DK, { cv: 3, rows: [] });
  await kunci.gantiSandiUnit(meta, 'USP', awal.RAW, 'usp-baru-1');
  await assert.rejects(() => kunci.bukaSesi(meta, 'USP', 'usp-123'));
  const baru = await kunci.bukaSesi(meta, 'USP', 'usp-baru-1');
  assert.equal((await kripto.dekripsiJson(baru.DK, teks)).cv, 3);

  const kons = await kunci.bukaSesi(meta, 'KONSOL', 'admin-123');
  await kunci.gantiSandiAdmin(meta, kons.RAW, 'admin-baru-1');
  await assert.rejects(() => kunci.bukaSesi(meta, 'KONSOL', 'admin-123'));
  const kons2 = await kunci.bukaSesi(meta, 'KONSOL', 'admin-baru-1');
  assert.equal(Buffer.from(kons2.RAW.Sembako).toString('hex'), Buffer.from(kons.RAW.Sembako).toString('hex'));
});
