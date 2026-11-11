/* Memulai sesi setelah login */
async function start(u){await loadCOA();lastSnapDay='';lastSave='';dirty=false;CFG.unit=u;K=u=='KONSOL';KEY='d_'+u;const c=K?CFG.KON:CFG.U[u];CFG.LPK=c.LPK;CFG.LR=c.LR;CFG.name=c.name;
 const ld=async(k,key)=>{const v=await kv.get(k);if(!v)return null;try{return await js(key,v)}catch(e){return null}};
 S=await ld(KEY,DK)||{bulan:new Date().getMonth()+1,tahun:new Date().getFullYear(),kop:APLIKASI.singkatan,rows:[],cv:3};
  (S.rows||[]).forEach(r=>{if(r.kom=='Pembayaran Utang Jangka Panjang')r.kom='Pembayaran Pinjaman Jangka Panjang'});
 S.sub=S.sub||{};if(K){S.imp=S.imp||{};S.units={};for(const k of US){const d=await ld('d_'+k,await dek(RAW[k]));S.units[k]=S.imp[k]||{rows:d?d.rows:[],tgl:d?'lokal (browser ini)':'belum ada data'}}}
 TABS=K?['Neraca Konsolidasi','Laba Rugi Konsolidasi','Master COA','Data Unit']:['Jurnal','Buku Besar','Neraca Saldo','Laba Rugi','Neraca','Arus Kas'].concat(u=='Sembako'?['BP Aset','BP Persediaan']:['BP Aset'],['Data']);
 $('#ov').style.display='none';$('#ttl').textContent=c.name;document.title=c.name;$('#lg').src=LG();
 $('#bln').innerHTML=MON.map((m,i)=>`<option value=${i+1}>${m}</option>`).join('');$('#bln').value=S.bulan;$('#thn').value=S.tahun;$('#bln').onchange=e=>{S.bulan=+e.target.value;KEEP.clear();save();go()};$('#thn').onchange=e=>{S.tahun=+e.target.value;KEEP.clear();save();go()};
 dlist();const rst=()=>{clearTimeout(idle);idle=setTimeout(()=>location.reload(),600000)};['click','keydown'].forEach(e=>addEventListener(e,rst));rst();go(TABS[0]);startSync()}
