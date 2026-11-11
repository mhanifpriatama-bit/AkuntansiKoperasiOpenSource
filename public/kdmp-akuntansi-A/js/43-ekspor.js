/* Ekspor: simpan berkas, cetak, CSV, Excel (.xls) */
async function saveAs(n,blob){if(window.showSaveFilePicker){try{const h=await showSaveFilePicker({suggestedName:n}),w=await h.createWritable();await w.write(blob);await w.close();return}catch(e){if(e.name=='AbortError')return}}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;a.click()}
function printNow(){const st=document.createElement('style');st.textContent='@page{size:A4 '+((K||/^BP /.test(tab))?'landscape':'portrait')+';margin:12mm}';document.head.appendChild(st);window.print();setTimeout(()=>st.remove(),800)}
const dl_=(n,o)=>saveAs(n,new Blob([JSON.stringify(o)],{type:'application/json'}));
function mat(){const out=[];document.querySelectorAll('#m table:not(.sg)').forEach((t,ti)=>{if(ti)out.push({c:'',v:[]});[...t.rows].forEach(r=>{const th=r.cells[0]&&r.cells[0].tagName=='TH';out.push({c:(r.className||'')+(th?' th':''),v:[...r.cells].map(c=>{const s=c.querySelector('select'),i=c.querySelector('input');let x;
 if(c.dataset.v!==undefined)return +c.dataset.v;
 if(i)x=c.classList.contains('n')?(i.dataset.f?idn(i.value):(+i.value||0)):i.value.trim();
 else if(s)x=s.options[s.selectedIndex]?s.options[s.selectedIndex].text:'';
 else{x=c.textContent.trim();if(c.classList.contains('n')){if(x==='-'||x==='')x=0;else if(/^-?\(?[\d.]+\)?$/.test(x)){const v=+x.replace(/[().]/g,'');x=/^\(/.test(x)?-v:v}}}
 return x})})})});return out}
const fname=(n,e)=>(CFG.unit+'_'+n).replace(/[^\w]+/g,'_')+'_'+MON[B()-1]+S.tahun+'.'+e;
function csv(){const m=mat();if(!m.length)return alert('Tidak ada tabel untuk diekspor.');const q=x=>/[;"\n]/.test(x+'')?'"'+(x+'').replace(/"/g,'""')+'"':x;
 const r=[(S.kop||'')+' \u2014 '+CFG.name,tab+' \u2014 per '+tgl(),''].map(q).concat(m.map(r=>r.v.map(q).join(';')));
 saveAs(fname(tab,'csv'),new Blob(['\ufeff'+r.join('\r\n')],{type:'text/csv'}))}
function xlsOut(secs,nm){let h='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>';
 secs.forEach(([t,m])=>{const w=Math.max(1,...m.map(r=>r.v.length));h+=`<table border=1 style="border-collapse:collapse"><tr><td colspan=${w} style="font-size:14pt;font-weight:bold">${esc((S.kop||'')+' \u2014 '+CFG.name)}</td></tr><tr><td colspan=${w} style="font-weight:bold">${esc(t)} \u2014 per ${tgl()}</td></tr><tr><td colspan=${w}></td></tr>`;
  m.forEach(r=>{const k=' '+r.c+' ',st=k.includes(' th ')?'background:#7F1018;color:#fff;font-weight:bold':k.includes(' g ')?'background:#A4161F;color:#fff;font-weight:bold':k.includes(' h1 ')?'background:#F0D9DA;font-weight:bold':k.includes(' h2 ')?'background:#F9ECEC;font-weight:bold':k.includes(' t ')?'background:#eee;font-weight:bold':'';
   h+=`<tr style="${st}">`+r.v.map(x=>typeof x=='number'?`<td${Number.isInteger(x)?` style="mso-number-format:'#,##0;(#,##0)'"`:''}>${x}</td>`:`<td>${esc(x)}</td>`).join('')+'</tr>'});h+='</table><br>'});
 saveAs(fname(nm,'xls'),new Blob(['\ufeff'+h+'</body></html>'],{type:'application/vnd.ms-excel'}))}
function xls(){const m=mat();if(!m.length)return alert('Tidak ada tabel untuk diekspor.');xlsOut([[tab,m]],tab)}
function xlsAll(){const list=K?['Neraca Konsolidasi','Laba Rugi Konsolidasi']:['Neraca Saldo','Laba Rugi','Neraca','Arus Kas'],cur=tab,secs=[];list.forEach(t=>{tab=t;R[t]();secs.push([t,mat()])});tab=cur;go();xlsOut(secs,'Semua_Laporan')}
