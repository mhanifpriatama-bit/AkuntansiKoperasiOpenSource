/*
 * Backup database lengkap (semua isi IndexedDB, tetap terenkripsi) dan pemulihannya.
 * Format berkas: {app:'kdmp-full', ts, tgl, kv:{...}}. Berkas ini yang dipakai untuk memindahkan data
 * antar komputer dan untuk mengimpor unit ke Konsolidasi.
 */
(function (KDMP) {
  'use strict';
  const kv = KDMP.storage.kv;
  const ID = KDMP.config.aplikasi.idTeknis.backup;

  /** @returns {Promise<{nama:string, isi:string}>} nama berkas & isi JSON siap disimpan */
  async function buatBerkas() {
    const o = await kv.all();
    delete o.lastbak;
    return {
      nama: 'KDMP_CADANGAN_LENGKAP_' + new Date().toISOString().slice(0, 10) + '.json',
      isi: JSON.stringify({ app: ID, ts: Date.now(), tgl: new Date().toLocaleString('id-ID'), kv: o })
    };
  }

  const tandaiSudahBackup = () => kv.set('lastbak', Date.now());

  /** Mengurai & memeriksa teks berkas backup. Melempar galat bila bukan backup lengkap. */
  function bacaBerkas(teks) {
    const o = JSON.parse(teks);
    if (o.app != ID || !o.kv || !o.kv.meta) throw new Error('bukan backup lengkap');
    return o;
  }

  /** Menimpa seluruh data dengan isi backup. */
  const pulihkan = (o) => kv.setAll(o.kv);

  KDMP.storage.backup = { buatBerkas, tandaiSudahBackup, bacaBerkas, pulihkan };
})(globalThis.KDMP);
