// Uji hitungan FIFO (tanpa browser): node alat/uji-fifo.js
globalThis.window=globalThis;const fs=require('fs');
for(const f of ['namespace','config/aplikasi','core/format','core/persediaan']){new Function(fs.readFileSync((process.argv[2]||require('path').join(__dirname,'..'))+'/src/js/'+f+'.js','utf8')).call(globalThis);}
const KDMP=globalThis.KDMP;const P=KDMP.core.persediaan, as=require('assert');
const B=[{k:'B1',n:'Beras',akun:'1.1.4.01'}];
const M=[
 {d:'2026-01-01',no:'SA',k:'B1',j:'Saldo Awal',q:10,h:100},
 {d:'2026-01-05',no:'M1',k:'B1',j:'Masuk',q:10,h:120},
 {d:'2026-01-06',no:'K1',k:'B1',j:'Keluar',q:15},
 {d:'2026-01-07',no:'RB',k:'B1',j:'Keluar',q:2,lot:'M1'},
 {d:'2026-01-08',no:'K2',k:'B1',j:'Keluar',q:5}];
let r=P.hitungStok(B,M,'2026-01-31','FIFO').m.B1;
// K1: 10*100+5*120=1600; RB lot M1: 2*120=240; K2: 3*120 (sisa M1) =360 +2 minus
as.strictEqual(r.h[2].cost,1600);as.strictEqual(r.h[3].cost,240);
as.strictEqual(r.minus,true);as.strictEqual(r.q,-2);
// sama tanggal: Keluar setelah Masuk meski Keluar diinput lebih dulu
let r2=P.hitungStok(B,[{d:'2026-02-01',no:'K',k:'B1',j:'Keluar',q:5},{d:'2026-02-01',no:'M',k:'B1',j:'Masuk',q:5,h:50}],'2026-02-28','FIFO').m.B1;
as.strictEqual(r2.minus,false);as.strictEqual(r2.v,0);
// RATA tidak berubah
let r3=P.hitungStok(B,M.slice(0,3),'2026-01-31').m.B1;as.strictEqual(r3.h[2].cost,15*110);
as.strictEqual(P.metodeUnit({sub:{hpp:'FIFO'}}),'FIFO');as.strictEqual(P.metodeUnit({sub:{}}),'RATA');
console.log('uji FIFO lolos');
