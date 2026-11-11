/* Pemetaan otomatis Komponen Arus Kas dari akun lawan */
const LAKMAP=[['1.1.4.','Pembelian Harga Pokok Barang'],['5.','Pembelian Harga Pokok Barang'],['2.1.3.','Pembelian Harga Pokok Barang'],['6.1.9.09','Pembayaran Pajak'],['9.3.','Pembayaran Pajak'],['2.1.4.','Pembayaran Pajak'],['6.1.4.','Pembayaran Beban Telepon'],['2.1.6.','Pembayaran Beban Telepon'],['6.2.','Pembayaran Beban Pemasaran'],['6.1.8.',null],['6.1.7.',null],['6.1.','Pembayaran Beban Administrasi'],['2.1.5.','Pembayaran Beban Administrasi'],['9.2.','Pengeluaran Beban Lain-lain'],['1.3.9.',null],['1.3.','Pembelian Aset Tetap'],['1.2.','Pengeluaran Investasi'],['2.2.','Pembayaran Pinjaman Jangka Panjang'],['2.1.2.','Pembagian SHU']];
const lakOf=c=>{for(const x of LAKMAP)if(c.startsWith(x[0]))return x[1];return null};
function akKom(rows,Y,P){const G={},res=new Map();
  rows.forEach(r=>{if(!r.d||r.kom)return;const y=+r.d.slice(0,4),q=y*12+(+r.d.slice(5,7));if(y!=Y||q>P)return;const c=(r.ak||'').split(' ')[0];if(!NM[c])return;
   const key=String(r.no||'').trim()||(r.ket?r.d+'|'+String(r.ket).trim().toLowerCase():'');if(!key)return;const g=G[key]=G[key]||{cash:[],con:[]},d=+r.db||0,k=+r.kr||0;
   if(c.startsWith('1.1.1.')){if(/saldo awal/i.test(r.ket||''))return;if(d-k<0)g.cash.push({r,a:k-d})}else if(d-k>0)g.con.push({l:lakOf(c),w:d-k})});
  for(const key in G){const g=G[key],W=g.con.reduce((s,x)=>s+x.w,0);if(!g.cash.length||!W)continue;
   g.cash.forEach(x=>{const m={};g.con.forEach(z=>{if(z.l)m[z.l]=(m[z.l]||0)+x.a*z.w/W});if(Object.keys(m).length)res.set(x.r,m)})}
  return res}
