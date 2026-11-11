/* Utilitas UI & format: esc, tanggal, toast, status simpan, navigasi tab (go) */
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),
 P2=n=>String(n).padStart(2,'0'),
 asof=()=>S.tahun+'-'+P2(B())+'-'+P2(new Date(S.tahun,B(),0).getDate()),
 prevEnd=()=>{const d=new Date(S.tahun,B()-1,0);return d.getFullYear()+'-'+P2(d.getMonth()+1)+'-'+P2(d.getDate())},
 ymOf=d=>{const p=String(d||'').split('-');return p.length>2?(+p[0])*12+(+p[1]):0},
 num=x=>+x||0,
 SUB=k=>S.sub[k]||(S.sub[k]=[]),
 fq=v=>Math.abs(v)<1e-9?'-':(+v).toLocaleString('id-ID',{maximumFractionDigits:2}),
 nq=v=>`<td class=n data-v="${v}">${fq(v)}</td>`,
 nc=v=>`<td class=n>${f(v)}</td>`,
 cl=b=>{b.closest('details').open=false},
 cn=c=>(COA.find(a=>a[0]==c)||[])[1]||'',
 byD=(a,b)=>a.t.d<b.t.d?-1:a.t.d>b.t.d?1:a.i-b.i;
function toast(m){const e=$('#tt');e.textContent=m;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',2400)}
const KEEP=new Set();
function status(){let o;if(K){$('#st').innerHTML='';return}o=calc(S.rows,B());const b=Math.round(o.td-o.tk)==0;$('#st').innerHTML=`<span class="${b?'ok':'no'}" style="background:#fff;padding:3px 8px;border-radius:4px">${b?'Jurnal balance':'Selisih '+f(o.td-o.tk)}</span>`}
function go(t){if(t)tab=t;$('#nav').innerHTML=TABS.map(x=>`<button class="${x==tab?'on':''}" onclick="go('${x}')">${x}</button>`).join('');status();setSt();R[tab]();if(K&&tab!='Data Unit')$('#m').insertAdjacentHTML('afterbegin',konBan());if(REP.includes(tab))$('#m').insertAdjacentHTML('beforeend',sig())}
function setSt(){const e=$('#sv');if(!e)return;e.textContent=dirty?'Menyimpan\u2026':lastSave?'Tersimpan '+lastSave:'Siap';e.className='sv '+(dirty?'w':'k')}
