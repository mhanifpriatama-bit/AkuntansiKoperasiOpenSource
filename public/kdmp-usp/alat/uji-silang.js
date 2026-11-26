// Silang: berkas ekspor aplikasi USP (dibuat alat/asap.py) harus lolos validasi akuntansiApp. Jalankan asap.py lebih dulu.
const fs=require('fs'),path=require('path'),as=require('assert');
globalThis.window=globalThis;
const dasar=path.join(__dirname,"..","..","kdmp-akuntansi-unit-baru-modular","src");
const urut=[...fs.readFileSync(path.join(dasar,'kerangka.html'),'utf8').matchAll(/<!--@js (\S+?)-->/g)].map(m=>m[1]).filter(f=>/^js\/(namespace|config|core)\//.test(f)||f==='js/namespace.js');
for(const f of urut) new Function(fs.readFileSync(path.join(dasar,f),'utf8')).call(globalThis);
const K=globalThis.KDMP,U=K.core.uspKontrak;
const d=JSON.parse(fs.readFileSync('/tmp/usp-ekspor.json','utf8'));
const R=(a,db,kr)=>({d:'2000-01-01',no:'SA-1',ak:a,db,kr,ket:'',kom:''});
const rows=[R('1.1.1.01 Kas Tunai',20000000,0),R('3.1.5.01 Modal Awal',0,20000000)];
const ctx={unit:'USP',rows,impor:{},templatDikenal:['T-UJI'],coaAda:k=>!!K.core.coa.saldoNormal[k],komponen:K.config.komponenArusKas};
U.validasiData(d,ctx).then(v=>{console.log('galat',JSON.stringify(v.galat),'peringatan',JSON.stringify(v.peringatan));as.deepStrictEqual(v.galat,[]);});
