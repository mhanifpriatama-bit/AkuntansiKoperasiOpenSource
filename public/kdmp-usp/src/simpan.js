/* Penyimpanan terenkripsi: IndexedDB + AES-GCM, kunci dari kata sandi (PBKDF2-SHA256). Hanya untuk browser. */
(function (root) {
  'use strict';
  const NAMA = 'kdmp-usp', TOKO = 'kv', KUNCI = 'data', ITER = 200000;
  const b64 = (buf) => { let s = ''; new Uint8Array(buf).forEach((b) => (s += String.fromCharCode(b))); return btoa(s); };
  const dariB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const buka = () => new Promise((ok, no) => { const r = indexedDB.open(NAMA, 1); r.onupgradeneeded = () => r.result.createObjectStore(TOKO); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const ambil = async () => { const db = await buka(); return new Promise((ok, no) => { const r = db.transaction(TOKO).objectStore(TOKO).get(KUNCI); r.onsuccess = () => ok(r.result || null); r.onerror = () => no(r.error); }); };
  const taruh = async (v) => { const db = await buka(); return new Promise((ok, no) => { const t = db.transaction(TOKO, 'readwrite'); t.objectStore(TOKO).put(v, KUNCI); t.oncomplete = ok; t.onerror = () => no(t.error); }); };

  async function turunkan(sandi, garam) {
    const dasar = await crypto.subtle.importKey('raw', new TextEncoder().encode(sandi), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: garam, iterations: ITER, hash: 'SHA-256' }, dasar, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function kunci(sandi, garam) { return { kunci: await turunkan(sandi, garam), garam }; }
  async function enkripsi(k, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k.kunci, new TextEncoder().encode(JSON.stringify(obj)));
    return { v: 1, garam: b64(k.garam), iv: b64(iv), c: b64(c) };
  }
  async function dekripsi(k, rec) {
    const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: dariB64(rec.iv) }, k.kunci, dariB64(rec.c));
    return JSON.parse(new TextDecoder().decode(p));
  }
  root.SIMPAN = {
    ada: async () => !!(await ambil()),
    /** Buat basis data baru dengan sandi baru. */
    async baru(sandi, data) { const k = await kunci(sandi, crypto.getRandomValues(new Uint8Array(16))); await taruh(await enkripsi(k, data)); return k; },
    /** Buka dengan sandi; melempar galat bila sandi salah. */
    async masuk(sandi) { const rec = await ambil(); const k = await kunci(sandi, dariB64(rec.garam)); return { k, data: await dekripsi(k, rec) }; },
    async tulis(k, data) { await taruh(await enkripsi(k, data)); },
    async mentah() { return ambil(); },
    /** Memulihkan berkas cadangan (sandi harus sama dengan saat dibuat). */
    async pulihkan(rec, sandi) { const k = await kunci(sandi, dariB64(rec.garam)); const data = await dekripsi(k, rec); await taruh(rec); return { k, data }; }
  };
})(globalThis);
