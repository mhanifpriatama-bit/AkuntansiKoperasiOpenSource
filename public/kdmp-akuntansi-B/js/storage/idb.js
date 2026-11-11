/*
 * Penyimpanan lokal berbasis IndexedDB: satu object store "s" berisi {k: kunci, v: nilai, t: waktu ubah}.
 * Semua data pengguna (jurnal, COA, metadata sandi, titik pulih) disimpan di sini; tidak ada server.
 * Kunci yang dipakai: meta, coa, d_<unit>, snap_<unit>_<waktu>, lastexp_<unit>, lastbak.
 */
(function (KDMP) {
  'use strict';
  const NAMA_DB = KDMP.config.aplikasi.idTeknis.database;

  const kv = {
    db: null,

    open() {
      return new Promise(function (ok, gagal) {
        if (!window.indexedDB) return gagal(new Error('Browser ini tidak mendukung IndexedDB.'));
        const q = indexedDB.open(NAMA_DB, 1);
        q.onupgradeneeded = () => { q.result.createObjectStore('s', { keyPath: 'k' }); };
        q.onsuccess = () => {
          kv.db = q.result;
          kv.db.onversionchange = () => { kv.db.close(); };
          ok();
        };
        q.onerror = () => gagal(q.error || new Error('Database gagal dibuka'));
        q.onblocked = () => gagal(new Error('Database terblokir oleh tab lain. Tutup tab lain lalu muat ulang.'));
      });
    },

    /** Menjalankan fn(objectStore) dalam satu transaksi; hasil request terakhir dikembalikan. */
    tx(mode, fn) {
      return new Promise(function (ok, gagal) {
        let r;
        const t = kv.db.transaction('s', mode);
        try { r = fn(t.objectStore('s')); } catch (e) { return gagal(e); }
        t.oncomplete = () => ok(r && 'result' in r ? r.result : undefined);
        t.onabort = t.onerror = () => gagal(t.error || new Error('Transaksi database gagal'));
      });
    },

    async get(k) { const r = await this.tx('readonly', (s) => s.get(k)); return r ? r.v : undefined; },
    set(k, v) { return this.tx('readwrite', (s) => s.put({ k, v, t: Date.now() })).then(() => true); },
    del(k) { return this.tx('readwrite', (s) => s.delete(k)).then(() => true); },

    /** Semua pasangan kunci->nilai yang kuncinya berawalan `awalan`. */
    async all(awalan) {
      const o = {};
      const p = awalan || '';
      const rs = await this.tx('readonly', (s) => s.getAll());
      rs.forEach((r) => { if (String(r.k).indexOf(p) === 0) o[r.k] = r.v; });
      return o;
    },

    /** Waktu ubah terakhir untuk kunci-kunci tertentu: {kunci: "ms"}. Dipakai sinkronisasi antar tab. */
    async ver(keys) {
      const o = {};
      const rs = await this.tx('readonly', (s) => s.getAll());
      rs.forEach((r) => { if (keys.indexOf(r.k) >= 0) o[r.k] = String(r.t); });
      return o;
    },

    setAll(o) {
      const t = Date.now();
      return this.tx('readwrite', (s) => { for (const k in o) s.put({ k, v: o[k], t }); }).then(() => true);
    },

    clear() { return this.tx('readwrite', (s) => s.clear()).then(() => true); }
  };

  KDMP.storage.kv = kv;
})(globalThis.KDMP);
