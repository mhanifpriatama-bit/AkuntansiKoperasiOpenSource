/**
 * @license
 * KDMP Akuntansi - Formatter & Export Module (PDF, Excel, CSV, JSON)
 */
import {
  S, K, tab, setTab, B, P2, esc, toast
} from './state.js';
import {
  CFG, COA, NM, MON, tgl
} from './config.js';
import {
  KODE, GRP, usedMap, setCOA, coaSave
} from './accounting-engine.js';

export const f = n => Math.abs(n) < .5 ? '-' : n < 0 ? '(' + Math.round(-n).toLocaleString('id-ID') + ')' : Math.round(n).toLocaleString('id-ID');
export const fq = v => Math.abs(v) < 1e-9 ? '-' : (+v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
export const nq = v => `<td class=n data-v="${v}">${fq(v)}</td>`;
export const nc = v => `<td class=n>${f(v)}</td>`;

export const todayIso = () => {
  const d = new Date();
  return d.getFullYear() + '-' + P2(d.getMonth() + 1) + '-' + P2(d.getDate());
};
export const defDate = () => todayIso();

export const dmy = v => {
  const p = String(v || '').split('-');
  return p.length == 3 && p[0].length == 4 ? p[2] + '/' + p[1] + '/' + p[0] : String(v || '');
};

export const idn = s => {
  s = String(s == null ? '' : s).replace(/\./g, '').replace(',', '.');
  return +s.replace(/[^0-9.\-]/g, '') || 0;
};

export const fmtN = v => {
  v = +v;
  return v ? v.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '';
};

export function chkD(a) {
  const d = new Date(a[0], a[1] - 1, a[2]);
  return d.getFullYear() == a[0] && d.getMonth() == a[1] - 1 && d.getDate() == a[2] ? a[0] + '-' + P2(a[1]) + '-' + P2(a[2]) : '';
}

export function pIso(s) {
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return chkD(s.split('-').map(Number));
  const m = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/) || s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (!m) return '';
  let y = +m[3];
  if (m[3].length == 2) y += 2000;
  return chkD([y, +m[2], +m[1]]);
}

export async function saveAs(n, blob) {
  if (window.showSaveFilePicker) {
    try {
      const h = await showSaveFilePicker({ suggestedName: n }), w = await h.createWritable();
      await w.write(blob);
      await w.close();
      return;
    } catch (e) {
      if (e.name == 'AbortError') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = n;
  a.click();
}

export function printNow() {
  const st = document.createElement('style');
  st.textContent = '@page{size:A4 ' + ((K || /^BP /.test(tab)) ? 'landscape' : 'portrait') + ';margin:12mm}';
  document.head.appendChild(st);
  window.print();
  setTimeout(() => st.remove(), 800);
}

export const dl_ = (n, o) => saveAs(n, new Blob([JSON.stringify(o)], { type: 'application/json' }));

export function mat() {
  const out = [];
  document.querySelectorAll('#m table:not(.sg)').forEach((t, ti) => {
    if (ti) out.push({ c: '', v: [] });
    [...t.rows].forEach(r => {
      const th = r.cells[0] && r.cells[0].tagName == 'TH';
      out.push({
        c: (r.className || '') + (th ? ' th' : ''),
        v: [...r.cells].map(c => {
          const s = c.querySelector('select'), i = c.querySelector('input');
          let x;
          if (c.dataset.v !== undefined) return +c.dataset.v;
          if (i) x = c.classList.contains('n') ? (i.dataset.f ? idn(i.value) : (+i.value || 0)) : i.value.trim();
          else if (s) x = s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '';
          else {
            x = c.textContent.trim();
            if (c.classList.contains('n')) {
              if (x === '-' || x === '') x = 0;
              else if (/^-?\(?[\d.]+\)?$/.test(x)) {
                const v = +x.replace(/[().]/g, '');
                x = /^\(/.test(x) ? -v : v;
              }
            }
          }
          return x;
        })
      });
    });
  });
  return out;
}

export const fname = (n, e) => (CFG.unit + '_' + n).replace(/[^\w]+/g, '_') + '_' + MON[B() - 1] + S.tahun + '.' + e;

export function csv() {
  const m = mat();
  if (!m.length) return alert('Tidak ada tabel untuk diekspor.');
  const q = x => /[;"\n]/.test(x + '') ? '"' + (x + '').replace(/"/g, '""') + '"' : x;
  const r = [(S.kop || '') + ' \u2014 ' + CFG.name, tab + ' \u2014 per ' + tgl(), ''].map(q).concat(m.map(row => row.v.map(q).join(';')));
  saveAs(fname(tab, 'csv'), new Blob(['\ufeff' + r.join('\r\n')], { type: 'text/csv' }));
}

export function xlsOut(secs, nm) {
  let h = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>';
  secs.forEach(([t, m]) => {
    const w = Math.max(1, ...m.map(r => r.v.length));
    h += `<table border=1 style="border-collapse:collapse"><tr><td colspan=${w} style="font-size:14pt;font-weight:bold">${esc((S.kop || '') + ' \u2014 ' + CFG.name)}</td></tr><tr><td colspan=${w} style="font-weight:bold">${esc(t)} \u2014 per ${tgl()}</td></tr><tr><td colspan=${w}></td></tr>`;
    m.forEach(r => {
      const k = ' ' + r.c + ' ', st = k.includes(' th ') ? 'background:#7F1018;color:#fff;font-weight:bold' : k.includes(' g ') ? 'background:#A4161F;color:#fff;font-weight:bold' : k.includes(' h1 ') ? 'background:#F0D9DA;font-weight:bold' : k.includes(' h2 ') ? 'background:#F9ECEC;font-weight:bold' : k.includes(' t ') ? 'background:#eee;font-weight:bold' : '';
      h += `<tr style="${st}">` + r.v.map(x => typeof x == 'number' ? `<td${Number.isInteger(x) ? ` style="mso-number-format:'#,##0;(#,##0)'"` : ''}>${x}</td>` : `<td>${esc(x)}</td>`).join('') + '</tr>';
    });
    h += '</table><br>';
  });
  saveAs(fname(nm, 'xls'), new Blob(['\ufeff' + h + '</body></html>'], { type: 'application/vnd.ms-excel' }));
}

export function xls() {
  const m = mat();
  if (!m.length) return alert('Tidak ada tabel untuk diekspor.');
  xlsOut([[tab, m]], tab);
}

export function xlsAll() {
  const list = K ? ['Neraca Konsolidasi', 'Laba Rugi Konsolidasi'] : ['Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas'], cur = tab, secs = [];
  list.forEach(t => {
    setTab(t);
    window.R[t]();
    secs.push([t, mat()]);
  });
  setTab(cur);
  if (window.go) window.go();
  xlsOut(secs, 'Semua_Laporan');
}

export function coaExp() {
  saveAs('KDMP_COA.json', new Blob([JSON.stringify({ app: 'kdmp-coa', tgl: new Date().toLocaleString('id-ID'), coa: COA })], { type: 'application/json' }));
}

export function coaImp(fl) {
  if (!fl) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const o = JSON.parse(r.result);
      if (o.app != 'kdmp-coa' || !Array.isArray(o.coa)) throw 0;
      const nw = o.coa;
      if (!nw.every(a => Array.isArray(a) && KODE.test(a[0]) && (GRP.has(a[0].slice(0, 4)) || /^[78]/.test(a[0])) && a[1] && (a[2] == 'Debit' || a[2] == 'Kredit'))) throw 0;
      const u = usedMap(), m = {};
      nw.forEach(a => m[a[0]] = a[2]);
      const bad = Object.keys(u).filter(c => m[c] !== (NM[c]));
      if (bad.length) return alert('COA ditolak: akun yang sudah dipakai di jurnal harus tetap ada dengan saldo normal sama (' + bad.slice(0, 6).join(', ') + ').');
      if (!confirm('Ganti daftar akun dengan ' + nw.length + ' akun dari file ini?')) return;
      setCOA(nw);
      coaSave();
      if (window.go) window.go();
      toast('COA diimpor');
    } catch (e) {
      alert('File bukan ekspor COA KDMP yang valid.');
    }
  };
  r.readAsText(fl);
}

// Bind globals for inline onclick
Object.assign(window, {
  f, fq, nq, nc, todayIso, defDate, dmy, idn, fmtN, chkD, pIso, saveAs,
  printNow, dl_, mat, fname, csv, xlsOut, xls, xlsAll, coaExp, coaImp
});
