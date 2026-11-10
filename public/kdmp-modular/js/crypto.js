/**
 * @license
 * KDMP Akuntansi - Web Crypto Module
 */
import { MIG, COA0 } from './config.js';

export const b64 = b => {
  b = new Uint8Array(b);
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
  return btoa(s);
};

export const ub = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
export const E = new TextEncoder();
export const cs = crypto.subtle;
export const rnd = n => crypto.getRandomValues(new Uint8Array(n));

export async function kdf(p, salt) {
  const k = await cs.importKey('raw', E.encode(p), 'PBKDF2', false, ['deriveKey']);
  return cs.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function enc(k, d) {
  const iv = rnd(12);
  return b64(iv) + '.' + b64(await cs.encrypt({ name: 'AES-GCM', iv }, k, d));
}

export const dec = async (k, s) => {
  const [i, c] = s.split('.');
  return new Uint8Array(await cs.decrypt({ name: 'AES-GCM', iv: ub(i) }, k, ub(c)));
};

export const dek = r => cs.importKey('raw', r, 'AES-GCM', false, ['encrypt', 'decrypt']);

export function migCoa(d) {
  if (!d || typeof d != 'object' || !Array.isArray(d.rows) || d.cv == 3) return d;
  d.rows.forEach(r => {
    const p = (r.ak || '').split(' ')[0];
    if (MIG[p]) r.ak = MIG[p] + ' ' + ((COA0.find(a => a[0] == MIG[p]) || [])[1] || '');
  });
  Object.keys(d).forEach(k => {
    if (/^el/.test(k) && d[k] && typeof d[k] == 'object' && !Array.isArray(d[k])) {
      const o = {};
      Object.keys(d[k]).forEach(c => {
        const n = MIG[c] || c;
        o[n] = (o[n] || 0) + d[k][c];
      });
      d[k] = o;
    }
  });
  if (d.imp && typeof d.imp == 'object') Object.values(d.imp).forEach(migCoa);
  d.cv = 3;
  return d;
}

export const js = async (k, s) => migCoa(JSON.parse(new TextDecoder().decode(await dec(k, s))));

export const cat = a => {
  const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0));
  let p = 0;
  a.forEach(x => {
    o.set(x, p);
    p += x.length;
  });
  return o;
};

export const tokOf = async b => btoa(String.fromCharCode.apply(null, new Uint8Array(await crypto.subtle.digest('SHA-256', b))));

// Attach to window
Object.assign(window, {
  b64, ub, E, cs, rnd, kdf, enc, dec, dek, migCoa, js, cat, tokOf
});
