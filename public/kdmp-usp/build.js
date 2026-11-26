// Menyatukan semua berkas menjadi satu HTML mandiri: node build.js -> dist/kdmp-usp.html
const fs = require('fs'), path = require('path');
const s = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const skrip = ['inti.js', 'layanan.js', 'simpan.js', 'app.js'].map(s).join('\n;\n').replace(/<\/script/gi, '<\\/script');
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'kdmp-usp.html'), s('app.html').replace('<!--SKRIP-->', () => skrip));
console.log('Selesai: dist/kdmp-usp.html');
