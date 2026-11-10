/**
 * @license
 * KDMP Akuntansi - State & Global Utilities Module
 */

export const $ = s => document.querySelector(s);
window.$ = $;

export let K = false;
export let KEY = '';
export let TABS = [];
export let DK = null;
export let RAW = null;
export let PIN = '';
export let META = null;
export let S = null;
export let tab = '';
export let bb = '1.1.1.01';
export let idle = null;
export let TOK = null;
export let REG = null;
export let dirty = false;
export let lastSave = '';
export let lastSnapDay = '';
export let VER = {};
export let syncT = null;
export let IMPR = '';

export const SV = {};
export const SEL = {};
export const KEEP = new Set();

export const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export const P2 = n => String(n).padStart(2, '0');
export const asof = () => S.tahun + '-' + P2(B()) + '-' + P2(new Date(S.tahun, B(), 0).getDate());
export const prevEnd = () => {
  const d = new Date(S.tahun, B() - 1, 0);
  return d.getFullYear() + '-' + P2(d.getMonth() + 1) + '-' + P2(d.getDate());
};
export const ymOf = d => {
  const p = String(d || '').split('-');
  return p.length > 2 ? (+p[0]) * 12 + (+p[1]) : 0;
};
export const num = x => +x || 0;
export const SUB = k => S.sub[k] || (S.sub[k] = []);
export const cl = b => { b.closest('details').open = false; };
export const B = () => +S.bulan;
export const byD = (a, b) => a.t.d < b.t.d ? -1 : a.t.d > b.t.d ? 1 : a.i - b.i;

export function toast(m) {
  const e = $('#tt');
  if (!e) return;
  e.textContent = m;
  e.style.display = 'block';
  clearTimeout(e._t);
  e._t = setTimeout(() => e.style.display = 'none', 2400);
}

export const save = (...args) => (window.save ? window.save(...args) : undefined);

// State setters to allow cross-module mutation
export function setK(v) { K = v; }
export function setKEY(v) { KEY = v; }
export function setTABS(v) { TABS = v; }
export function setDK(v) { DK = v; }
export function setRAW(v) { RAW = v; }
export function setPIN(v) { PIN = v; }
export function setMETA(v) { META = v; }
export function setS(v) { S = v; }
export function setTab(v) { tab = v; }
export function setBb(v) { bb = v; }
export function setIdle(v) { idle = v; }
export function setTOK(v) { TOK = v; }
export function setREG(v) { REG = v; }
export function setDirty(v) { dirty = v; }
export function setLastSave(v) { lastSave = v; }
export function setLastSnapDay(v) { lastSnapDay = v; }
export function setVER(v) { VER = v; }
export function setSyncT(v) { syncT = v; }
export function setIMPR(v) { IMPR = v; }

// Attach to window so inline onclick handlers and script tags have access
Object.assign(window, {
  esc, P2, asof, prevEnd, ymOf, num, SUB, cl, B, byD, toast,
  SV, SEL, KEEP
});

// Define reactive accessors on window for core state variables
['K', 'KEY', 'TABS', 'DK', 'RAW', 'PIN', 'META', 'S', 'tab', 'bb', 'idle', 'TOK', 'REG', 'dirty', 'lastSave', 'lastSnapDay', 'VER', 'syncT', 'IMPR'].forEach(key => {
  try {
    Object.defineProperty(window, key, {
      get() {
        switch (key) {
          case 'K': return K;
          case 'KEY': return KEY;
          case 'TABS': return TABS;
          case 'DK': return DK;
          case 'RAW': return RAW;
          case 'PIN': return PIN;
          case 'META': return META;
          case 'S': return S;
          case 'tab': return tab;
          case 'bb': return bb;
          case 'idle': return idle;
          case 'TOK': return TOK;
          case 'REG': return REG;
          case 'dirty': return dirty;
          case 'lastSave': return lastSave;
          case 'lastSnapDay': return lastSnapDay;
          case 'VER': return VER;
          case 'syncT': return syncT;
          case 'IMPR': return IMPR;
        }
      },
      set(v) {
        switch (key) {
          case 'K': K = v; break;
          case 'KEY': KEY = v; break;
          case 'TABS': TABS = v; break;
          case 'DK': DK = v; break;
          case 'RAW': RAW = v; break;
          case 'PIN': PIN = v; break;
          case 'META': META = v; break;
          case 'S': S = v; break;
          case 'tab': tab = v; break;
          case 'bb': bb = v; break;
          case 'idle': idle = v; break;
          case 'TOK': TOK = v; break;
          case 'REG': REG = v; break;
          case 'dirty': dirty = v; break;
          case 'lastSave': lastSave = v; break;
          case 'lastSnapDay': lastSnapDay = v; break;
          case 'VER': VER = v; break;
          case 'syncT': syncT = v; break;
          case 'IMPR': IMPR = v; break;
        }
      },
      configurable: true
    });
  } catch (e) {}
});

