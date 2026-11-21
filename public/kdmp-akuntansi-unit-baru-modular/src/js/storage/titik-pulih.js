/*
 * Titik pulih (snapshot) data unit di IndexedDB, kunci "snap_<unit>_<waktu>". Disimpan terenkripsi (nilai
 * yang sama dengan data unit), maksimal 5 per unit; yang tertua dihapus lebih dulu.
 */
(function (KDMP) {
  'use strict';
  const kv = KDMP.storage.kv;
  const MAKS = 5;
  const awalan = (unit) => 'snap_' + unit + '_';

  /** @returns {Promise<Array<{kunci:string,t:number,l:string,d:string}>>} urut baru -> lama */
  async function daftar(unit) {
    const semua = await kv.all(awalan(unit));
    return Object.keys(semua).filter((x) => x.startsWith(awalan(unit))).sort().reverse().map((kunci) => ({ kunci, ...semua[kunci] }));
  }

  async function pangkas(unit) {
    const semua = await kv.all(awalan(unit));
    const ks = Object.keys(semua).filter((x) => x.startsWith(awalan(unit))).sort();
    while (ks.length > MAKS) await kv.del(ks.shift());
  }

  /** @param {string} terenkripsi nilai data unit (teks terenkripsi) */
  async function buat(unit, label, terenkripsi) {
    await kv.set(awalan(unit) + Date.now(), { t: Date.now(), l: label, d: terenkripsi });
    await pangkas(unit);
  }

  KDMP.storage.titikPulih = { daftar, pangkas, buat, hapus: (kunci) => kv.del(kunci), ambil: (kunci) => kv.get(kunci) };
})(globalThis.KDMP);
