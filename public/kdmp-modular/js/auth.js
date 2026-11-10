/**
 * @license
 * KDMP Akuntansi - Authentication, Multi-user Access & Synchronization Module
 */
import {
  $, S, K, KEY, DK, RAW, PIN, META, TABS,
  setS, setK, setKEY, setDK, setRAW, setPIN, setMETA, setTABS,
  idle, setIdle, TOK, setTOK, setREG,
  lastSave, setLastSave, lastSnapDay, setLastSnapDay,
  dirty, setDirty, VER, setVER, syncT, setSyncT, KEEP
} from './state.js';
import {
  CFG, MON, LOGO, LG
} from './config.js';
import {
  kdf, enc, dec, dek, js, ub, b64, rnd, cat, tokOf
} from './crypto.js';
import {
  kv, save, PUL
} from './db.js';
import {
  loadCOA, dlist
} from './accounting-engine.js';
import {
  go
} from './ui-renderers.js';

export const US = ['USP', 'Sembako'];

export const box = h => {
  $('#ov').style.display = 'block';
  $('#ov').innerHTML = '<div class=lg><img src="' + LOGO + '" alt=""><h2>Akuntansi Koperasi Merah Putih</h2><div class=sub>Kalurahan Sinduadi</div>' + h + '<p id=er class=no></p><div class=c>Versi 9 \u00b7 Offline \u00b7 02/11/2026</div></div>';
};

export function setupUI() {
  box('<p>Pengaturan awal (sekali). Sandi minimal 6 karakter. <b>Sandi Admin</b> membuka Konsolidasi; sandi tiap unit hanya membuka unitnya. Sandi yang hilang tidak bisa dipulihkan.</p><p class=no><b>Penting:</b> isi <b>sandi Admin yang SAMA</b> di semua komputer (USP, Sembako, dan bendahara) agar paket data unit bisa diimpor ke Konsolidasi.</p>' + ['Admin', ...US].map(u => `<label>Sandi ${u}<br><input id=p_${u} type=password style=width:100%></label><br>`).join('') + '<br><button class=p onclick=doSetup()>Buat</button>' + PUL);
}

export async function doSetup() {
  const P = {};
  for (const u of ['Admin', ...US]) {
    P[u] = $('#p_' + u).value;
    if (P[u].length < 6) return $('#er').textContent = 'Sandi ' + u + ' minimal 6 karakter';
  }
  const sa = rnd(16), AK = await kdf(P.Admin, sa);
  const newMeta = { saltA: b64(sa), units: {} };
  setMETA(newMeta);
  const RW = {};
  for (const u of US) {
    const raw = rnd(32), su = rnd(16);
    RW[u] = raw;
    META.units[u] = { s: b64(su), wU: await enc(await kdf(P[u], su), raw), wA: await enc(AK, raw) };
  }
  const newReg = {};
  for (const u of US) newReg[u] = await tokOf(RW[u]);
  newReg.Admin = await tokOf(cat(US.map(u => RW[u])));
  setREG(newReg);
  try {
    await kv.set('meta', META);
    setREG(null);
    loginUI();
  } catch (e) {
    setREG(null);
    $('#er').textContent = 'Gagal: ' + (e && e.message || e) + ' (pengaturan awal mungkin sudah dibuat dari perangkat lain \u2014 muat ulang halaman).';
  }
}

export function tpw(c) {
  $('#lp').type = c.checked ? 'text' : 'password';
}

export function loginUI() {
  box('<form onsubmit="doLogin();return false"><label>Masuk sebagai<br><select id=lu style=width:100%>' + [...US, 'KONSOL'].map(u => `<option value=${u}>${u == 'KONSOL' ? 'Konsolidasi (Admin)' : CFG.U[u].name}</option>`).join('') + '</select></label><br><label>Sandi<br><input id=lp type=password style=width:100%></label><br><br><label><input type=checkbox onchange=tpw(this)> Tampilkan sandi</label><br><br><button class=p type=submit>Masuk</button></form><p class=c><a href=# onclick="rstAll();return false">Lupa sandi? Hapus semua data &amp; atur ulang</a></p>' + PUL);
  $('#lp').focus();
}

export async function rstAll() {
  if (prompt('Semua data di database aplikasi ini akan DIHAPUS permanen (unduh backup dulu bila perlu). Ketik HAPUS untuk melanjutkan:') == 'HAPUS') {
    await kv.clear();
    location.reload();
  }
}

export async function doLogin() {
  const u = $('#lu').value, p = $('#lp').value;
  try {
    if (u == 'KONSOL') {
      const dkVal = await kdf(p, ub(META.saltA));
      setDK(dkVal);
      const rawVal = {};
      for (const k of US) rawVal[k] = await dec(DK, META.units[k].wA);
      setRAW(rawVal);
    } else {
      const m = META.units[u];
      const rawVal = await dec(await kdf(p, ub(m.s)), m.wU);
      setRAW(rawVal);
      const dkVal = await dek(RAW);
      setDK(dkVal);
    }
  } catch (e) {
    return $('#er').textContent = 'Sandi salah.';
  }
  setPIN(p);
  const tokVal = await tokOf(u == 'KONSOL' ? cat(US.map(k => RAW[k])) : RAW);
  setTOK(tokVal);
  await start(u);
}

export const setSync = t => {
  const e = $('#sync');
  if (e) e.textContent = t;
};

export const verNow = () => kv.ver(['d_USP', 'd_Sembako', 'd_Kantor', 'coa']);

export async function startSync() {
  try { setVER(await verNow()); } catch (e) { setVER({}); }
  clearInterval(syncT);
  setSyncT(setInterval(pollSync, 10000));
  setSync('\u2714 database lokal (offline)');
}

export async function pollSync() {
  if (document.hidden || !S || !DK) return;
  try {
    const v = await verNow(), ch = Object.keys(v).filter(k => VER[k] !== v[k]);
    if (!ch.length) {
      setSync('\ud83d\udd04 sinkron ' + new Date().toLocaleTimeString('id-ID'));
      return;
    }
    for (const k of ch) {
      if (k == 'coa') { await loadCOA(); continue; }
      const u = k.slice(2);
      if (K && US.includes(u) && !(S.imp && S.imp[u])) {
        const x = await kv.get(k);
        if (x) {
          try {
            const d = await js(await dek(RAW[u]), x);
            S.units[u] = { rows: d.rows, tgl: 'sinkron ' + new Date().toLocaleTimeString('id-ID') };
          } catch (e) {}
        }
      }
    }
    setVER(v);
    setSync('\ud83d\udd04 data diperbarui ' + new Date().toLocaleTimeString('id-ID'));
    const a = document.activeElement;
    if (K && !(a && a.tagName == 'INPUT')) go();
  } catch (e) {
    setSync('\u26a0 tidak terhubung');
  }
}

export async function start(u) {
  await loadCOA();
  setLastSnapDay('');
  setLastSave('');
  setDirty(false);
  CFG.unit = u;
  setK(u == 'KONSOL');
  setKEY('d_' + u);
  const c = K ? CFG.KON : CFG.U[u];
  CFG.LPK = c.LPK;
  CFG.LR = c.LR;
  CFG.name = c.name;

  const ld = async (k, key) => {
    const v = await kv.get(k);
    if (!v) return null;
    try { return await js(key, v); } catch (e) { return null; }
  };

  const loadedS = await ld(KEY, DK) || { bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(), kop: 'KDMP', rows: [], cv: 3 };
  setS(loadedS);
  (S.rows || []).forEach(r => {
    if (r.kom == 'Pembayaran Utang Jangka Panjang') r.kom = 'Pembayaran Pinjaman Jangka Panjang';
  });
  S.sub = S.sub || {};
  if (K) {
    S.imp = S.imp || {};
    S.units = {};
    for (const k of US) {
      const d = await ld('d_' + k, await dek(RAW[k]));
      S.units[k] = S.imp[k] || { rows: d ? d.rows : [], tgl: d ? 'lokal (browser ini)' : 'belum ada data' };
    }
  }

  const newTabs = K ? ['Neraca Konsolidasi', 'Laba Rugi Konsolidasi', 'Master COA', 'Data Unit'] : ['Jurnal', 'Buku Besar', 'Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas'].concat(u == 'Sembako' ? ['BP Aset', 'BP Persediaan'] : ['BP Aset'], ['Data']);
  setTABS(newTabs);

  $('#ov').style.display = 'none';
  $('#ttl').textContent = c.name;
  document.title = c.name;
  $('#lg').src = LG();

  $('#bln').innerHTML = MON.map((m, i) => `<option value=${i + 1}>${m}</option>`).join('');
  $('#bln').value = S.bulan;
  $('#thn').value = S.tahun;
  $('#bln').onchange = e => {
    S.bulan = +e.target.value;
    KEEP.clear();
    save();
    go();
  };
  $('#thn').onchange = e => {
    S.tahun = +e.target.value;
    KEEP.clear();
    save();
    go();
  };

  dlist();
  const rst = () => {
    clearTimeout(idle);
    setIdle(setTimeout(() => location.reload(), 600000));
  };
  ['click', 'keydown'].forEach(e => addEventListener(e, rst));
  rst();
  go(TABS[0]);
  startSync();
}

export async function askPw(msg) {
  return new Promise(res => {
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
    o.innerHTML = '<form style="background:#fff;color:#222;padding:18px;border-radius:8px;min-width:280px;max-width:90vw;box-shadow:0 4px 24px rgba(0,0,0,.3)"><p style="margin:0 0 10px">' + msg + '</p><input type=password autocomplete=current-password style="width:100%;box-sizing:border-box;padding:6px;margin-bottom:10px"><div style="text-align:right"><button type=button class=b>Batal</button> <button type=submit class=p>Lanjut</button></div></form>';
    document.body.appendChild(o);
    const i = o.querySelector('input'), end = v => {
      o.remove();
      res(v);
    };
    i.focus();
    o.querySelector('form').onsubmit = e => {
      e.preventDefault();
      end(i.value);
    };
    o.querySelector('.b').onclick = () => end(null);
  });
}

export async function hapusSemua() {
  const p = await askPw('Masukkan <b>sandi login</b> untuk menghapus semua data unit ini:');
  if (p === null) return;
  if (p !== PIN) return alert('Sandi salah. Data tidak dihapus.');
  if (!confirm('Hapus semua data unit ini? Tindakan ini tidak bisa dibatalkan.')) return;
  S.rows = [];
  KEEP.clear();
  save();
  go('Jurnal');
}

export async function chg(u, np) {
  if (!np || np.length < 6) return alert('Sandi minimal 6 karakter');
  if (u == 'Admin' && K) {
    const s = rnd(16), AK = await kdf(np, s);
    for (const k of US) META.units[k].wA = await enc(AK, RAW[k]);
    META.saltA = b64(s);
    setDK(AK);
    setPIN(np);
    save();
  } else if (K ? US.includes(u) : u == CFG.unit) {
    const s = rnd(16);
    META.units[u].s = b64(s);
    META.units[u].wU = await enc(await kdf(np, s), K ? RAW[u] : RAW);
    if (!K) setPIN(np);
  } else return alert('Tidak diizinkan');
  try {
    await kv.set('meta', META);
    alert('Sandi diganti');
  } catch (e) {
    alert('Gagal menyimpan ke server: ' + (e && e.message || e));
  }
}

// Bind globals for inline onclick
Object.assign(window, {
  box, US, setupUI, doSetup, tpw, loginUI, rstAll, doLogin, askPw, hapusSemua,
  chg, startSync, pollSync, verNow, setSync, start
});
