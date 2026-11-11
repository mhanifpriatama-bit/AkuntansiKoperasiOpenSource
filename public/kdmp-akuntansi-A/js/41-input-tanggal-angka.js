/* Input tanggal (dd/mm/yyyy + pemilih) dan input angka berformat */
const todayIso=()=>{const d=new Date();return d.getFullYear()+'-'+P2(d.getMonth()+1)+'-'+P2(d.getDate())},
  defDate=()=>todayIso(),
  dmy=v=>{const p=String(v||'').split('-');return p.length==3&&p[0].length==4?p[2]+'/'+p[1]+'/'+p[0]:String(v||'')},
  idn=s=>{s=String(s==null?'':s).replace(/\./g,'').replace(',','.');return +s.replace(/[^0-9.\-]/g,'')||0},
  fmtN=v=>{v=+v;return v?v.toLocaleString('id-ID',{maximumFractionDigits:2}):''};
function chkD(a){const d=new Date(a[0],a[1]-1,a[2]);return d.getFullYear()==a[0]&&d.getMonth()==a[1]-1&&d.getDate()==a[2]?a[0]+'-'+P2(a[1])+'-'+P2(a[2]):''}
function pIso(s){s=String(s||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return chkD(s.split('-').map(Number));
  const m=s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/)||s.match(/^(\d{2})(\d{2})(\d{4})$/);if(!m)return '';let y=+m[3];if(m[3].length==2)y+=2000;return chkD([y,+m[2],+m[1]])}
const dfield=(v,t,fl)=>`<div class=dt data-t="${t}" data-v="${esc(v||'')}"${fl?' data-fl=1':''}><input class="i dti" placeholder="dd/mm/yyyy" value="${dmy(v)}" onchange="dSet(this)"><button type=button class=dtb title="Pilih tanggal" onclick="dPick(this)">&#128197;</button><input type=date class=dtp tabindex=-1 value="${esc(v||'')}" onchange="dSet(this)"></div>`;
function dPick(b){const p=b.parentNode.querySelector('.dtp');try{p.showPicker()}catch(e){try{p.focus();p.click()}catch(e2){}}}
function dSet(el){const w=el.closest('.dt'),t=w.dataset.t.split(':'),tx=w.querySelector('.dti'),pk=w.querySelector('.dtp');let v;
  if(el.type=='date')v=el.value;else if(!el.value.trim())v='';else{v=pIso(el.value);if(!v){toast('Format tanggal: dd/mm/yyyy');tx.value=dmy(w.dataset.v);return}}
  w.dataset.v=v;tx.value=dmy(v);pk.value=v;if(t[0]=='rows')S.rows[+t[1]][t[2]]=v;else SUB(t[0])[+t[1]][t[2]]=v;save();if(t[0]=='rows')status();
  if(w.dataset.fl&&v){const q=ymOf(v);if(q!=S.tahun*12+B()){KEEP.delete(t[0]=='rows'?S.rows[+t[1]]:SUB(t[0])[+t[1]]);const m=q%12||12,y=(q-m)/12;toast('Baris dipindahkan ke periode '+MON[m-1]+' '+y);go()}}}
function nIn(el){const v=el.value,p=el.selectionStart;let k=0;for(let i=0;i<p;i++)if(/[\d,]/.test(v[i]))k++;
  const s=v.replace(/[^\d,]/g,''),ci=s.indexOf(',');let a=ci<0?s:s.slice(0,ci);const b=ci<0?null:s.slice(ci+1).replace(/,/g,'').slice(0,2);
  a=a.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.');const nv=a+(b===null?'':','+b);el.value=nv;let c=0,np=0;for(;np<nv.length&&c<k;np++)if(/[\d,]/.test(nv[np]))c++;try{el.setSelectionRange(np,np)}catch(e){}}
