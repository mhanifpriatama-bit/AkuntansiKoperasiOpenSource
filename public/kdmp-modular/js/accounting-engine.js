/**
 * @license
 * KDMP Akuntansi - Accounting Engine & Financial Calculations Module
 */
import {
  $, S, K, B, num, SUB, asof, P2, ymOf, byD, toast, esc
} from './state.js';
import {
  CFG, COA, COA0, NM, MON, OLDC, LEG, RMK, LAKMAP, CAT, cn, aktif
} from './config.js';
import { kv, save } from './db.js';

export const GRP = new Set(COA0.map(a => a[0].slice(0, 4)));
export const KODE = /^[1-9]\.\d\.\d\.\d{2}$/;

export function dlist() {
  const d = $('#dl');
  if (d) d.innerHTML = COA.map(a => `<option value="${esc(a[0] + ' ' + a[1])}">`).join('');
}

export function setCOA(a) {
  // Update array contents while maintaining reference
  COA.length = 0;
  a.forEach(item => COA.push(item));
  Object.keys(NM).forEach(k => delete NM[k]);
  COA.forEach(x => NM[x[0]] = x[2]);
  dlist();
}

export async function loadCOA() {
  const c = await kv.get('coa');
  if (Array.isArray(c) && c.length) {
    if (c.some(a => a[0] == '#v' && a[1] == '3')) {
      setCOA(c.filter(a => a[0] != '#v'));
    } else {
      const bs = new Set(COA0.map(a => a[0])), od = new Set(OLDC), ex = c.filter(a => a && !bs.has(a[0]) && !od.has(a[0])).map(a => a.slice());
      setCOA(COA0.map(a => a.slice()).concat(ex).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    }
  }
}

export const coaSave = () => kv.set('coa', COA.map(a => a.slice()).concat([['#v', '3', '']]));
export const sortCOA = () => COA.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
export const defN = c => {
  const d = c[0];
  return d == '1' || d == '5' || d == '6' || d == '8' || (d == '9' && c[2] != '1') ? 'Debit' : 'Kredit';
};

export function usedMap() {
  const u = {};
  (K ? Object.values(S.units || {}) : [S]).forEach(x => (x.rows || []).forEach(r => {
    const c = (r.ak || '').split(' ')[0];
    if (c) u[c] = (u[c] || 0) + 1;
  }));
  return u;
}

export function codeErr(c, self) {
  if (!KODE.test(c)) return 'Format kode harus x.x.x.xx, misalnya 6.1.9.24 atau 7.1.1.01 / 8.1.1.01 (awalan 1-9).';
  if (!GRP.has(c.slice(0, 4)) && !/^[78]/.test(c)) return 'Kelompok akun ' + c.slice(0, 4) + ' tidak ada dalam struktur laporan.';
  if (COA.some((a, i) => a[0] == c && i !== self)) return 'Kode akun sudah ada.';
  return '';
}

export function legacy(rows) {
  let ch = 0;
  rows.forEach(r => {
    const p = (r.ak || '').split(' ')[0];
    if (RMK[p]) {
      const n = RMK[p];
      r.ak = n + ' ' + ((COA.find(a => a[0] == n) || [])[1] || '');
      ch = 1;
    } else if (!NM[p] && LEG[p]) {
      COA.push([p, LEG[p][0], LEG[p][1]]);
      NM[p] = LEG[p][1];
      ch = 1;
    }
  });
  if (ch) {
    COA.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    dlist();
  }
}

export const lakOf = c => {
  for (const x of LAKMAP) if (c.startsWith(x[0])) return x[1];
  return null;
};

export function akKom(rows, Y, P) {
  const G = {}, res = new Map();
  rows.forEach(r => {
    if (!r.d || r.kom) return;
    const y = +r.d.slice(0, 4), q = y * 12 + (+r.d.slice(5, 7));
    if (y != Y || q > P) return;
    const c = (r.ak || '').split(' ')[0];
    if (!NM[c]) return;
    const key = String(r.no || '').trim() || (r.ket ? r.d + '|' + String(r.ket).trim().toLowerCase() : '');
    if (!key) return;
    const g = G[key] = G[key] || { cash: [], con: [] }, d = +r.db || 0, k = +r.kr || 0;
    if (c.startsWith('1.1.1.')) {
      if (/saldo awal/i.test(r.ket || '')) return;
      if (d - k < 0) g.cash.push({ r, a: k - d });
    } else if (d - k > 0) g.con.push({ l: lakOf(c), w: d - k });
  });
  for (const key in G) {
    const g = G[key], W = g.con.reduce((s, x) => s + x.w, 0);
    if (!g.cash.length || !W) continue;
    g.cash.forEach(x => {
      const m = {};
      g.con.forEach(z => {
        if (z.l) m[z.l] = (m[z.l] || 0) + x.a * z.w / W;
      });
      if (Object.keys(m).length) res.set(x.r, m);
    });
  }
  return res;
}

export function calc(rows, b) {
  legacy(rows);
  const Y = +S.tahun, P = Y * 12 + b, o = { cum: {}, cumA: {}, mon: {}, dr: {}, kr: {}, kom: {}, open: 0, M: {}, td: 0, tk: 0 };
  rows.forEach(r => {
    const c = (r.ak || '').split(' ')[0], d = +r.db || 0, k = +r.kr || 0;
    if (!r.d) return;
    const y = +r.d.slice(0, 4), q = y * 12 + (+r.d.slice(5, 7));
    if (q > P) return;
    o.td += d;
    o.tk += k;
    if (!NM[c]) return;
    const p = NM[c] == 'Debit' ? d - k : k - d;
    o.cumA[c] = (o.cumA[c] || 0) + p;
    if (c[0] < '4' || y == Y) {
      o.cum[c] = (o.cum[c] || 0) + p;
      o.dr[c] = (o.dr[c] || 0) + d;
      o.kr[c] = (o.kr[c] || 0) + k;
    }
    if (q == P) o.mon[c] = (o.mon[c] || 0) + p;
    if (r.kom && y == Y) o.kom[r.kom] = (o.kom[r.kom] || 0) + p;
    if (c.startsWith('1.1.1.') && (y < Y || /saldo awal/i.test(r.ket || ''))) o.open += p;
  });
  akKom(rows, Y, P).forEach(m => {
    for (const l in m) o.kom[l] = (o.kom[l] || 0) - m[l];
  });
  for (const c in o.cum) {
    const n = NM[c], x = c[0];
    o.M[c] = x == '1' ? (n == 'Debit' ? o.cum[c] : -o.cum[c]) : (x == '2' || x == '3') ? (n == 'Kredit' ? o.cum[c] : -o.cum[c]) : 0;
  }
  const pl = (c, v) => {
    const x = c[0];
    return (x == '4' || x == '7' || c.startsWith('9.1')) ? v : ('568'.includes(x) || c.startsWith('9.2') || c.startsWith('9.3')) ? -v : 0;
  };
  o.lr = m => {
    const r = {};
    for (const c in m) if ('45678'.includes(c[0]) || c[0] == '9') r[c] = m[c];
    return r;
  };
  o.shu = () => {
    let s = 0;
    for (const c in o.cumA) s += pl(c, o.cumA[c]);
    return s;
  };
  o.pri = () => {
    let s = 0;
    for (const c in o.cumA) s += pl(c, o.cumA[c] - (o.cum[c] || 0));
    return s;
  };
  return o;
}

export function ev(spec, map, Lv) {
  const rows = [], key = {};
  let bs = 0, blk = [];
  const sum = p => Object.keys(map).filter(c => c.startsWith(p)).reduce((a, c) => a + map[c], 0);
  spec.forEach(it => {
    const t = it[0];
    if (t == 'B') {
      bs = rows.length;
      blk = [];
      return;
    }
    const r = { it, v: 0 };
    if (t == 'A') r.v = map[it[1]] || 0;
    else if (t == 'O') {
      r.v = it[2].reduce((a, p) => a + sum(p), 0);
      if (!it[5]) blk.forEach(x => {
        if (x.it[0] == 'A' && it[2].some(p => x.it[1].startsWith(p))) r.v -= x.v;
      });
      it[3].forEach(e => r.v -= map[e] || 0);
    } else if (t == 'S') {
      for (let j = bs; j < rows.length; j++) r.v += rows[j].v;
    } else if (t == 'T') {
      r.v = eval(it[3].replace(/\[([^\]]+)\]/g, (_, k) => '(' + (key[k] || 0) + ')'));
    } else if (t == 'L') {
      r.v = (Lv || {})[it[3]] || 0;
    }
    const k = t == 'A' || t == 'S' || t == 'T' || t == 'L' ? it[1] : t == 'O' ? it[4] : null;
    if (k) key[k] = r.v;
    rows.push(r);
    if (t == 'A' || t == 'O' || t == 'L') blk.push(r);
  });
  return { rows, key };
}

export const lab = it => {
  let l = it[0] == 'O' ? it[1] : (it[0] == 'A' && cn(it[1])) || it[2];
  return l[0] == '=' ? 'Laba s/d ' + MON[B() - 1].toUpperCase() + ' ' + S.tahun : l;
};

export function rep(rows, cols, heads, inp) {
  const f = window.f;
  let h = '<table><tr><th>Kode</th><th>Uraian</th>' + heads.map(x => '<th>' + x + '</th>').join('') + '</tr>';
  rows.forEach((r, i) => {
    const it = r.it, t = it[0];
    if (t == 'O' && cols.every(c => Math.abs(c[i]) < .5)) return;
    const cl = t == 'H' ? 'h' + it[1] : (t == 'S' || t == 'T') ? (lab(it) == lab(it).toUpperCase() ? 'g' : 't') : '';
    h += `<tr class="${cl}"><td class=c>${t == 'A' ? it[1] : ''}</td><td>${lab(it)}</td>` + cols.map((c, j) => t == 'H' ? '<td></td>' : inp && j == inp.j && t == 'A' ? `<td class=n><input class="i n" data-k="${it[1]}" value="${S[inp.k][it[1]] || ''}" onchange="S.${inp.k}['${it[1]}']=+this.value||0;save();go()"></td>` : `<td class=n>${f(c[i])}</td>`).join('') + '</tr>';
  });
  return h + '</table>';
}

export function unitData() {
  const o = calc(S.rows, B()), l = ev(CFG.LR, o.lr(o.cumA));
  return { o, Lv: l.key };
}

export function lakRows(o) {
  const v = {};
  return CFG.lak.map((a, i) => {
    const r = 13 + i, [lv, l, tp, g] = a;
    let x = 0;
    if (tp == 'c') x = o.kom[l] || 0;
    else if (tp == 's') {
      for (let j = g[0]; j <= g[1]; j++) x += v[j] || 0;
    } else if (tp == 'x' || tp == 'x1') {
      x = eval(g.slice(1).replace(/SUM\(E(\d+):E(\d+)\)/g, 'E$1+E$2').replace(/E(\d+)/g, (_, n) => '(' + (v[n] || 0) + ')'));
    } else if (tp == 'open') x = o.open;
    v[r] = x;
    return { lv, l, tp, x };
  });
}

export function konX(spec, ms) {
  const have = new Set(spec.filter(x => x[0] == 'A').map(x => x[1])), out = [];
  spec.forEach(it => {
    if (it[0] == 'O') {
      const ex = new Set(it[3]), cs = new Set();
      ms.forEach(m => Object.keys(m).forEach(c => {
        if (!have.has(c) && !ex.has(c) && Math.abs(m[c]) >= .5 && it[2].some(p => c.startsWith(p))) cs.add(c);
      }));
      if (cs.size) {
        const A = [...cs].sort().map(c => {
          have.add(c);
          return ['A', c, cn(c) || c];
        });
        if (it[5] === true) {
          out.push(['H', 2, 'Aset Lain-lain'], ['B'], ...A, ['O', 'Aset lain-lain lainnya', it[2], it[3], null, false], ['S', it[4], 'Total Aset Lain-lain']);
          return;
        }
        out.push(...A);
      }
    }
    out.push(it);
  });
  return out;
}

export function kcols(spec, mode) {
  const U = S.units || {}, ks = ['USP', 'Sembako'], ds = ks.map(k => U[k] ? calc(U[k].rows, B()) : null), m = ds.map(d => d ? (mode == 'nb' ? d.M : d.lr(mode == 'm' ? d.mon : d.cum)) : {}), sp_ = konX(spec, m), ev_ = ds.map((d, i) => ev(sp_, m[i], { shu_final: d ? d.shu() : 0 }));
  const auto = {};
  if (mode == 'nb') {
    const a = (ds[0] && ds[0].M['1.1.9.08']) || 0, b = (ds[1] && ds[1].M['2.1.9.01']) || 0, x = Math.max(0, Math.min(a, b));
    auto['1.1.9.08'] = -x;
    auto['2.1.9.01'] = -x;
  }
  const ek = 'el' + mode, man = S[ek] = S[ek] || {}, em = {};
  Object.keys(Object.assign({}, auto, man)).forEach(c => em[c] = (auto[c] || 0) + (man[c] || 0));
  const ee = ev(sp_, em, {});
  const cols = ev_.map(e => e.rows.map(r => r.v));
  cols.push(cols[0].map((_, i) => cols[0][i] + cols[1][i]));
  cols.push(ee.rows.map(r => r.v));
  cols.push(cols[2].map((v, i) => v + cols[3][i]));
  return { rows: ev_[0].rows, cols, ek, ds };
}

export function akumAt(a, P) {
  const c = num(a.hp), rs = Math.min(num(a.res), c), um = Math.round(num(a.umur) * 12), ct = CAT[a.kat];
  if (!a.tgl || !c || um <= 0 || !ct || !ct[1]) return 0;
  const Q = a.lepas ? Math.min(P, ymOf(a.lepas)) : P, n = Math.max(0, Math.min(Q - ymOf(a.tgl) + 1, um));
  if (a.met == 'Saldo Menurun') {
    const r = 2 / (um / 12) / 12;
    return c - Math.max(rs, c * Math.pow(1 - r, n));
  }
  return (c - rs) * n / um;
}

export function asetCalc() {
  const P = S.tahun * 12 + B(), Py = S.tahun * 12;
  return SUB('aset').map(a => {
    const ak = aktif(a, P), pv = ak ? Math.round(akumAt(a, P - 1)) : 0, cu = ak ? Math.round(akumAt(a, P)) : 0, bl = cu - pv;
    return {
      a, ak, cost: ak ? num(a.hp) : 0, akum: pv + bl, bln: bl,
      ytd: ak ? pv - Math.round(akumAt(a, Py)) : 0, nb: ak ? num(a.hp) - cu : 0,
      st: !a.tgl ? '-' : ymOf(a.tgl) > P ? 'Belum diperoleh' : (a.lepas && ymOf(a.lepas) < P) ? 'Dilepas' : 'Aktif'
    };
  });
}

export function depJurnal() {
  const rs = asetCalc(), g = {};
  rs.forEach(r => {
    const c = CAT[r.a.kat];
    if (!c || !c[1] || Math.abs(r.bln) < .5) return;
    const k = c[2] + '|' + c[1];
    g[k] = (g[k] || 0) + r.bln;
  });
  if (!Object.keys(g).length) return alert('Tidak ada beban penyusutan pada bulan ini.');
  const no = 'DEP-' + S.tahun + P2(B()), ex = S.rows.filter(r => r.no == no);
  if (ex.length && !confirm('Jurnal penyusutan bulan ini sudah ada (' + ex.length + ' baris) dan akan DIGANTI. Lanjut?')) return;
  S.rows = S.rows.filter(r => r.no != no);
  const d = asof(), ket = 'Penyusutan ' + MON[B() - 1] + ' ' + S.tahun;
  Object.entries(g).forEach(([k, v]) => {
    const [b, a] = k.split('|'), x = Math.round(v);
    S.rows.push({ d, no, ak: b + ' ' + cn(b), db: x, kr: 0, ket });
    S.rows.push({ d, no, ak: a + ' ' + cn(a), db: 0, kr: x, ket });
  });
  save();
  if (window.go) window.go();
  toast('Jurnal penyusutan dibuat (lihat tab Jurnal)');
}

export function stokCalc(cut) {
  const m = {};
  SUB('pb').forEach(x => {
    if (x.k) m[x.k] = { it: x, q: 0, v: 0, h: [], in: 0, out: 0, vin: 0, vout: 0 };
  });
  const mon = ymOf(cut), unk = [];
  SUB('pm').map((t, i) => ({ t, i })).filter(x => x.t.d && x.t.d <= cut && x.t.k).sort(byD).forEach(({ t }) => {
    const r = m[t.k];
    if (!r) {
      unk.push(t);
      return;
    }
    const q = num(t.q);
    let cost, iq = 0, oq = 0;
    if (t.j == 'Keluar') {
      const avg = r.q > 0 ? r.v / r.q : 0;
      cost = q * avg;
      r.q -= q;
      r.v -= cost;
      oq = q;
    } else {
      cost = q * num(t.h);
      r.q += q;
      r.v += cost;
      iq = q;
    }
    r.h.push({ t, iq, oq, cost, q: r.q, v: r.v });
    if (ymOf(t.d) == mon) {
      if (oq) {
        r.out += oq;
        r.vout += cost;
      } else {
        r.in += iq;
        r.vin += cost;
      }
    }
  });
  return { m, unk };
}

// Bind globals for inline onclick
Object.assign(window, {
  GRP, KODE, dlist, setCOA, loadCOA, coaSave, sortCOA, defN, usedMap, codeErr,
  legacy, lakOf, akKom, calc, ev, lab, rep, unitData, lakRows, konX, kcols,
  akumAt, asetCalc, depJurnal, stokCalc
});
