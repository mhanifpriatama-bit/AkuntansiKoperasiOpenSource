/*
 * Memuat berkas config + core + security dalam satu konteks Node (vm) seperti browser memuat <script>,
 * tanpa DOM. Mengembalikan objek KDMP. Dipakai semua tes.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..', 'js');
const BERKAS = [
  'namespace',
  'config/aplikasi', 'config/coa', 'config/coa-legacy', 'config/arus-kas', 'config/pemetaan-arus-kas', 'config/aset-tetap',
  'config/laporan-usp', 'config/laporan-sembako', 'config/laporan-konsolidasi',
  'core/format', 'core/rumus', 'core/coa', 'core/arus-kas', 'core/saldo', 'core/laporan', 'core/konsolidasi', 'core/aset-tetap', 'core/persediaan',
  'security/kripto', 'security/kunci'
];

/** Konteks baru (state COA bersih) untuk tiap pemanggilan. */
function muat() {
  const ctx = { console, crypto: globalThis.crypto, TextEncoder, TextDecoder, btoa, atob };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of BERKAS) vm.runInContext(fs.readFileSync(path.join(ROOT, f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  return ctx.KDMP;
}

const dataSintetis = () => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data-sintetis.json'), 'utf8'));

module.exports = { muat, dataSintetis };
