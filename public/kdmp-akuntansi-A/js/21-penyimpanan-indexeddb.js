/* Penyimpanan lokal IndexedDB (kv) */
const kv={db:null,
 open(){return new Promise((ok,er)=>{if(!window.indexedDB)return er(new Error('Browser ini tidak mendukung IndexedDB.'));const q=indexedDB.open('kdmp_akuntansi',1);q.onupgradeneeded=()=>{q.result.createObjectStore('s',{keyPath:'k'})};q.onsuccess=()=>{kv.db=q.result;kv.db.onversionchange=()=>{kv.db.close()};ok()};q.onerror=()=>er(q.error||new Error('Database gagal dibuka'));q.onblocked=()=>er(new Error('Database terblokir oleh tab lain. Tutup tab lain lalu muat ulang.'))})},
 tx(mode,fn){return new Promise((ok,er)=>{let r;const t=kv.db.transaction('s',mode);try{r=fn(t.objectStore('s'))}catch(e){return er(e)}t.oncomplete=()=>ok(r&&'result' in r?r.result:undefined);t.onabort=t.onerror=()=>er(t.error||new Error('Transaksi database gagal'))})},
 async get(k){const r=await this.tx('readonly',s=>s.get(k));return r?r.v:undefined},
 set(k,v){return this.tx('readwrite',s=>s.put({k,v,t:Date.now()})).then(()=>true)},
 setP(k,v){return this.set(k,v)},
 del(k){return this.tx('readwrite',s=>s.delete(k)).then(()=>true)},
 async all(pre){const o={},p=pre||'',rs=await this.tx('readonly',s=>s.getAll());rs.forEach(r=>{if(String(r.k).indexOf(p)===0)o[r.k]=r.v});return o},
 async ver(keys){const o={},rs=await this.tx('readonly',s=>s.getAll());rs.forEach(r=>{if(keys.indexOf(r.k)>=0)o[r.k]=String(r.t)});return o},
 setAll(o){const t=Date.now();return this.tx('readwrite',s=>{for(const k in o)s.put({k,v:o[k],t})}).then(()=>true)},
 clear(){return this.tx('readwrite',s=>s.clear()).then(()=>true)}};
