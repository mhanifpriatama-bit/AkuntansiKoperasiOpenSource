#!/usr/bin/env node
/*
 * Menggabungkan index.html + css + js + logo menjadi SATU berkas HTML mandiri (dist/kdmp-akuntansi.html),
 * supaya mudah dibagikan ke pengguna koperasi (cukup satu berkas, bisa dibuka offline).
 * Tanpa dependensi: hanya Node.js. Pemakaian (dari folder proyek):  node tools/satu-berkas.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const baca = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'assets/logo.png')).toString('base64');

let html = baca('index.html');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, f) => '<style>\n' + baca(f) + '\n</style>');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) => {
  const kode = baca(f).replace(/assets\/logo\.png/g, logo).replace(/<\/script/gi, '<\\/script');
  return '<script>\n' + kode + '\n</script>';
});
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const keluar = path.join(root, 'dist', 'kdmp-akuntansi.html');
fs.writeFileSync(keluar, html);
console.log('Dibuat:', keluar, '(' + Math.round(html.length / 1024) + ' KB)');
