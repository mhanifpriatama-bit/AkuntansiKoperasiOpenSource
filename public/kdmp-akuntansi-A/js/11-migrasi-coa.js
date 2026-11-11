/* Migrasi data lama (kode akun versi lama -> baru) */
function migCoa(d){if(!d||typeof d!='object'||!Array.isArray(d.rows)||d.cv==3)return d;
 d.rows.forEach(r=>{const p=(r.ak||'').split(' ')[0];if(MIG[p])r.ak=MIG[p]+' '+((COA0.find(a=>a[0]==MIG[p])||[])[1]||'')});
 Object.keys(d).forEach(k=>{if(/^el/.test(k)&&d[k]&&typeof d[k]=='object'&&!Array.isArray(d[k])){const o={};Object.keys(d[k]).forEach(c=>{const n=MIG[c]||c;o[n]=(o[n]||0)+d[k][c]});d[k]=o}});
 if(d.imp&&typeof d.imp=='object')Object.values(d.imp).forEach(migCoa);d.cv=3;return d}
function legacy(rows){let ch=0;rows.forEach(r=>{const p=(r.ak||'').split(' ')[0];if(RMK[p]){const n=RMK[p];r.ak=n+' '+((COA.find(a=>a[0]==n)||[])[1]||'');ch=1}else if(!NM[p]&&LEG[p]){COA.push([p,LEG[p][0],LEG[p][1]]);NM[p]=LEG[p][1];ch=1}});if(ch){COA.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);dlist()}}
