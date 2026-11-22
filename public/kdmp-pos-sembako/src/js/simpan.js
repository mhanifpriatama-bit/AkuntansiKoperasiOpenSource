/*
 * Penyimpanan lokal: satu rekaman state di IndexedDB (database kdmp_pos_sembako), tertunda 300 ms setelah perubahan.
 * Tanpa enkripsi: POS dipakai di perangkat kasir; backup JSON bisa diunduh dari tab Ekspor/Impor.
 */
(function (POS) {
  'use strict';
  const NAMA = 'kdmp_pos_sembako';
  let db = null, timer = null;

  const buka = () => new Promise((ok, gagal) => {
    const r = indexedDB.open(NAMA, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('s');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => gagal(r.error);
  });
  const tx = (mode) => db.transaction('s', mode).objectStore('s');
  const req = (r) => new Promise((ok, gagal) => { r.onsuccess = () => ok(r.result); r.onerror = () => gagal(r.error); });

  const kosong = () => ({ tpl: null, barang: [], pelanggan: [], pemasok: [], tx: [], seq: 0, versi: 1 });

  async function muat() {
    try { db = await buka(); } catch (e) { db = null; return kosong(); }
    return (await req(tx('readonly').get('state'))) || kosong();
  }
  async function simpanSekarang(S) {
    clearTimeout(timer);
    if (db) await req(tx('readwrite').put(JSON.parse(JSON.stringify(S)), 'state'));
    POS.status && POS.status('Tersimpan ' + new Date().toLocaleTimeString('id-ID'));
  }
  function jadwalkan(S) {
    POS.status && POS.status('Menyimpan…');
    clearTimeout(timer);
    timer = setTimeout(() => simpanSekarang(S), 300);
  }
  async function hapusSemua() { if (db) await req(tx('readwrite').delete('state')); }

  POS.simpan = { muat, simpanSekarang, jadwalkan, kosong, hapusSemua, tersedia: () => !!db };
})(globalThis.POS = globalThis.POS || {});
