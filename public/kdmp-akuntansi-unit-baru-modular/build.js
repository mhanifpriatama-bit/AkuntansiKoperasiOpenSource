#!/usr/bin/env node
/*
 * Padanan build.py untuk yang memakai Node.js (tanpa Python). Hasilnya identik.
 * Pemakaian:  node build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const AKAR = __dirname;
const SRC = path.join(AKAR, 'src');
const POLA = /<!--@(css|js) (\S+?)-->/g;

const baca = (p) => fs.readFileSync(p, 'utf8');
const tulis = (p, teks) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, teks, 'utf8'); };

function daftarBerkas(dir, ext, hasil, awal) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) daftarBerkas(p, ext, hasil, awal);
    else if (p.endsWith('.' + ext)) hasil.push(path.relative(awal, p).split(path.sep).join('/'));
  });
  return hasil;
}

const kerangka = baca(path.join(SRC, 'kerangka.html'));
const terdaftar = [...kerangka.matchAll(POLA)].map((m) => m[2]);
const hilang = terdaftar.filter((b) => !fs.existsSync(path.join(SRC, b)));
if (hilang.length) { console.error('Berkas modul tidak ditemukan: ' + hilang.join(', ')); process.exit(1); }
if (new Set(terdaftar).size !== terdaftar.length) { console.error('Ada modul yang didaftarkan dua kali di src/kerangka.html'); process.exit(1); }
['css', 'js'].forEach((ext) => daftarBerkas(path.join(SRC, ext), ext, [], SRC)
  .filter((b) => !terdaftar.includes(b))
  .sort()
  .forEach((b) => console.log('Peringatan: ' + b + ' ada di src/ tetapi belum didaftarkan di kerangka.html')));

const satu = (_, jenis, berkas) => {
  const tag = jenis === 'css' ? 'style' : 'script';
  return '<' + tag + '>\n' + baca(path.join(SRC, berkas)) + '\n</' + tag + '>';
};
const dev = (_, jenis, berkas) => (jenis === 'css'
  ? '<link rel="stylesheet" href="src/' + berkas + '">'
  : '<script src="src/' + berkas + '"></script>');

tulis(path.join(AKAR, 'dist', 'kdmp-akuntansi.html'), kerangka.replace(POLA, satu));
tulis(path.join(AKAR, 'index.html'), kerangka.replace(POLA, dev));
console.log('Selesai: dist/kdmp-akuntansi.html dan index.html (' + terdaftar.length + ' modul)');
