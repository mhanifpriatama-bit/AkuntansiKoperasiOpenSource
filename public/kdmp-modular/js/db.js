/**
 * @license
 * KDMP Akuntansi - IndexedDB Storage & Snapshot Management Module
 */
import {
  $, S, K, KEY, DK, TABS, dirty, lastSave, lastSnapDay,
  setDirty, setLastSave, setLastSnapDay, setS,
  toast, esc
} from './state.js';
import { CFG, COA } from './config.js';
import { enc, E, js } from './crypto.js';

export const kv = {
  db: null,
  open() {
    return new Promise((ok, er) => {
      if (!window.indexedDB) return er(new Error('Browser ini tidak mendukung IndexedDB.'));
      const q = indexedDB.open('kdmp_akuntansi', 1);
      q.onupgradeneeded = () => { q.result.createObjectStore('s', { keyPath: 'k' }); };
      q.onsuccess = () => {
        kv.db = q.result;
        kv.db.onversionchange = () => { kv.db.close(); };
        ok();
      };
      q.onerror = () => er(q.error || new Error('Database gagal dibuka'));
      q.onblocked = () => er(new Error('Database terblokir oleh tab lain. Tutup tab lain lalu muat ulang.'));
    });
  },
  tx(mode, fn) {
    return new Promise((ok, er) => {
      let r;
      const t = kv.db.transaction('s', mode);
      try { r = fn(t.objectStore('s')); } catch (e) { return er(e); }
      t.oncomplete = () => ok(r && 'result' in r ? r.result : undefined);
      t.onabort = t.onerror = () => er(t.error || new Error('Transaksi database gagal'));
    });
  },
  async get(k) {
    const r = await this.tx('readonly', s => s.get(k));
    return r ? r.v : undefined;
  },
  set(k, v) {
    return this.tx('readwrite', s => s.put({ k, v, t: Date.now() })).then(() => true);
  },
  setP(k, v) {
    return this.set(k, v);
  },
  del(k) {
    return this.tx('readwrite', s => s.delete(k)).then(() => true);
  },
  async all(pre) {
    const o = {}, p = pre || '', rs = await this.tx('readonly', s => s.getAll());
    rs.forEach(r => {
      if (String(r.k).indexOf(p) === 0) o[r.k] = r.v;
    });
    return o;
  },
  async ver(keys) {
    const o = {}, rs = await this.tx('readonly', s => s.getAll());
    rs.forEach(r => {
      if (keys.indexOf(r.k) >= 0) o[r.k] = String(r.t);
    });
    return o;
  },
  setAll(o) {
    const t = Date.now();
    return this.tx('readwrite', s => {
      for (const k in o) s.put({ k, v: o[k], t });
    }).then(() => true);
  },
  clear() {
    return this.tx('readwrite', s => s.clear()).then(() => true);
  }
};

let tm;

export function setSt() {
  const e = $('#sv');
  if (!e) return;
  e.textContent = dirty ? 'Menyimpan\u2026' : lastSave ? 'Tersimpan ' + lastSave : 'Siap';
  e.className = 'sv ' + (dirty ? 'w' : 'k');
}

export async function pruneSnap() {
  const pre = 'snap_' + CFG.unit + '_', all = await kv.all(pre), ks = Object.keys(all).filter(k => k.startsWith(pre)).sort();
  while (ks.length > 5) await kv.del(ks.shift());
}

export async function saveNow() {
  clearTimeout(tm);
  if (!S || !DK) return;
  const d = Object.assign({}, S);
  delete d.units;
  const blob = await enc(DK, E.encode(JSON.stringify(d))), hari = new Date().toISOString().slice(0, 10);
  if (lastSnapDay != hari) {
    setLastSnapDay(hari);
    const old = await kv.get(KEY);
    if (old) await kv.setP('snap_' + CFG.unit + '_' + Date.now(), { t: Date.now(), l: 'Otomatis (sebelum perubahan pertama hari ini)', d: old });
    await pruneSnap();
  }
  await kv.setP(KEY, blob);
  setDirty(false);
  setLastSave(new Date().toLocaleTimeString('id-ID'));
  setSt();
}

export const save = () => {
  setDirty(true);
  setSt();
  clearTimeout(tm);
  tm = setTimeout(saveNow, 300);
};

export async function manualSave() {
  if (!S) return;
  await saveNow();
  toast('Data tersimpan ke database aplikasi (' + lastSave + ')');
}

export async function bakAll() {
  const o = await kv.all();
  delete o.lastbak;
  const blob = new Blob([JSON.stringify({ app: 'kdmp-full', ts: Date.now(), tgl: new Date().toLocaleString('id-ID'), kv: o })], { type: 'application/json' });
  if (window.saveAs) {
    await window.saveAs('KDMP_CADANGAN_LENGKAP_' + new Date().toISOString().slice(0, 10) + '.json', blob);
  }
  kv.set('lastbak', Date.now());
}

export function pulihFile(fl) {
  if (!fl) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const o = JSON.parse(r.result);
      if (o.app != 'kdmp-full' || !o.kv || !o.kv.meta) throw 0;
      if ((await kv.get('meta')) && !confirm('Data di database browser ini akan DITIMPA oleh file backup. Lanjut?')) return;
      await kv.setAll(o.kv);
      alert('Berhasil dipulihkan. Masuk dengan sandi LAMA Anda.');
      location.reload();
    } catch (e) {
      alert('File bukan cadangan lengkap KDMP.');
    }
  };
  r.readAsText(fl);
}

export const PUL = '<p class=c>Pernah memakai aplikasi ini? <label style="color:#1F3864;text-decoration:underline;cursor:pointer">Pulihkan dari file cadangan lengkap<input type=file accept=.json style=display:none onchange="pulihFile(this.files[0])"></label> (sandi lama tetap berlaku). <a href=# onclick="bakAll();return false" style="color:#1F3864">Unduh backup database</a></p>';

export async function snapList() {
  const el = $('#snl');
  if (!el) return;
  const pre = 'snap_' + CFG.unit + '_', all = await kv.all(pre), ks = Object.keys(all).filter(k => k.startsWith(pre)).sort().reverse();
  el.innerHTML = ks.length ? '<table style=width:auto><tr><th>Waktu</th><th>Keterangan</th><th></th></tr>' + ks.map(k => `<tr><td>${new Date(all[k].t).toLocaleString('id-ID')}</td><td>${esc(all[k].l)}</td><td><button onclick="snapRestore('${k}')">Pulihkan</button> <button onclick="snapDel('${k}')">Hapus</button></td></tr>`).join('') + '</table>' : '<p class=c>Belum ada titik pulih.</p>';
}

export async function snapUser() {
  const l = prompt('Nama titik pulih (opsional):', '');
  if (l === null) return;
  await saveNow();
  const v = await kv.get(KEY);
  await kv.setP('snap_' + CFG.unit + '_' + Date.now(), { t: Date.now(), l: l || 'Manual', d: v });
  await pruneSnap();
  toast('Titik pulih dibuat');
  snapList();
}

export async function snapDel(k) {
  if (confirm('Hapus titik pulih ini?')) {
    await kv.del(k);
    snapList();
  }
}

export async function snapRestore(k) {
  if (!confirm('Data saat ini akan DIGANTI dengan titik pulih ini. Lanjut?')) return;
  const v = await kv.get(k);
  try {
    const d = await js(DK, v.d), u = S.units;
    setS(d);
    if (u) S.units = u;
    S.sub = S.sub || {};
    $('#bln').value = S.bulan;
    $('#thn').value = S.tahun;
    await saveNow();
    toast('Data dipulihkan');
    if (window.go) window.go(TABS[0]);
  } catch (e) {
    alert('Titik pulih tidak dapat dibuka dengan sandi saat ini.');
  }
}

export function dbPanel() {
  setTimeout(snapList, 0);
  const kb = Math.round(JSON.stringify(Object.assign({}, S, { units: 0 })).length / 1024);
  return `<h4>Database aplikasi</h4><div class=bar><button class=p onclick=manualSave()>Simpan sekarang</button><button onclick=snapUser()>Buat titik pulih</button><span class=c>Terakhir tersimpan: ${lastSave || 'belum ada perubahan pada sesi ini'} \u00b7 ukuran data \u00b1${kb} KB \u00b7 setiap perubahan otomatis tersimpan; Ctrl+S untuk simpan manual</span></div><div id=snl></div>` + (K ? '' : `<h4>Master akun (COA)</h4><div class=bar><button onclick=coaExp()>Ekspor COA</button><label class=btn>Impor COA dari Admin<input type=file accept=.json style=display:none onchange="coaImp(this.files[0])"></label><span class=c>${COA.length} akun dipakai unit ini. Perubahan COA dilakukan Admin di tab Master COA.</span></div>`);
}

// Bind globals for inline onclick
Object.assign(window, {
  kv, setSt, pruneSnap, saveNow, save, manualSave, bakAll, pulihFile, PUL,
  snapList, snapUser, snapDel, snapRestore, dbPanel
});
