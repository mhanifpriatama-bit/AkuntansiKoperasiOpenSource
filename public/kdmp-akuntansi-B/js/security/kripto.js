/*
 * Kripto: turunan kunci PBKDF2 (200.000 iterasi, SHA-256) dan enkripsi AES-GCM 256 bit dengan Web Crypto.
 * Format teks terenkripsi: "<iv base64>.<ciphertext base64>".
 * Tidak ada kunci/ sandi yang ditulis ke penyimpanan; hanya salt dan kunci data terbungkus.
 */
(function (KDMP) {
  'use strict';
  const subtle = crypto.subtle;
  const enkoder = new TextEncoder();

  const acak = (n) => crypto.getRandomValues(new Uint8Array(n));

  function keBase64(buf) {
    const b = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
    return btoa(s);
  }
  const dariBase64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  function gabung(daftar) {
    const o = new Uint8Array(daftar.reduce((n, x) => n + x.length, 0));
    let p = 0;
    daftar.forEach((x) => { o.set(x, p); p += x.length; });
    return o;
  }

  /** Kunci AES dari sandi + salt. */
  async function turunkanKunci(sandi, salt) {
    const k = await subtle.importKey('raw', enkoder.encode(sandi), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  /** Mengimpor 32 byte mentah sebagai kunci AES-GCM (kunci data unit). */
  const kunciDariMentah = (mentah) => subtle.importKey('raw', mentah, 'AES-GCM', false, ['encrypt', 'decrypt']);

  async function enkripsi(kunci, data) {
    const iv = acak(12);
    return keBase64(iv) + '.' + keBase64(await subtle.encrypt({ name: 'AES-GCM', iv }, kunci, data));
  }

  async function dekripsi(kunci, teks) {
    const [i, c] = teks.split('.');
    return new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: dariBase64(i) }, kunci, dariBase64(c)));
  }

  /** Enkripsi objek JS (JSON). */
  const enkripsiJson = (kunci, obj) => enkripsi(kunci, enkoder.encode(JSON.stringify(obj)));

  /** Dekripsi ke objek JS, lalu migrasi data lama ke COA versi 3. */
  const dekripsiJson = async (kunci, teks) => KDMP.core.coa.migrasiData(JSON.parse(new TextDecoder().decode(await dekripsi(kunci, teks))));

  KDMP.security.kripto = { acak, keBase64, dariBase64, gabung, turunkanKunci, kunciDariMentah, enkripsi, dekripsi, enkripsiJson, dekripsiJson };
})(globalThis.KDMP);
