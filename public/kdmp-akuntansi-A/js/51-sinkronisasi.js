/* Sinkronisasi antar tab browser (polling IndexedDB) */
let VER={},syncT;const setSync=t=>{const e=$('#sync');if(e)e.textContent=t};
const verNow=()=>kv.ver(['d_USP','d_Sembako','d_Kantor','coa']);
async function startSync(){try{VER=await verNow()}catch(e){VER={}}clearInterval(syncT);syncT=setInterval(pollSync,10000);setSync('\u2714 database lokal (offline)')}
async function pollSync(){if(document.hidden||!S||!DK)return;try{const v=await verNow(),ch=Object.keys(v).filter(k=>VER[k]!==v[k]);if(!ch.length){setSync('\ud83d\udd04 sinkron '+new Date().toLocaleTimeString('id-ID'));return}
 for(const k of ch){if(k=='coa'){await loadCOA();continue}const u=k.slice(2);if(K&&US.includes(u)&&!(S.imp&&S.imp[u])){const x=await kv.get(k);if(x){try{const d=await js(await dek(RAW[u]),x);S.units[u]={rows:d.rows,tgl:'sinkron '+new Date().toLocaleTimeString('id-ID')}}catch(e){}}}}
 VER=v;setSync('\ud83d\udd04 data diperbarui '+new Date().toLocaleTimeString('id-ID'));const a=document.activeElement;if(K&&!(a&&a.tagName=='INPUT'))go()}catch(e){setSync('\u26a0 tidak terhubung')}}
