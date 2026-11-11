/* Variabel global aplikasi: S=data aktif, K=mode konsolidasi, DK/RAW/PIN/META=kunci & sandi sesi */
const $=s=>document.querySelector(s);let K,KEY,TABS,DK,RAW,PIN,META,S,tab,bb='1.1.1.01',idle;
/* f: format angka rupiah (negatif dalam kurung, nol jadi '-') */
const f=n=>Math.abs(n)<.5?'-':n<0?'('+Math.round(-n).toLocaleString('id-ID')+')':Math.round(n).toLocaleString('id-ID');
let TOK=null,REG=null;
const R={}; // R[nama tab] = fungsi yang menggambar tab
