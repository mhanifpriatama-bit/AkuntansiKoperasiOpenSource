/* Simpan otomatis terenkripsi + titik pulih otomatis */
let tm,dirty=false,lastSave='',lastSnapDay='';
async function saveNow(){clearTimeout(tm);if(!S||!DK)return;const d=Object.assign({},S);delete d.units;const blob=await enc(DK,E.encode(JSON.stringify(d))),hari=new Date().toISOString().slice(0,10);
 if(lastSnapDay!=hari){lastSnapDay=hari;const old=await kv.get(KEY);if(old)await kv.setP('snap_'+CFG.unit+'_'+Date.now(),{t:Date.now(),l:'Otomatis (sebelum perubahan pertama hari ini)',d:old});await pruneSnap()}
 await kv.setP(KEY,blob);dirty=false;lastSave=new Date().toLocaleTimeString('id-ID');setSt()}
const save=()=>{dirty=true;setSt();clearTimeout(tm);tm=setTimeout(saveNow,300)};
async function pruneSnap(){const pre='snap_'+CFG.unit+'_',all=await kv.all(pre),ks=Object.keys(all).filter(k=>k.startsWith(pre)).sort();while(ks.length>5)await kv.del(ks.shift())}
async function manualSave(){if(!S)return;await saveNow();toast('Data tersimpan ke database aplikasi ('+lastSave+')')}
