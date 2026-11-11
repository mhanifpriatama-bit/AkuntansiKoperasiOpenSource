/* Komponen tabel isian buku pembantu & rekonsiliasi */
const PD={aset:()=>({tgl:defDate(),umur:4,met:'Garis Lurus'}),pb:()=>({akun:'1.1.4.01'}),pm:()=>({d:defDate(),j:'Masuk'})},
 SV={},SEL={};
const OPT=(o,v)=>o.map(x=>{const a=Array.isArray(x)?x:[x,x];return `<option value="${esc(a[0])}"${a[0]==v?' selected':''}>${esc(a[1])}</option>`}).join('');
function grid(p,cols,note,dk){const a=SUB(p),PP=S.tahun*12+B(),vis=[];a.forEach((r,i)=>{if(!dk||!r[dk]||ymOf(r[dk])==PP||KEEP.has(r))vis.push(i)});let h=`<div class=bar><button class=p onclick="gAdd('${p}')">+ Baris</button><button onclick="gAdd('${p}',10)">+10 Baris</button><span class=c>${dk?'<b>Periode '+MON[B()-1]+' '+S.tahun+'</b> ('+vis.length+' baris). Ganti bulan/tahun di kanan atas untuk periode lain; data periode sebelumnya tetap tersimpan. ':''}${note||''}</span></div><table><tr><th>#</th>${cols.map(c=>`<th>${c.l}</th>`).join('')}<th></th></tr>`;
 vis.forEach((i,ix)=>{const r=a[i];h+=`<tr><td class=c>${ix+1}</td>`+cols.map(c=>{const v=r[c.k];if(c.t=='date')return `<td>${dfield(v,p+':'+i+':'+c.k,dk==c.k)}</td>`;if(c.o)return `<td><select onchange="gSet('${p}',${i},'${c.k}',this.value)"><option></option>${OPT(c.o,v)}</select></td>`;if(c.m)return `<td class="n"${c.w?` style="min-width:${c.w}px"`:''}><input class="i n" inputmode=numeric value="${fmtN(v)}" oninput="nIn(this)" onchange="gNum('${p}',${i},'${c.k}',this)"></td>`;const n=c.t=='number';return `<td class="${n?'n':''}"${c.w?` style="min-width:${c.w}px"`:''}><input class="i ${n?'n':''}" type="${c.t||'text'}"${c.list?' list='+c.list:''} value="${esc(v)}" onchange="gSet('${p}',${i},'${c.k}',this.value,${n})"></td>`}).join('')+`<td><button onclick="gDel('${p}',${i})">\u00d7</button></td></tr>`});
 return h+'</table>'}
function gAdd(p,n){const a=SUB(p);for(let i=0;i<(n||1);i++){const o=PD[p]?PD[p]():{};a.push(o);KEEP.add(o)};save();go()}
function gNum(p,i,k,el){const v=idn(el.value);SUB(p)[i][k]=v;el.value=fmtN(v);save()}
function gSet(p,i,k,v,n){SUB(p)[i][k]=n?(+v||0):v;save()}
function gDel(p,i){if(confirm('Hapus baris ini?')){SUB(p).splice(i,1);save();go()}}
function svw(tab,list){const cur=list.includes(SV[tab])?SV[tab]:list[0];SV[tab]=cur;return[cur,`<div class="bar sbar">${list.map(x=>`<button class="${x==cur?'on':''}" onclick="SV['${tab}']='${x}';go()">${x}</button>`).join('')}</div>`]}
function rekon(rows,jd){let h=`<h4>${jd||'Rekonsiliasi dengan Buku Besar'}</h4><table><tr><th>Akun</th><th>Buku Pembantu</th><th>Buku Besar</th><th>Selisih</th><th>Status</th></tr>`;rows.forEach(([l,s,g])=>{const d=s-g,ok=Math.round(d)==0;h+=`<tr><td>${l}</td>${nc(s)}${nc(g)}${nc(d)}<td class="${ok?'ok':'no'}">${ok?'Sesuai':'Selisih'}</td></tr>`});return h+'</table>'}
const pick=(key,lid,ph)=>`<div class=bar><label>${ph}: <input list=${lid} style=width:220px value="${esc(SEL[key]||'')}" onchange="SEL['${key}']=this.value.trim();go()"></label></div>`,
 totRow=(cells,cls)=>`<tr class="${cls||'g'}">${cells}</tr>`;
