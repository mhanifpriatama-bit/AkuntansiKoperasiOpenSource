/* Konstanta global: nama bulan, peta kode akun -> saldo normal (NM), daftar akun (COA) */
const LOGO=APLIKASI.logo;
const NM={},MON=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var COA=CFG.coa,COA0=JSON.parse(JSON.stringify(CFG.coa));COA.forEach(a=>NM[a[0]]=a[2]);
