/* Menyusun laporan dari spesifikasi (ev, rep, lakRows) dan konsolidasi (konX, kcols) */
function ev(spec,map,Lv){const rows=[],key={};let bs=0,blk=[];const sum=p=>Object.keys(map).filter(c=>c.startsWith(p)).reduce((a,c)=>a+map[c],0);
 spec.forEach(it=>{const t=it[0];if(t=='B'){bs=rows.length;blk=[];return}const r={it,v:0};
  if(t=='A')r.v=map[it[1]]||0;else if(t=='O'){r.v=it[2].reduce((a,p)=>a+sum(p),0);if(!it[5])blk.forEach(x=>{if(x.it[0]=='A'&&it[2].some(p=>x.it[1].startsWith(p)))r.v-=x.v});it[3].forEach(e=>r.v-=map[e]||0)}
  else if(t=='S'){for(let j=bs;j<rows.length;j++)r.v+=rows[j].v}else if(t=='T')r.v=eval(it[3].replace(/\[([^\]]+)\]/g,(_,k)=>'('+(key[k]||0)+')'));else if(t=='L')r.v=(Lv||{})[it[3]]||0;
  const k=t=='A'||t=='S'||t=='T'||t=='L'?it[1]:t=='O'?it[4]:null;if(k)key[k]=r.v;rows.push(r);if(t=='A'||t=='O'||t=='L')blk.push(r)});return{rows,key}}
const lab=it=>{let l=it[0]=='O'?it[1]:(it[0]=='A'&&cn(it[1]))||it[2];return l[0]=='='?'Laba s/d '+MON[B()-1].toUpperCase()+' '+S.tahun:l};
function rep(rows,cols,heads,inp){let h='<table><tr><th>Kode</th><th>Uraian</th>'+heads.map(x=>'<th>'+x+'</th>').join('')+'</tr>';
 rows.forEach((r,i)=>{const it=r.it,t=it[0];if(t=='O'&&cols.every(c=>Math.abs(c[i])<.5))return;const cl=t=='H'?'h'+it[1]:(t=='S'||t=='T')?(lab(it)==lab(it).toUpperCase()?'g':'t'):'';
  h+=`<tr class="${cl}"><td class=c>${t=='A'?it[1]:''}</td><td>${lab(it)}</td>`+cols.map((c,j)=>t=='H'?'<td></td>':inp&&j==inp.j&&t=='A'?`<td class=n><input class="i n" data-k="${it[1]}" value="${S[inp.k][it[1]]||''}" onchange="S.${inp.k}['${it[1]}']=+this.value||0;save();go()"></td>`:`<td class=n>${f(c[i])}</td>`).join('')+'</tr>'});return h+'</table>'}
function unitData(){const o=calc(S.rows,B()),l=ev(CFG.LR,o.lr(o.cumA));return{o,Lv:l.key}}
function lakRows(o){const v={};return CFG.lak.map((a,i)=>{const r=13+i,[lv,l,tp,g]=a;let x=0;if(tp=='c')x=o.kom[l]||0;else if(tp=='s'){for(let j=g[0];j<=g[1];j++)x+=v[j]||0}else if(tp=='x'||tp=='x1')x=eval(g.slice(1).replace(/SUM\(E(\d+):E(\d+)\)/g,'E$1+E$2').replace(/E(\d+)/g,(_,n)=>'('+(v[n]||0)+')'));else if(tp=='open')x=o.open;v[r]=x;return{lv,l,tp,x}})}
function konX(spec,ms){const have=new Set(spec.filter(x=>x[0]=='A').map(x=>x[1])),out=[];
 spec.forEach(it=>{if(it[0]=='O'){const ex=new Set(it[3]),cs=new Set();ms.forEach(m=>Object.keys(m).forEach(c=>{if(!have.has(c)&&!ex.has(c)&&Math.abs(m[c])>=.5&&it[2].some(p=>c.startsWith(p)))cs.add(c)}));
  if(cs.size){const A=[...cs].sort().map(c=>{have.add(c);return['A',c,cn(c)||c]});
   if(it[5]===true){out.push(['H',2,'Aset Lain-lain'],['B'],...A,['O','Aset lain-lain lainnya',it[2],it[3],null,false],['S',it[4],'Total Aset Lain-lain']);return}
   out.push(...A)}}
  out.push(it)});return out}
function kcols(spec,mode){const U=S.units||{},ks=['USP','Sembako'],ds=ks.map(k=>U[k]?calc(U[k].rows,B()):null),m=ds.map(d=>d?(mode=='nb'?d.M:d.lr(mode=='m'?d.mon:d.cum)):{}),sp_=konX(spec,m),ev_=ds.map((d,i)=>ev(sp_,m[i],{shu_final:d?d.shu():0}));
 const auto={};if(mode=='nb'){const a=(ds[0]&&ds[0].M['1.1.9.08'])||0,b=(ds[1]&&ds[1].M['2.1.9.01'])||0,x=Math.max(0,Math.min(a,b));auto['1.1.9.08']=-x;auto['2.1.9.01']=-x}
 const ek='el'+mode,man=S[ek]=S[ek]||{},em={};Object.keys(Object.assign({},auto,man)).forEach(c=>em[c]=(auto[c]||0)+(man[c]||0));const ee=ev(sp_,em,{});
 const cols=ev_.map(e=>e.rows.map(r=>r.v));cols.push(cols[0].map((_,i)=>cols[0][i]+cols[1][i]));cols.push(ee.rows.map(r=>r.v));cols.push(cols[2].map((v,i)=>v+cols[3][i]));return{rows:ev_[0].rows,cols,ek,ds}}
