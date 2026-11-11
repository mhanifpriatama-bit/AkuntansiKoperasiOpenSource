/* Ekspor/impor paket unit (.kdmp.json) & ganti sandi */
async function exp(){await saveNow();const m=META.units[CFG.unit],ts=Date.now();await dl_('KDMP_'+CFG.unit+'_'+new Date().toISOString().slice(0,10)+'.kdmp.json',{app:'kdmp2',unit:CFG.unit,ts,saltA:META.saltA,s:m.s,wU:m.wU,wA:m.wA,tgl:new Date(ts).toLocaleString('id-ID'),data:await enc(DK,E.encode(JSON.stringify({rows:S.rows.filter(r=>r.ak||r.db||r.kr),kop:S.kop,tahun:S.tahun,sub:S.sub,cv:3})))});await kv.set('lastexp_'+CFG.unit,ts);expInfo()}
const STALE=7*864e5,dtf=t=>new Date(t).toLocaleString('id-ID');let IMPR='';
async function expInfo(){const e=$('#ei');if(!e||K)return;const le=await kv.get('lastexp_'+CFG.unit),v=await kv.ver([KEY]),t=v[KEY]?+v[KEY]:0;e.innerHTML=!le?'<b class=no>\u26a0 Paket belum pernah diekspor untuk bendahara.</b>':'Terakhir diekspor untuk bendahara: <b>'+dtf(le)+'</b>'+(t>le+1000?' \u2014 <b class=no>\u26a0 ada perubahan data setelah itu, ekspor ulang.</b>':' \u2014 <span class=ok>data sudah sama dengan paket.</span>')}
function konBan(){if(!K||!S.units)return '';const m=[];for(const k of US){const u=S.units[k],im=S.imp&&S.imp[k];if(!u||(!im&&!(u.rows&&u.rows.length)))m.push(k+': belum ada data');else if(im){const t=u.ts||u.impT||0;if(Date.now()-t>STALE)m.push(k+': paket sudah '+Math.floor((Date.now()-t)/864e5)+' hari \u2014 minta ekspor ulang')}}return m.length?'<p class=c style="color:#A4161F;font-weight:bold">\u26a0 Konsolidasi belum lengkap/terbaru \u2014 '+m.join('; ')+'. Buka tab Data Unit.</p>':''}
function imp(fl){const r=new FileReader();r.onload=async()=>{try{const o=JSON.parse(r.result);if(o.unit!=CFG.unit)throw 0;const d=await js(await dek(await dec(await kdf(PIN,ub(o.s)),o.wU)),o.data);S.rows=d.rows;S.kop=d.kop||S.kop;if(d.sub)S.sub=d.sub;save();go('Jurnal')}catch(e){alert('Gagal: file bukan milik unit ini atau sandi berbeda.')}};r.readAsText(fl)}
async function impK(fl){fl=[...fl];if(!fl.length)return;const L=[],best={};
 for(const f of fl){try{const o=JSON.parse(await f.text());
  if(o&&o.app=='kdmp-full'&&o.kv&&o.kv.meta){const mt=o.kv.meta;let AK,n=0;try{AK=await kdf(PIN,ub(mt.saltA))}catch(e){throw new Error('backup rusak')}
   for(const u of US){const x=o.kv['d_'+u];if(!x||!mt.units||!mt.units[u])continue;let d;
    try{d=await js(await dek(await dec(AK,mt.units[u].wA)),x)}catch(e){throw new Error('sandi Admin di komputer asal berbeda dengan sandi Admin Anda')}
    d.tgl=o.tgl;d.ts=o.ts||0;d.impT=Date.now();(best[u]=best[u]||[]).push({d,fn:f.name,u});n++}
   if(!n)throw new Error('backup ini tidak berisi data unit USP/Sembako (unduh Backup Database dari komputer unit)');
   if(Array.isArray(o.kv.coa)){const nw=o.kv.coa.filter(a=>Array.isArray(a)&&KODE.test(a[0])&&a[1]&&(a[2]=='Debit'||a[2]=='Kredit')&&!NM[a[0]]);
    if(nw.length){nw.forEach(a=>COA.push([a[0],a[1],a[2]]));sortCOA();setCOA(COA);coaSave();L.push({ok:1,n:f.name,m:nw.length+' akun tambahan dari COA unit ditambahkan ke Master COA: '+esc(nw.map(a=>a[0]).join(', '))})}}
   continue}
  if(!o||o.app!='kdmp2'||!US.includes(o.unit)||!o.data)throw new Error('bukan paket unit (.kdmp.json) atau Backup Database KDMP yang valid');
  let d;try{d=await js(await dek(await dec(await kdf(PIN,ub(o.saltA)),o.wA)),o.data)}catch(e){throw new Error('sandi Admin di komputer asal berbeda dengan sandi Admin Anda')}
  d.tgl=o.tgl;d.ts=o.ts||0;d.impT=Date.now();(best[o.unit]=best[o.unit]||[]).push({d,fn:f.name,u:o.unit})}catch(e){L.push({ok:0,n:f.name,m:e.message||'gagal dibuka'})}}
 for(const u in best){const a=best[u].sort((x,y)=>(y.d.ts||0)-(x.d.ts||0)),w=a[0];
  a.slice(1).forEach(x=>L.push({ok:0,n:x.fn,m:'dilewati \u2014 ada file '+u+' yang lebih baru'}));
  S.imp[u]=w.d;S.units[u]=w.d;const th=+w.d.tahun!=+S.tahun?' <b class=no>(tahun data '+w.d.tahun+', periode konsolidasi '+S.tahun+')</b>':'';
  L.push({ok:1,n:w.fn,m:'unit <b>'+u+'</b> diimpor \u2014 '+(w.d.rows||[]).length+' baris jurnal, diekspor '+esc(w.d.tgl||'-')+th})}
 if(L.some(x=>x.ok))save();
 IMPR='<div style="background:#fff;padding:10px 14px;margin:10px 0;border-left:4px solid #1F3864"><b>Hasil impor</b>'+L.map(x=>`<div class="${x.ok?'ok':'no'}">${x.ok?'\u2714':'\u2716'} ${esc(x.n)} \u2014 ${x.ok?x.m:esc(x.m)}</div>`).join('')+(L.some(x=>x.ok)?'<div style="margin-top:8px"><button class=p onclick="go(\'Neraca Konsolidasi\')">Lihat Neraca Konsolidasi</button></div>':'')+'</div>';
 go('Data Unit')}
async function chg(u,np){if(!np||np.length<6)return alert('Sandi minimal 6 karakter');if(u=='Admin'&&K){const s=rnd(16),AK=await kdf(np,s);for(const k of US)META.units[k].wA=await enc(AK,RAW[k]);META.saltA=b64(s);DK=AK;PIN=np;save()}else if(K?US.includes(u):u==CFG.unit){const s=rnd(16);META.units[u].s=b64(s);META.units[u].wU=await enc(await kdf(np,s),K?RAW[u]:RAW);if(!K)PIN=np}else return alert('Tidak diizinkan');try{await kv.set('meta',META);alert('Sandi diganti')}catch(e){alert('Gagal menyimpan ke server: '+(e&&e.message||e))}}
