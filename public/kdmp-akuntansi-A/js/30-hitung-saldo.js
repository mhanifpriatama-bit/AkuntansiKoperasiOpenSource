/* Hitung saldo akun dari jurnal (calc) */
const B=()=>+S.bulan;
function calc(rows,b){legacy(rows);const Y=+S.tahun,P=Y*12+b,o={cum:{},cumA:{},mon:{},dr:{},kr:{},kom:{},open:0,M:{},td:0,tk:0};
  rows.forEach(r=>{const c=(r.ak||'').split(' ')[0],d=+r.db||0,k=+r.kr||0;if(!r.d)return;const y=+r.d.slice(0,4),q=y*12+(+r.d.slice(5,7));if(q>P)return;o.td+=d;o.tk+=k;if(!NM[c])return;const p=NM[c]=='Debit'?d-k:k-d;o.cumA[c]=(o.cumA[c]||0)+p;if(c[0]<'4'||y==Y){o.cum[c]=(o.cum[c]||0)+p;o.dr[c]=(o.dr[c]||0)+d;o.kr[c]=(o.kr[c]||0)+k}if(q==P)o.mon[c]=(o.mon[c]||0)+p;if(r.kom&&y==Y)o.kom[r.kom]=(o.kom[r.kom]||0)+p;if(c.startsWith('1.1.1.')&&(y<Y||/saldo awal/i.test(r.ket||'')))o.open+=p});
  akKom(rows,Y,P).forEach(m=>{for(const l in m)o.kom[l]=(o.kom[l]||0)-m[l]});
  for(const c in o.cum){const n=NM[c],x=c[0];o.M[c]=x=='1'?(n=='Debit'?o.cum[c]:-o.cum[c]):(x=='2'||x=='3')?(n=='Kredit'?o.cum[c]:-o.cum[c]):0}
  const pl=(c,v)=>{const x=c[0];return (x=='4'||x=='7'||c.startsWith('9.1'))?v:('568'.includes(x)||c.startsWith('9.2')||c.startsWith('9.3'))?-v:0};
  o.lr=m=>{const r={};for(const c in m)if('45678'.includes(c[0])||c[0]=='9')r[c]=m[c];return r};o.shu=()=>{let s=0;for(const c in o.cumA)s+=pl(c,o.cumA[c]);return s};o.pri=()=>{let s=0;for(const c in o.cumA)s+=pl(c,o.cumA[c]-(o.cum[c]||0));return s};return o}
