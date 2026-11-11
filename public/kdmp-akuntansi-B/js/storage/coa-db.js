/*
 * Penyimpanan Master COA di IndexedDB (kunci "coa"): dimuat saat login, disimpan setiap COA diubah.
 */
(function (KDMP) {
  'use strict';
  const kv = KDMP.storage.kv;

  async function muat() {
    const baru = KDMP.core.coa.dariTersimpan(await kv.get('coa'));
    if (baru) KDMP.core.coa.ganti(baru);
  }
  const simpan = () => kv.set('coa', KDMP.core.coa.untukDisimpan());
  const hapus = () => kv.del('coa');

  KDMP.storage.coaDb = { muat, simpan, hapus };
})(globalThis.KDMP);
