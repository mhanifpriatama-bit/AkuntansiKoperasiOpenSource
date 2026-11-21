// Uji alur impor data POS di browser (butuh Node 22 dan Google Chrome): node alat/uji-impor-pos.js file:///jalur/ke/index.html 9351
const { spawn } = require('child_process');
const [, , url, port] = process.argv;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + port,
    '--user-data-dir=/tmp/smoke-' + port, 'about:blank'], { stdio: 'ignore' });
  try {
    let daftar;
    for (let i = 0; i < 40; i++) { try { daftar = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json(); break; } catch (e) { await tidur(250); } }
    const hal = daftar.find((x) => x.type === 'page');
    const ws = new WebSocket(hal.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let id = 0; const tunggu = {}; const galat = [];
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && tunggu[m.id]) tunggu[m.id](m);
      if (m.method === 'Runtime.exceptionThrown') galat.push(m.params.exceptionDetails.text + ' ' + ((m.params.exceptionDetails.exception || {}).description || ''));
    };
    const kirim = (method, params) => new Promise((r) => { const n = ++id; tunggu[n] = r; ws.send(JSON.stringify({ id: n, method, params })); });
    const js = async (ekspresi) => { const r = await kirim('Runtime.evaluate', { expression: ekspresi, awaitPromise: true, returnByValue: true }); return r.result.result ? r.result.result.value : r.result; };
    await kirim('Runtime.enable'); await kirim('Page.enable');
    await kirim('Page.navigate', { url });
    await tidur(2500);
    const teks = (s) => `(document.querySelector('${s}')||{}).innerText||''`;
    const hasil = {};
    hasil.tahap1 = (await js(teks('#ov'))).replace(/\s+/g, ' ').slice(0, 60);
    await js(`['Admin','USP','Sembako'].forEach(function(u){document.getElementById('p_'+u).value='rahasia123'}); document.querySelector('[data-aksi="sesi.setup"]').click(); 1`);
    await tidur(2500);
    hasil.tahap2 = (await js(teks('#ov'))).replace(/\s+/g, ' ').slice(0, 60);
    await js(`document.getElementById('lu').value='Sembako'; document.getElementById('lp').value='rahasia123'; document.querySelector('#ov form').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); 1`);
    await tidur(3000);
    hasil.judul = await js(teks('#ttl'));
    hasil.tab = (await js(`Array.from(document.querySelectorAll('#nav button')).map(function(b){return b.textContent}).join(' | ')`));
    const as = require('assert');
    // Siapkan: FIFO, barang, saldo awal, bulan aktif Januari 2027
    const hasilSiap = await js(`(async function(){
      var a=KDMP.app.state; a.data.tahun=2027; a.data.bulan=1; a.data.sub.hpp='FIFO';
      a.data.sub.pb=[{k:'BRS-5KG',n:'Beras',akun:'1.1.4.02'}];
      a.data.sub.pm=[{d:'2026-12-31',no:'SA',k:'BRS-5KG',j:'Saldo Awal',q:60,h:62000,ket:''}];
      a.data.rows=[{d:'2026-12-31',no:'SA-1',ak:'1.1.4.02 Persediaan Barang dari Bulog',db:3720000,kr:0,ket:'Saldo awal',kom:''},{d:'2026-12-31',no:'SA-1',ak:'3.1.1.01 Simpanan Pokok',db:0,kr:3720000,ket:'Saldo awal',kom:''}];
      a.data.templatPos=['T1'];
      var P=KDMP.core.posKontrak;
      var J=function(no,ak,db,kr,kom){return {d:'2027-01-05',no:no,ak:ak,db:db,kr:kr,ket:'x',kom:kom||''}};
      var jurnal=[J('POS-20270105-JUAL','1.1.1.01 Kas Tunai',1000000,0,'Penerimaan Kas dari Pelayanan kepada Anggota'),J('POS-20270105-JUAL','4.1.1.01 Pendapatan Penjualan Barang Dagangan',0,1000000),J('POS-20270105-JUAL','5.1.1.01 Harga Pokok Penjualan Barang Dagangan',620000,0),J('POS-20270105-JUAL','1.1.4.02 Persediaan Barang dari Bulog',0,620000)];
      var ms=[{d:'2027-01-05',no:'POS-20270105-JUAL',k:'BRS-5KG',j:'Keluar',q:10,h:62000,nilai:620000,ket:''}];
      var pos={app:'kdmp-pos-data',versi:1,idBatch:'B1',idTemplat:'T1',unit:'Sembako',dibuat:'2027-01-06T07:00:00+07:00',periode:{dari:'2027-01-05',sampai:'2027-01-05'},jurnal:jurnal,mutasiStok:ms,barangBaru:[],kontrol:{jumlahJurnal:4,jumlahMutasi:1,totalDebit:1620000,totalKredit:1620000,saldoAkhir:{'1.1.1.01':1000000,'1.1.4.02':3100000}}};
      pos.kontrol.checksum=await P.hitungChecksum(jurnal,ms,[]);
      window.__pos=pos; return 'siap';})()`);
    as.strictEqual(hasilSiap, 'siap');
    await js(`KDMP.app.navigasi.pergi('Data'); 1`);
    as.ok((await js(teks('#m'))).includes('Pertukaran data dengan POS'), 'bagian POS tidak tampil di tab Data');
    // Impor lewat input berkas sungguhan (dispatch change dengan File)
    const pilihBerkas = (objek, nama) => js(`(function(){var i=document.querySelector('[data-aksi-ubah="pos.impor"]');var dt=new DataTransfer();dt.items.add(new File([JSON.stringify(${objek})],'${nama}',{type:'application/json'}));i.files=dt.files;i.dispatchEvent(new Event('change',{bubbles:true}));return 1})()`);
    await pilihBerkas('window.__pos', 'data.json'); await tidur(800);
    let kotak = await js(teks('#posbox'));
    as.ok(kotak.includes('Pratinjau impor') && kotak.includes('Terapkan impor') && !/galat — impor ditolak/.test(kotak), 'pratinjau: ' + kotak.slice(0, 200));
    await js(`document.querySelector('[data-aksi="pos.terapkan"]').click(); 1`); await tidur(1500);
    kotak = await js(teks('#posbox'));
    as.ok(kotak.includes('Impor selesai'), 'hasil: ' + kotak.slice(0, 200));
    const n1 = await js(`KDMP.app.state.data.rows.length`);
    as.strictEqual(n1, 2 + 4);
    // Idempoten: impor ulang berkas yang sama tidak menambah baris
    await js(`KDMP.app.navigasi.pergi('Data'); 1`);
    await pilihBerkas('window.__pos', 'data.json'); await tidur(800);
    await js(`document.querySelector('[data-aksi="pos.terapkan"]').click(); 1`); await tidur(1500);
    as.strictEqual(await js(`KDMP.app.state.data.rows.length`), 6);
    as.strictEqual(await js(`Object.keys(KDMP.app.state.data.imporPos).length`), 1);
    // Titik pulih otomatis terbentuk
    const tp = await js(`KDMP.storage.titikPulih.daftar(KDMP.app.state.unit).then(function(l){return l.map(function(x){return x.l}).join('|')})`);
    as.ok(tp.includes('Sebelum impor POS B1'), 'titik pulih: ' + tp);
    // Berkas rusak ditolak, data tidak berubah
    await js(`KDMP.app.navigasi.pergi('Data'); 1`);
    await pilihBerkas('Object.assign({},window.__pos,{jurnal:window.__pos.jurnal.slice(1)})', 'rusak.json'); await tidur(800);
    kotak = await js(teks('#posbox'));
    as.ok(/galat — impor ditolak/.test(kotak) && !kotak.includes('Terapkan impor'), 'rusak: ' + kotak.slice(0, 200));
    as.strictEqual(await js(`KDMP.app.state.data.rows.length`), 6);
    // Neraca dan Jurnal tetap tampil tanpa galat
    await js(`KDMP.app.navigasi.pergi('Jurnal'); 1`);
    as.ok((await js(`document.querySelectorAll('tr.pos').length`)) === 4);
    await js(`KDMP.app.navigasi.pergi('Neraca'); 1`);
    as.deepStrictEqual(galat, []);
    console.log('uji impor POS (browser) lolos');
    ws.close();
  } finally { chrome.kill('SIGKILL'); }
})().catch((e) => { console.error('GAGAL', e); process.exit(1); });
