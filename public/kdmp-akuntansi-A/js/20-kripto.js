/* Kripto: PBKDF2 + AES-GCM, base64, token */
const cat=a=>{const o=new Uint8Array(a.reduce((n,x)=>n+x.length,0));let p=0;a.forEach(x=>{o.set(x,p);p+=x.length});return o},tokOf=async b=>btoa(String.fromCharCode.apply(null,new Uint8Array(await crypto.subtle.digest('SHA-256',b))));
const b64=b=>{b=new Uint8Array(b);let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(s)},ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),E=new TextEncoder(),cs=crypto.subtle,rnd=n=>crypto.getRandomValues(new Uint8Array(n));
async function kdf(p,salt){const k=await cs.importKey('raw',E.encode(p),'PBKDF2',false,['deriveKey']);return cs.deriveKey({name:'PBKDF2',salt,iterations:200000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function enc(k,d){const iv=rnd(12);return b64(iv)+'.'+b64(await cs.encrypt({name:'AES-GCM',iv},k,d))}
const dec=async(k,s)=>{const[i,c]=s.split('.');return new Uint8Array(await cs.decrypt({name:'AES-GCM',iv:ub(i)},k,ub(c)))},dek=r=>cs.importKey('raw',r,'AES-GCM',false,['encrypt','decrypt']),js=async(k,s)=>migCoa(JSON.parse(new TextDecoder().decode(await dec(k,s))));
