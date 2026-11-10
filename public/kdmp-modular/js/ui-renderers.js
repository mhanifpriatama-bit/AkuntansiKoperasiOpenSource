/**
 * @license
 * KDMP Akuntansi - UI Components & Tab Renderers Module
 */
import {
  $, S, K, KEY, DK, PIN, META, TABS, tab, setTab, bb, setBb,
  B, num, SUB, ymOf, esc, toast, KEEP, SV, SEL
} from './state.js';
import {
  CFG, COA, COA0, NM, MON, hd, sig, fields, OPT, PD, cn
} from './config.js';
import {
  calc, ev, rep, unitData, lakRows, konX, kcols, akKom,
  sortCOA, setCOA, coaSave, codeErr, defN, usedMap, KODE
} from './accounting-engine.js';
import {
  f, fq, nq, nc, fmtN, idn, dmy, pIso, defDate, dl_
} from './export.js';
import {
  kv, save, setSt, dbPanel
} from './db.js';
import {
  kdf, enc, dec, dek, js, ub, E
} from './crypto.js';

export const REP = ['Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas', 'Neraca Konsolidasi', 'Laba Rugi Konsolidasi'];
export const US = ['USP', 'Sembako'];
export const STALE = 7 * 864e5;
export const dtf = t => new Date(t).toLocaleString('id-ID');
export let IMPR = '';

export function status() {
  let o;
  if (K) {
    $('#st').innerHTML = '';
    return;
  }
  o = calc(S.rows, B());
  const b = Math.round(o.td - o.tk) == 0;
  $('#st').innerHTML = `<span class="${b ? 'ok' : 'no'}" style="background:#fff;padding:3px 8px;border-radius:4px">${b ? 'Jurnal balance' : 'Selisih ' + f(o.td - o.tk)}</span>`;
}

export function go(t) {
  if (t) setTab(t);
  $('#nav').innerHTML = TABS.map(x => `<button class="${x == tab ? 'on' : ''}" onclick="go('${x}')">${x}</button>`).join('');
  status();
  setSt();
  R[tab]();
  if (K && tab != 'Data Unit') $('#m').insertAdjacentHTML('afterbegin', konBan());
  if (REP.includes(tab)) $('#m').insertAdjacentHTML('beforeend', sig());
}

export const dfield = (v, t, fl) => `<div class=dt data-t="${t}" data-v="${esc(v || '')}"${fl ? ' data-fl=1' : ''}><input class="i dti" placeholder="dd/mm/yyyy" value="${dmy(v)}" onchange="dSet(this)"><button type=button class=dtb title="Pilih tanggal" onclick="dPick(this)">&#128197;</button><input type=date class=dtp tabindex=-1 value="${esc(v || '')}" onchange="dSet(this)"></div>`;

export function dPick(b) {
  const p = b.parentNode.querySelector('.dtp');
  try { p.showPicker(); } catch (e) {
    try { p.focus(); p.click(); } catch (e2) {}
  }
}

export function dSet(el) {
  const w = el.closest('.dt'), t = w.dataset.t.split(':'), tx = w.querySelector('.dti'), pk = w.querySelector('.dtp');
  let v;
  if (el.type == 'date') v = el.value;
  else if (!el.value.trim()) v = '';
  else {
    v = pIso(el.value);
    if (!v) {
      toast('Format tanggal: dd/mm/yyyy');
      tx.value = dmy(w.dataset.v);
      return;
    }
  }
  w.dataset.v = v;
  tx.value = dmy(v);
  pk.value = v;
  if (t[0] == 'rows') S.rows[+t[1]][t[2]] = v;
  else SUB(t[0])[+t[1]][t[2]] = v;
  save();
  if (t[0] == 'rows') status();
  if (w.dataset.fl && v) {
    const q = ymOf(v);
    if (q != S.tahun * 12 + B()) {
      KEEP.delete(t[0] == 'rows' ? S.rows[+t[1]] : SUB(t[0])[+t[1]]);
      const m = q % 12 || 12, y = (q - m) / 12;
      toast('Baris dipindahkan ke periode ' + MON[m - 1] + ' ' + y);
      go();
    }
  }
}

export function nIn(el) {
  const v = el.value, p = el.selectionStart;
  let k = 0;
  for (let i = 0; i < p; i++) if (/[\d,]/.test(v[i])) k++;
  const s = v.replace(/[^\d,]/g, ''), ci = s.indexOf(',');
  let a = ci < 0 ? s : s.slice(0, ci);
  const b = ci < 0 ? null : s.slice(ci + 1).replace(/,/g, '').slice(0, 2);
  a = a.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const nv = a + (b === null ? '' : ',' + b);
  el.value = nv;
  let c = 0, np = 0;
  for (; np < nv.length && c < k; np++) if (/[\d,]/.test(nv[np])) c++;
  try { el.setSelectionRange(np, np); } catch (e) {}
}

export function jTot() {
  const P = S.tahun * 12 + B();
  let a = 0, b = 0;
  S.rows.forEach(r => {
    if (!r.d || ymOf(r.d) == P) {
      a += +r.db || 0;
      b += +r.kr || 0;
    }
  });
  const x = $('#jtd'), y = $('#jtk');
  if (x) x.textContent = f(a);
  if (y) y.textContent = f(b);
}

export function jNum(i, k, el) {
  const v = idn(el.value);
  S.rows[i][k] = v;
  el.value = fmtN(v);
  save();
  status();
  jTot();
}

export function jDel(i) {
  const r = S.rows[i];
  if (!r) return;
  const u = (r.ak || '(akun kosong)') + ' | Debit ' + f(+r.db || 0) + ' | Kredit ' + f(+r.kr || 0);
  if (!confirm('Hapus baris jurnal ini?\n\n' + u + '\n\n(Konfirmasi 1 dari 2)')) return;
  if (!confirm('Yakin ingin menghapus? Baris yang dihapus tidak dapat dikembalikan.\n\n(Konfirmasi 2 dari 2)')) return;
  S.rows.splice(i, 1);
  save();
  go();
}

export function grid(p, cols, note, dk) {
  const a = SUB(p), PP = S.tahun * 12 + B(), vis = [];
  a.forEach((r, i) => {
    if (!dk || !r[dk] || ymOf(r[dk]) == PP || KEEP.has(r)) vis.push(i);
  });
  let h = `<div class=bar><button class=p onclick="gAdd('${p}')">+ Baris</button><button onclick="gAdd('${p}',10)">+10 Baris</button><span class=c>${dk ? '<b>Periode ' + MON[B() - 1] + ' ' + S.tahun + '</b> (' + vis.length + ' baris). Ganti bulan/tahun di kanan atas untuk periode lain; data periode sebelumnya tetap tersimpan. ' : ''}${note || ''}</span></div><table><tr><th>#</th>${cols.map(c => `<th>${c.l}</th>`).join('')}<th></th></tr>`;
  vis.forEach((i, ix) => {
    const r = a[i];
    h += `<tr><td class=c>${ix + 1}</td>` + cols.map(c => {
      const v = r[c.k];
      if (c.t == 'date') return `<td>${dfield(v, p + ':' + i + ':' + c.k, dk == c.k)}</td>`;
      if (c.o) return `<td><select onchange="gSet('${p}',${i},'${c.k}',this.value)"><option></option>${OPT(c.o, v)}</select></td>`;
      if (c.m) return `<td class="n"${c.w ? ` style="min-width:${c.w}px"` : ''}><input class="i n" inputmode=numeric value="${fmtN(v)}" oninput="nIn(this)" onchange="gNum('${p}',${i},'${c.k}',this)"></td>`;
      const n = c.t == 'number';
      return `<td class="${n ? 'n' : ''}"${c.w ? ` style="min-width:${c.w}px"` : ''}><input class="i ${n ? 'n' : ''}" type="${c.t || 'text'}"${c.list ? ' list=' + c.list : ''} value="${esc(v)}" onchange="gSet('${p}',${i},'${c.k}',this.value,${n})"></td>`;
    }).join('') + `<td><button onclick="gDel('${p}',${i})">\u00d7</button></td></tr>`;
  });
  return h + '</table>';
}

export function gAdd(p, n) {
  const a = SUB(p);
  for (let i = 0; i < (n || 1); i++) {
    const o = PD[p] ? PD[p]() : {};
    a.push(o);
    KEEP.add(o);
  }
  save();
  go();
}

export function gNum(p, i, k, el) {
  const v = idn(el.value);
  SUB(p)[i][k] = v;
  el.value = fmtN(v);
  save();
}

export function gSet(p, i, k, v, n) {
  SUB(p)[i][k] = n ? (+v || 0) : v;
  save();
}

export function gDel(p, i) {
  if (confirm('Hapus baris ini?')) {
    SUB(p).splice(i, 1);
    save();
    go();
  }
}

export function svw(tabName, list) {
  const cur = list.includes(SV[tabName]) ? SV[tabName] : list[0];
  SV[tabName] = cur;
  return [cur, `<div class="bar sbar">${list.map(x => `<button class="${x == cur ? 'on' : ''}" onclick="SV['${tabName}']='${x}';go()">${x}</button>`).join('')}</div>`];
}

export function rekon(rows, jd) {
  let h = `<h4>${jd || 'Rekonsiliasi dengan Buku Besar'}</h4><table><tr><th>Akun</th><th>Buku Pembantu</th><th>Buku Besar</th><th>Selisih</th><th>Status</th></tr>`;
  rows.forEach(([l, s, g]) => {
    const d = s - g, ok = Math.round(d) == 0;
    h += `<tr><td>${l}</td>${nc(s)}${nc(g)}${nc(d)}<td class="${ok ? 'ok' : 'no'}">${ok ? 'Sesuai' : 'Selisih'}</td></tr>`;
  });
  return h + '</table>';
}

export const pick = (key, lid, ph) => `<div class=bar><label>${ph}: <input list=${lid} style=width:220px value="${esc(SEL[key] || '')}" onchange="SEL['${key}']=this.value.trim();go()"></label></div>`;
export const totRow = (cells, cls) => `<tr class="${cls || 'g'}">${cells}</tr>`;

export function konBan() {
  if (!K || !S.units) return '';
  const m = [];
  for (const k of US) {
    const u = S.units[k], im = S.imp && S.imp[k];
    if (!u || (!im && !(u.rows && u.rows.length))) m.push(k + ': belum ada data');
    else if (im) {
      const t = u.ts || u.impT || 0;
      if (Date.now() - t > STALE) m.push(k + ': paket sudah ' + Math.floor((Date.now() - t) / 864e5) + ' hari \u2014 minta ekspor ulang');
    }
  }
  return m.length ? '<p class=c style="color:#A4161F;font-weight:bold">\u26a0 Konsolidasi belum lengkap/terbaru \u2014 ' + m.join('; ') + '. Buka tab Data Unit.</p>' : '';
}

export async function expInfo() {
  const e = $('#ei');
  if (!e || K) return;
  const le = await kv.get('lastexp_' + CFG.unit), v = await kv.ver([KEY]), t = v[KEY] ? +v[KEY] : 0;
  e.innerHTML = !le ? '<b class=no>\u26a0 Paket belum pernah diekspor untuk bendahara.</b>' : 'Terakhir diekspor untuk bendahara: <b>' + dtf(le) + '</b>' + (t > le + 1000 ? ' \u2014 <b class=no>\u26a0 ada perubahan data setelah itu, ekspor ulang.</b>' : ' \u2014 <span class=ok>data sudah sama dengan paket.</span>');
}

export async function exp() {
  await window.saveNow();
  const m = META.units[CFG.unit], ts = Date.now();
  await dl_('KDMP_' + CFG.unit + '_' + new Date().toISOString().slice(0, 10) + '.kdmp.json', {
    app: 'kdmp2', unit: CFG.unit, ts, saltA: META.saltA, s: m.s, wU: m.wU, wA: m.wA,
    tgl: new Date(ts).toLocaleString('id-ID'),
    data: await enc(DK, E.encode(JSON.stringify({ rows: S.rows.filter(r => r.ak || r.db || r.kr), kop: S.kop, tahun: S.tahun, sub: S.sub, cv: 3 })))
  });
  await kv.set('lastexp_' + CFG.unit, ts);
  expInfo();
}

export function imp(fl) {
  const r = new FileReader();
  r.onload = async () => {
    try {
      const o = JSON.parse(r.result);
      if (o.unit != CFG.unit) throw 0;
      const d = await js(await dek(await dec(await kdf(PIN, ub(o.s)), o.wU)), o.data);
      S.rows = d.rows;
      S.kop = d.kop || S.kop;
      if (d.sub) S.sub = d.sub;
      save();
      go('Jurnal');
    } catch (e) {
      alert('Gagal: file bukan milik unit ini atau sandi berbeda.');
    }
  };
  r.readAsText(fl);
}

export async function impK(fl) {
  fl = [...fl];
  if (!fl.length) return;
  const L = [], best = {};
  for (const f of fl) {
    try {
      const o = JSON.parse(await f.text());
      if (o && o.app == 'kdmp-full' && o.kv && o.kv.meta) {
        const mt = o.kv.meta;
        let AK, n = 0;
        try { AK = await kdf(PIN, ub(mt.saltA)); } catch (e) { throw new Error('backup rusak'); }
        for (const u of US) {
          const x = o.kv['d_' + u];
          if (!x || !mt.units || !mt.units[u]) continue;
          let d;
          try { d = await js(await dek(await dec(AK, mt.units[u].wA)), x); } catch (e) { throw new Error('sandi Admin di komputer asal berbeda dengan sandi Admin Anda'); }
          d.tgl = o.tgl;
          d.ts = o.ts || 0;
          d.impT = Date.now();
          (best[u] = best[u] || []).push({ d, fn: f.name, u });
          n++;
        }
        if (!n) throw new Error('backup ini tidak berisi data unit USP/Sembako (unduh Backup Database dari komputer unit)');
        if (Array.isArray(o.kv.coa)) {
          const nw = o.kv.coa.filter(a => Array.isArray(a) && KODE.test(a[0]) && a[1] && (a[2] == 'Debit' || a[2] == 'Kredit') && !NM[a[0]]);
          if (nw.length) {
            nw.forEach(a => COA.push([a[0], a[1], a[2]]));
            sortCOA();
            setCOA(COA);
            coaSave();
            L.push({ ok: 1, n: f.name, m: nw.length + ' akun tambahan dari COA unit ditambahkan ke Master COA: ' + esc(nw.map(a => a[0]).join(', ')) });
          }
        }
        continue;
      }
      if (!o || o.app != 'kdmp2' || !US.includes(o.unit) || !o.data) throw new Error('bukan paket unit (.kdmp.json) atau Backup Database KDMP yang valid');
      let d;
      try { d = await js(await dek(await dec(await kdf(PIN, ub(o.saltA)), o.wA)), o.data); } catch (e) { throw new Error('sandi Admin di komputer asal berbeda dengan sandi Admin Anda'); }
      d.tgl = o.tgl;
      d.ts = o.ts || 0;
      d.impT = Date.now();
      (best[o.unit] = best[o.unit] || []).push({ d, fn: f.name, u: o.unit });
    } catch (e) {
      L.push({ ok: 0, n: f.name, m: e.message || 'gagal dibuka' });
    }
  }
  for (const u in best) {
    const a = best[u].sort((x, y) => (y.d.ts || 0) - (x.d.ts || 0)), w = a[0];
    a.slice(1).forEach(x => L.push({ ok: 0, n: x.fn, m: 'dilewati \u2014 ada file ' + u + ' yang lebih baru' }));
    S.imp[u] = w.d;
    S.units[u] = w.d;
    const th = +w.d.tahun != +S.tahun ? ' <b class=no>(tahun data ' + w.d.tahun + ', periode konsolidasi ' + S.tahun + ')</b>' : '';
    L.push({ ok: 1, n: w.fn, m: 'unit <b>' + u + '</b> diimpor \u2014 ' + (w.d.rows || []).length + ' baris jurnal, diekspor ' + esc(w.d.tgl || '-') + th });
  }
  if (L.some(x => x.ok)) save();
  IMPR = '<div style="background:#fff;padding:10px 14px;margin:10px 0;border-left:4px solid #1F3864"><b>Hasil impor</b>' + L.map(x => `<div class="${x.ok ? 'ok' : 'no'}">${x.ok ? '\u2714' : '\u2716'} ${esc(x.n)} \u2014 ${x.ok ? x.m : esc(x.m)}</div>`).join('') + (L.some(x => x.ok) ? '<div style="margin-top:8px"><button class=p onclick="go(\'Neraca Konsolidasi\')">Lihat Neraca Konsolidasi</button></div>' : '') + '</div>';
  go('Data Unit');
}

export function nkAuto(v) {
  if (KODE.test(v)) $('#nm').value = defN(v);
}

export function coaAdd() {
  const k = $('#nk').value.trim(), n = $('#nn').value.trim(), m = $('#nm').value, e = codeErr(k, -1);
  if (e) return alert(e);
  if (!n) return alert('Nama akun wajib diisi.');
  if (m != defN(k) && !confirm('Saldo normal berbeda dari kebiasaan golongan akun ini. Tetap lanjut?')) return;
  COA.push([k, n, m]);
  sortCOA();
  setCOA(COA);
  coaSave();
  go();
  toast('Akun ' + k + ' ditambahkan');
}

export function coaEdit(i, fl, v) {
  const a = COA[i];
  v = v.trim();
  if (fl == 'n') {
    if (!v) { alert('Nama akun wajib diisi.'); return go(); }
    a[1] = v;
  } else if (fl == 'k') {
    const e = codeErr(v, i);
    if (e) { alert(e); return go(); }
    a[0] = v;
    sortCOA();
  } else a[2] = v;
  setCOA(COA);
  coaSave();
  if (fl == 'k') go();
}

export function coaDel(i) {
  const a = COA[i];
  if (!confirm('Hapus akun ' + a[0] + ' ' + a[1] + '?')) return;
  COA.splice(i, 1);
  setCOA(COA);
  coaSave();
  go();
}

export function coaFilter(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#ct tr[data-t]').forEach(r => r.style.display = r.dataset.t.includes(q) ? '' : 'none');
}

export function coaReset() {
  const u = usedMap(), base = new Set(COA0.map(a => a[0])), bad = Object.keys(u).filter(c => !base.has(c));
  if (bad.length) return alert('Tidak bisa dikembalikan: akun tambahan berikut masih dipakai di jurnal: ' + bad.join(', '));
  if (!confirm('Kembalikan seluruh akun ke daftar bawaan? Akun tambahan dan perubahan nama akan hilang.')) return;
  setCOA(JSON.parse(JSON.stringify(COA0)));
  kv.del('coa');
  go();
}

export const R = {
  'Jurnal'() {
    const P = S.tahun * 12 + B(), Y = +S.tahun, vis = [];
    S.rows.forEach((r, i) => {
      if (!r.d || ymOf(r.d) == P || KEEP.has(r)) vis.push(i);
    });
    const au = akKom(S.rows, Y, P);
    let h = `<div class=bar><button onclick="KEEP.add(S.rows[S.rows.push({d:defDate()})-1]);save();go()">+ Baris</button><button onclick="for(let i=0;i<10;i++)KEEP.add(S.rows[S.rows.push({d:defDate()})-1]);save();go()">+10 Baris</button><span class=c><b>Periode ${MON[B() - 1]} ${S.tahun}</b> (${vis.length} baris). Ganti bulan/tahun di kanan atas untuk membuat atau melihat jurnal periode lain; data periode sebelumnya tetap tersimpan. Ketik sebagian nama/kode akun untuk mencari. Saldo awal: isi Keterangan <b>Saldo Awal</b> (sekali saja, pada periode pertama). Komponen arus kas pada baris kas/bank terisi otomatis dari akun lawan (No Bukti sama); pilih manual bila ingin mengubahnya.</span></div><table><tr><th>#</th><th>Tanggal</th><th>No Bukti</th><th>Akun</th><th>Debit</th><th>Kredit</th><th>Keterangan</th><th>Komponen Arus Kas</th><th></th></tr>`;
    vis.forEach((i, n) => {
      const r = S.rows[i], bad = r.ak && !NM[r.ak.split(' ')[0]], m = au.get(r), al = m ? Object.keys(m).join(' + ') : '';
      const c = k => `<td><input class="i" ${k == 'ak' ? 'list=dl' : ''} value="${esc(r[k])}" onchange="S.rows[${i}].${k}=this.value;save();status()"></td>`;
      const nm = k => `<td class=n><input class="i n" data-f=1 inputmode=numeric value="${fmtN(r[k])}" oninput="nIn(this)" onchange="jNum(${i},'${k}',this)"></td>`;
      h += `<tr class="${bad ? 'bad' : ''}"><td class=c>${n + 1}</td><td>${dfield(r.d, 'rows:' + i + ':d', 1)}</td>${c('no')}${c('ak')}${nm('db')}${nm('kr')}${c('ket')}<td><select onchange="S.rows[${i}].kom=this.value;save()"><option value="">${al ? '(otomatis) ' + esc(al) : ''}</option>${CFG.kom.map(x => `<option ${r.kom == x ? 'selected' : ''}>${x}</option>`).join('')}</select></td><td><button onclick="jDel(${i})">\u00d7</button></td></tr>`;
    });
    $('#m').innerHTML = h + `</table><p>Total Debit <b id=jtd></b> | Total Kredit <b id=jtk></b> <span class=c>(periode ini)</span></p>`;
    jTot();
  },

  'Buku Besar'() {
    const Y = +S.tahun, P = Y * 12 + B(), pl = '45678'.includes(bb[0]) || bb[0] == '9', sg = NM[bb] == 'Debit' ? 1 : -1, o = [];
    let s = 0, s0 = 0;
    S.rows.filter(r => (r.ak || '').startsWith(bb + ' ') && r.d).sort((a, b) => a.d < b.d ? -1 : 1).forEach(r => {
      const q = ymOf(r.d), y = +r.d.slice(0, 4);
      if (q > P || (pl && y != Y)) return;
      s += sg * ((+r.db || 0) - (+r.kr || 0));
      if (q < P) { s0 = s; return; }
      o.push(`<tr><td>${dmy(r.d)}</td><td>${r.no || ''}</td><td>${r.ket || ''}</td><td class=n>${f(+r.db || 0)}</td><td class=n>${f(+r.kr || 0)}</td><td class=n>${f(s)}</td></tr>`);
    });
    $('#m').innerHTML = `<div class=bar>Akun: <input list=dl id=bbs style=width:380px value="${bb} ${(COA.find(a => a[0] == bb) || [])[1] || ''}" onchange="bb=this.value.split(' ')[0];go()"><span class=c>Periode ${MON[B() - 1]} ${S.tahun}</span></div><table><tr><th>Tanggal</th><th>No Bukti</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Saldo</th></tr><tr class=t><td></td><td></td><td>Saldo awal periode</td><td></td><td></td><td class=n>${f(s0)}</td></tr>${o.join('')}</table>`;
  },

  'Neraca Saldo'() {
    const o = calc(S.rows, B());
    let h = hd('NERACA SALDO') + '<table><tr><th>Akun</th><th>Debit</th><th>Kredit</th><th>Saldo Akhir</th></tr>', a = 0, b = 0;
    COA.forEach(([c, n, s]) => {
      if (o.cum[c] === undefined) return;
      a += o.dr[c];
      b += o.kr[c];
      h += `<tr><td>${c} ${n}</td><td class=n>${f(o.dr[c])}</td><td class=n>${f(o.kr[c])}</td><td class=n>${f(o.cum[c])} <span class=c>${s[0]}</span></td></tr>`;
    });
    const pr = o.pri();
    if (Math.abs(pr) >= .5) {
      h += `<tr><td>SHU tahun-tahun sebelumnya (otomatis)</td><td class=n>${pr < 0 ? f(-pr) : '-'}</td><td class=n>${pr > 0 ? f(pr) : '-'}</td><td class=n>${f(Math.abs(pr))} <span class=c>${pr > 0 ? 'K' : 'D'}</span></td></tr>`;
      if (pr > 0) b += pr; else a -= pr;
    }
    $('#m').innerHTML = h + `<tr class=g><td>JUMLAH</td><td class=n>${f(a)}</td><td class=n>${f(b)}</td><td></td></tr></table>`;
  },

  'Laba Rugi'() {
    const { o } = unitData(), m1 = o.lr(o.mon), m2 = o.lr(o.cum), spx = konX(CFG.LR, [m1, m2]), a = ev(spx, m1), b = ev(spx, m2);
    $('#m').innerHTML = hd('LAPORAN LABA RUGI') + rep(a.rows, [a.rows.map(r => r.v), b.rows.map(r => r.v)], [MON[B() - 1], 's.d. bulan ini']);
  },

  'Neraca'() {
    const { o, Lv } = unitData(), a = ev(konX(CFG.LPK, [o.M]), o.M, Lv), ok = Math.round(a.key.tot_aset - a.key.tot_ke) == 0;
    $('#m').innerHTML = hd('LAPORAN POSISI KEUANGAN (NERACA)') + `<p class="${ok ? 'ok' : 'no'}">${ok ? 'Balance' : 'Tidak balance, selisih ' + f(a.key.tot_aset - a.key.tot_ke)}</p>` + rep(a.rows, [a.rows.map(r => r.v)], ['Jumlah']);
  },

  'Arus Kas'() {
    const { o } = unitData(), r = lakRows(o), kas = Object.keys(o.M).filter(c => c.startsWith('1.1.1.')).reduce((s, c) => s + o.M[c], 0), sel = r[r.length - 1].x - kas;
    let h = hd('LAPORAN ARUS KAS') + '<table><tr><th>Uraian</th><th>Jumlah</th></tr>';
    r.forEach(a => {
      if (a.tp == 'e') return;
      h += `<tr class="${a.tp == 'h' ? 'h' + a.lv : a.lv == 1 ? 'g' : a.lv == 0 ? 't' : ''}"><td style="padding-left:${a.lv == 3 ? 24 : 6}px">${a.l}</td><td class=n>${a.tp == 'h' ? '' : f(a.x)}</td></tr>`;
    });
    $('#m').innerHTML = h + `</table><p class="${Math.round(sel) == 0 ? 'ok' : 'no'}">${Math.round(sel) == 0 ? 'Sesuai dengan Kas di Neraca' : 'Selisih terhadap Kas di Neraca ' + f(sel) + ' \u2014 ada mutasi kas tanpa Komponen Arus Kas'}</p>`;
  },

  'Data'() {
    $('#m').innerHTML = `<div class=bar>${fields()}</div><div class=bar><button class=p onclick="exp()">Ekspor paket untuk bendahara (.kdmp.json)</button><button onclick="bakAll()">Unduh Backup Database (.json)</button><label>Pulihkan backup <input type=file accept=.json onchange="pulihFile(this.files[0]);this.value=''"></label><label>Impor paket <input type=file accept=.json onchange="imp(this.files[0])"></label><button onclick="chg(CFG.unit,prompt('Sandi baru (min. 6 karakter):')||'')">Ganti sandi</button><button onclick="location.reload()">Keluar</button><button onclick="hapusSemua()">Hapus semua</button></div><p id=ei class=c></p><p class=c>Data tersimpan otomatis di database IndexedDB browser ini (offline, tanpa server). Unduh <b>Backup Database (.json)</b> secara rutin \u2014 data akan hilang bila data situs browser dihapus. Klik <b>Simpan data ke file</b> untuk menyimpan salinan ke komputer (pilih folder, mis. Documents atau flashdisk) \u2014 lakukan rutin sebagai cadangan. Laporan: <b>Cetak / PDF</b> (pilih printer atau 'Simpan sebagai PDF') dan <b>Excel (CSV)</b>.</p>`;
    expInfo();
    $('#m').insertAdjacentHTML('beforeend', dbPanel());
  },

  'Neraca Konsolidasi'() {
    const k = kcols(CFG.LPK, 'nb'), a = ev(CFG.LPK, {}, {});
    $('#m').innerHTML = hd('NERACA KONSOLIDASI') + rep(k.rows, k.cols, ['USP', 'Sembako', 'Jumlah', 'Eliminasi (isi manual)', 'KONSOLIDASI'], { j: 3, k: k.ek }) + '<p class=c>Eliminasi RK Piutang Gerai Sembako (USP) vs Utang ke USP (Sembako) dihitung otomatis; kolom Eliminasi bisa ditambah manual (negatif = mengurangi). Semua akun yang bersaldo di neraca USP maupun Sembako ditampilkan per akun dengan nama sesuai Master COA.</p>';
  },

  'Laba Rugi Konsolidasi'() {
    const m = B(), a = kcols(CFG.LR, 'm'), b = kcols(CFG.LR, 'y');
    $('#m').innerHTML = hd('LABA RUGI KONSOLIDASI') + '<h4>Bulan ' + MON[m - 1] + '</h4>' + rep(a.rows, a.cols, ['USP', 'Sembako', 'Jumlah', 'Eliminasi', 'KONSOLIDASI'], { j: 3, k: a.ek }) + '<h4>s.d. bulan ini</h4>' + rep(b.rows, b.cols, ['USP', 'Sembako', 'Jumlah', 'Eliminasi', 'KONSOLIDASI'], { j: 3, k: b.ek });
  },

  'Data Unit'() {
    S.units = S.units || {};
    const now = Date.now(), L = ['USP', 'Sembako'].map(k => {
      const u = S.units[k], im = S.imp && S.imp[k];
      let s;
      if (!u || (!im && !(u.rows && u.rows.length))) s = '<span class=no>belum ada data</span>';
      else if (im) {
        const t = u.ts || u.impT || 0, h = Math.floor((now - t) / 864e5);
        s = u.rows.length + ' baris \u2014 paket diekspor ' + (u.tgl || '') + (u.ts ? '' : ' (waktu ekspor tidak tercatat)') + (now - t > STALE ? ' <b class=no>\u26a0 sudah ' + h + ' hari, minta unit ekspor ulang</b>' : ' <span class=ok>(terbaru)</span>') + ' <a href=# onclick="delete S.imp.' + k + ';save();setTimeout(()=>location.reload(),600)">[hapus impor]</a>';
      } else s = u.rows.length + ' baris \u2014 terbaca langsung dari browser ini <span class=ok>(terbaru)</span>';
      return '<tr><td>' + k + '</td><td>' + s + '</td></tr>';
    }).join('');

    $('#m').innerHTML = `<div class=bar>${fields()}<button onclick="bakAll()">Unduh Backup Database (.json)</button><label>Pulihkan backup <input type=file accept=.json onchange="pulihFile(this.files[0]);this.value=''"></label><button onclick="chg('Admin',prompt('Sandi Admin baru:')||'')">Ganti sandi Admin</button><button onclick="chg(prompt('Unit (USP/Sembako):'),prompt('Sandi baru unit:')||'')">Reset sandi unit</button><button onclick="location.reload()">Keluar</button></div>
<div id=dz style="border:2px dashed #1F3864;background:#fff;padding:16px;text-align:center;margin:10px 0" ondragover="event.preventDefault()" ondrop="event.preventDefault();impK(event.dataTransfer.files)"><b>Impor database unit</b><br>Pilih atau tarik file <b>Backup Database (.json)</b> atau paket <code>.kdmp.json</code> dari USP dan Sembako sekaligus (boleh sekali pilih dua file). Rumus tetap dihitung ulang otomatis dari jurnal tiap unit.<br><br><input type=file multiple accept=.json onchange="impK(this.files);this.value=''"></div>${IMPR}
<table style=width:auto><tr><th>Unit</th><th>Status data</th></tr>${L}</table>
<p class=c>Alur: unit login \u2192 tab Data \u2192 <b>Unduh Backup Database (.json)</b> (atau Ekspor paket) \u2192 kirim file \u2192 bendahara impor di sini. Tiap unit menghitung Buku Besar, Neraca Saldo, Laba Rugi, Neraca, dan Arus Kas dari jurnalnya sendiri; konsolidasi hanya menjumlahkan hasilnya. Neraca &amp; Laba Rugi Konsolidasi terhitung otomatis. Paket lebih dari 7 hari ditandai peringatan. Paket hanya bisa dibuka bila <b>sandi Admin sama</b> di semua komputer. Data unit yang dipakai di browser/komputer yang sama terbaca otomatis tanpa impor.</p>`;
    IMPR = '';
    $('#m').insertAdjacentHTML('beforeend', dbPanel());
  },

  'Master COA'() {
    const u = usedMap();
    let h = `<div class=bar><b>Tambah akun:</b><input id=nk placeholder="Kode, mis. 6.1.9.24" style="width:160px" oninput="nkAuto(this.value)"><input id=nn placeholder="Nama akun" style="width:320px"><select id=nm><option>Debit</option><option>Kredit</option></select><button class=p onclick=coaAdd()>Tambah</button></div><div class=bar><input placeholder="Cari kode / nama akun" style="width:260px" oninput="coaFilter(this.value)"><button onclick=coaExp()>Ekspor COA</button><label class=btn>Impor COA<input type=file accept=.json style=display:none onchange="coaImp(this.files[0])"></label><button onclick=coaReset()>Kembalikan ke bawaan</button><span class=c>${COA.length} akun \u00b7 kode dan saldo normal terkunci jika akun sudah dipakai di jurnal unit \u00b7 setelah mengubah COA, bagikan file ekspornya ke komputer unit (tab Data \u2192 Impor COA)</span></div><table id=ct><tr><th>Kode Akun</th><th>Nama Akun</th><th>Saldo Normal</th><th>Dipakai (baris jurnal)</th><th></th></tr>`;
    COA.forEach((a, i) => {
      const n = u[a[0]] || 0;
      h += `<tr data-t="${esc((a[0] + ' ' + a[1]).toLowerCase())}"><td>${n ? esc(a[0]) : `<input class=i value="${esc(a[0])}" onchange="coaEdit(${i},'k',this.value)">`}</td><td><input class=i value="${esc(a[1])}" onchange="coaEdit(${i},'n',this.value)"></td><td>${n ? a[2] : `<select onchange="coaEdit(${i},'m',this.value)"><option${a[2] == 'Debit' ? ' selected' : ''}>Debit</option><option${a[2] == 'Kredit' ? ' selected' : ''}>Kredit</option></select>`}</td><td class=n>${n || '-'}</td><td>${n ? '' : `<button onclick="coaDel(${i})">Hapus</button>`}</td></tr>`;
    });
    $('#m').innerHTML = h + '</table>';
  },

  'BP Aset'() {
    const [v, bar] = svw('BP Aset', ['Daftar Aset', 'Jadwal Penyusutan', 'Rekonsiliasi & Jurnal']);
    let h = bar;
    if (v == 'Daftar Aset') {
      h += grid('aset', [
        { k: 'kode', l: 'Kode Aset', w: 90 }, { k: 'nama', l: 'Nama Aset', w: 220 },
        { k: 'kat', l: 'Kategori', o: Object.keys(CAT) }, { k: 'tgl', l: 'Tgl Perolehan', t: 'date' },
        { k: 'hp', l: 'Harga Perolehan', t: 'number', m: 1, w: 120 }, { k: 'res', l: 'Nilai Residu', t: 'number', m: 1, w: 100 },
        { k: 'umur', l: 'Umur (tahun)', t: 'number', w: 70 }, { k: 'met', l: 'Metode', o: ['Garis Lurus', 'Saldo Menurun'] },
        { k: 'lepas', l: 'Tgl Lepas (opsional)', t: 'date' }
      ], 'Penyusutan dihitung mulai bulan perolehan. Tanah tidak disusutkan. Saldo Menurun memakai tarif 2 \u00d7 (1/umur).');
    } else if (v == 'Jadwal Penyusutan') {
      const rs = window.asetCalc(), T = { cost: 0, bln: 0, ytd: 0, akum: 0, nb: 0 }, G = {};
      h += hd('BUKU PEMBANTU ASET TETAP DAN PENYUSUTAN') + '<table><tr><th>Kode</th><th>Nama Aset</th><th>Kategori</th><th>Tgl Perolehan</th><th>Umur (thn)</th><th>Metode</th><th>Status</th><th>Harga Perolehan</th><th>Beban Bulan Ini</th><th>Beban Tahun Berjalan</th><th>Akumulasi Penyusutan</th><th>Nilai Buku</th></tr>';
      rs.forEach(r => {
        const a = r.a;
        for (const k in T) T[k] += r[k];
        const g = G[a.kat || '-'] = G[a.kat || '-'] || { cost: 0, bln: 0, ytd: 0, akum: 0, nb: 0 };
        for (const k in T) g[k] += r[k];
        h += `<tr${r.ak ? '' : ' style="color:#999"'}><td>${esc(a.kode)}</td><td>${esc(a.nama)}</td><td>${esc(a.kat)}</td><td>${dmy(a.tgl)}</td><td class=n>${esc(a.umur || '')}</td><td>${esc(a.met || '')}</td><td>${r.st}</td>${nc(r.cost)}${nc(r.bln)}${nc(r.ytd)}${nc(r.akum)}${nc(r.nb)}</tr>`;
      });
      h += totRow(`<td colspan=7>JUMLAH</td>${nc(T.cost)}${nc(T.bln)}${nc(T.ytd)}${nc(T.akum)}${nc(T.nb)}`) + '</table><h4>Rekap per Kategori</h4><table><tr><th>Kategori</th><th>Harga Perolehan</th><th>Beban Bulan Ini</th><th>Beban Tahun Berjalan</th><th>Akumulasi Penyusutan</th><th>Nilai Buku</th></tr>';
      Object.keys(G).forEach(k => {
        const g = G[k];
        h += `<tr><td>${esc(k)}</td>${nc(g.cost)}${nc(g.bln)}${nc(g.ytd)}${nc(g.akum)}${nc(g.nb)}</tr>`;
      });
      h += '</table>' + sig();
    } else {
      const { o } = unitData(), rs = window.asetCalc(), cost = {}, ak = {};
      rs.forEach(r => {
        const c = CAT[r.a.kat];
        if (!c) return;
        cost[c[0]] = (cost[c[0]] || 0) + r.cost;
        if (c[1]) ak[c[1]] = (ak[c[1]] || 0) + r.akum;
      });
      const KAT_LIST = Object.keys(CAT);
      const ca = [...new Set(KAT_LIST.map(k => CAT[k][0]))], aa = [...new Set(KAT_LIST.filter(k => CAT[k][1]).map(k => CAT[k][1]))], ra = (l, m) => l.filter(c => Math.abs(m[c] || 0) > .5 || Math.abs(o.cum[c] || 0) > .5).map(c => [c + ' ' + cn(c), m[c] || 0, o.cum[c] || 0]);
      h += hd('REKONSILIASI ASET TETAP') + rekon(ra(ca, cost), 'Harga Perolehan') + rekon(ra(aa, ak), 'Akumulasi Penyusutan') + `<div class=bar><button class=p onclick=depJurnal()>Buat jurnal penyusutan bulan ${MON[B() - 1]}</button><span class=c>Membuat jurnal Debit Beban Penyusutan / Kredit Akumulasi Penyusutan di tab Jurnal (no bukti DEP-${S.tahun}${P2(B())}). Jika dibuat ulang, jurnal lama bulan itu diganti.</span></div>`;
    }
    $('#m').innerHTML = h;
  },

  'BP Persediaan'() {
    const [v, bar] = svw('BP Persediaan', ['Master Barang', 'Mutasi Stok', 'Kartu Stok', 'Rekap & Rekonsiliasi']);
    let h = bar;
    const akn = COA.filter(a => a[0].startsWith('1.1.4.')).map(a => [a[0], a[0] + ' ' + a[1]]), dlb = '<datalist id=dlb>' + SUB('pb').filter(x => x.k).map(x => `<option value="${esc(x.k)}" label="${esc(x.n)}">`).join('') + '</datalist>';
    if (v == 'Master Barang') {
      h += grid('pb', [{ k: 'k', l: 'Kode Barang', w: 100 }, { k: 'n', l: 'Nama Barang', w: 260 }, { k: 'akun', l: 'Akun Persediaan (Buku Besar)', o: akn }], 'Tiap barang dikaitkan ke akun persediaan agar bisa direkonsiliasi dengan Buku Besar.');
    } else if (v == 'Mutasi Stok') {
      h += dlb + grid('pm', [{ k: 'd', l: 'Tanggal', t: 'date' }, { k: 'no', l: 'No Bukti', w: 110 }, { k: 'k', l: 'Kode Barang', list: 'dlb', w: 110 }, { k: 'j', l: 'Jenis', o: ['Saldo Awal', 'Masuk', 'Keluar'] }, { k: 'q', l: 'Jumlah', t: 'number', w: 90 }, { k: 'h', l: 'Harga Satuan (Saldo Awal/Masuk)', t: 'number', w: 130 }, { k: 'ket', l: 'Keterangan', w: 220 }], 'Metode biaya: rata-rata bergerak. Mutasi Keluar dinilai otomatis dari harga rata-rata saat itu; kolom harga tidak dipakai.', 'd');
    } else if (v == 'Kartu Stok') {
      const c = window.stokCalc(window.asof()), r = c.m[SEL.pk];
      h += dlb + pick('pk', 'dlb', 'Kode barang') + hd('KARTU STOK');
      if (!r) h += '<p class=c>Pilih kode barang yang sudah ada di Master Barang.</p>';
      else {
        h += `<p><b>${esc(r.it.k)}</b> \u2014 ${esc(r.it.n)} \u00b7 Akun ${esc(r.it.akun || '-')}</p><table><tr><th>Tanggal</th><th>No Bukti</th><th>Keterangan</th><th>Masuk</th><th>Harga Masuk</th><th>Keluar</th><th>HPP Keluar</th><th>Saldo (qty)</th><th>Harga Rata-rata</th><th>Nilai Saldo</th></tr>`;
        r.h.forEach(x => {
          h += `<tr><td>${dmy(x.t.d)}</td><td>${esc(x.t.no)}</td><td>${esc(x.t.j)}${x.t.ket ? ' \u2014 ' + esc(x.t.ket) : ''}</td>${x.iq ? nq(x.iq) : '<td class=n>-</td>'}${x.iq ? nc(num(x.t.h)) : '<td class=n>-</td>'}${x.oq ? nq(x.oq) : '<td class=n>-</td>'}${x.oq ? nc(x.cost) : '<td class=n>-</td>'}${nq(x.q)}${nc(x.q > 0 ? x.v / x.q : 0)}${nc(x.v)}</tr>`;
        });
        h += '</table>' + sig();
      }
    } else {
      const c = window.stokCalc(window.asof()), p = window.stokCalc(window.prevEnd()), { o } = unitData(), L = Object.values(c.m).sort((a, b) => ((a.it.akun || '') + a.it.k) < ((b.it.akun || '') + b.it.k) ? -1 : 1), A = {};
      h += hd('REKAP PERSEDIAAN BARANG') + '<table><tr><th>Kode</th><th>Nama Barang</th><th>Saldo Awal Bulan</th><th>Masuk</th><th>Keluar</th><th>Saldo Akhir</th><th>Harga Rata-rata</th><th>Nilai Persediaan</th><th>HPP Keluar Bulan Ini</th></tr>';
      let tv = 0, to = 0;
      const neg = [];
      L.forEach(r => {
        const a = p.m[r.it.k] || { q: 0 };
        tv += r.v;
        to += r.vout;
        const ak = r.it.akun || '(belum diisi)';
        A[ak] = (A[ak] || 0) + r.v;
        if (r.q < -1e-9) neg.push(r.it.k);
        h += `<tr><td>${esc(r.it.k)}</td><td>${esc(r.it.n)}</td>${nq(a.q)}${nq(r.in)}${nq(r.out)}${nq(r.q)}${nc(r.q > 0 ? r.v / r.q : 0)}${nc(r.v)}${nc(r.vout)}</tr>`;
      });
      h += totRow(`<td colspan=7>JUMLAH</td>${nc(tv)}${nc(to)}`) + '</table>';
      if (neg.length) h += `<p class=no>Stok minus pada: ${neg.map(esc).join(', ')} \u2014 periksa mutasi Keluar yang melebihi stok.</p>`;
      if (c.unk.length) h += `<p class=no>${c.unk.length} mutasi memakai kode barang yang tidak ada di Master Barang dan tidak dihitung.</p>`;
      const gl = a => a[0].startsWith('1.1.4.') && (Math.abs(o.cum[a[0]] || 0) > .5 || Math.abs(A[a[0]] || 0) > .5);
      h += rekon(COA.filter(gl).map(a => [a[0] + ' ' + a[1], A[a[0]] || 0, o.cum[a[0]] || 0])) + sig();
    }
    $('#m').innerHTML = h;
  }
};

// Bind globals for inline onclick
Object.assign(window, {
  R, REP, US, STALE, IMPR, status, go, dfield, dPick, dSet, nIn, jTot, jNum, jDel,
  grid, gAdd, gNum, gSet, gDel, svw, rekon, pick, totRow, konBan, expInfo, exp,
  imp, impK, nkAuto, coaAdd, coaEdit, coaDel, coaFilter, coaReset
});
