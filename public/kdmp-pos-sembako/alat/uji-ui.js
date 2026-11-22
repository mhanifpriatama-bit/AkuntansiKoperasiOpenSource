// Uji UI POS di Chrome headless + lintas-validasi akuntansiApp (Node 22 dan Google Chrome):
//   node alat/uji-ui.js file://$PWD/dist/kdmp-pos-sembako.html 9361
const { spawn } = require('child_process');
const [, , url, port] = process.argv;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require('fs'), path = require('path'), as = require('assert');
globalThis.window = globalThis;
const AK = path.join(__dirname, '..', '..', 'kdmp-akuntansi-unit-baru-modular', 'src');
[...fs.readFileSync(path.join(AK, 'kerangka.html'), 'utf8').matchAll(/<!--@js (\S+?)-->/g)].map((m) => m[1]).filter((f) => /^js\/(config|core)\//.test(f) || f === 'js/namespace.js')
  .forEach((f) => new Function(fs.readFileSync(path.join(AK, f), 'utf8')).call(globalThis));
const K = globalThis.KDMP;

(async () => {
  const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + port,
    '--user-data-dir=/tmp/uipos-' + port + '-' + Date.now(), 'about:blank'], { stdio: 'ignore' });
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
    await tidur(1500);
    const teks = (s) => `(document.querySelector('${s}')||{}).innerText||''`;
    const set = (sel, v) => js(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return 'TIDAK ADA ${sel.replace(/'/g, '')}';if(e.type==='checkbox')e.checked=!!${JSON.stringify(v)};else e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'})()`);
    const klik = (a, extra) => js(`(function(){var e=document.querySelector('[data-a="${a}"]${extra || ''}');if(!e)return 'TIDAK ADA ${a}';e.click();return 'ok'})()`);
    const ok = async (p) => as.strictEqual(await p, 'ok');
    const toast = () => js(`(document.getElementById('toast')||{}).textContent||''`);
    const tab = (n) => klik('tab', `[data-t="${n}"]`);

    // Data awal akuntansiApp + template
    const R = (d, no, ak, db, kr) => ({ d, no, ak, db, kr, ket: 'Saldo awal', kom: '' });
    const rows = [R('2026-12-31', 'SA-1', '1.1.1.01 Kas Tunai', 15000000, 0), R('2026-12-31', 'SA-1', '1.1.1.02 Kas di Bank BRI', 5000000, 0), R('2026-12-31', 'SA-1', '1.1.2.01 Piutang Usaha', 400000, 0),
      R('2026-12-31', 'SA-1', '1.1.4.02 Persediaan Barang dari Bulog', 3760000, 0), R('2026-12-31', 'SA-1', '2.1.3.01 Utang Usaha', 0, 800000), R('2026-12-31', 'SA-1', '3.1.1.01 Simpanan Pokok', 0, 23360000)];
    const barangA = [{ k: 'BRS-5KG', n: 'Beras Premium 5 kg', akun: '1.1.4.02' }];
    const mutasiA = [{ d: '2026-12-31', no: 'SA', k: 'BRS-5KG', j: 'Saldo Awal', q: 40, h: 62000, ket: '' }, { d: '2026-12-31', no: 'SA2', k: 'BRS-5KG', j: 'Saldo Awal', q: 20, h: 64000, ket: '' }];
    const komponen = K.config.komponenArusKas;
    const tpl = K.core.posKontrak.bangunTemplat({ unit: 'Sembako', tahun: 2027, bulan: 1, rows, barang: barangA, mutasi: mutasiA, coaDaftar: K.core.coa.daftar, komponen, koperasi: 'KDMP', now: '2027-01-02T08:30:00+07:00', idTemplat: 'T-UI' });

    as.ok((await js(teks('#isi'))).includes('Belum ada template'), 'awal: harus minta template');
    // Kasir adalah halaman utama; navigasi lewat tombol Menu di samping judul
    as.strictEqual(await js(`POS.u.pos()`), 'Kasir');
    as.strictEqual(await js(`!!document.querySelector('nav')`), false, 'bilah tab lama harus hilang');
    as.strictEqual(await js(`document.querySelector('header h1').nextElementSibling.contains(document.getElementById('menu'))`), true, 'tombol Menu harus di samping judul');
    as.strictEqual(await js(`document.getElementById('menupanel').hidden`), true);
    await ok(klik('menu')); as.strictEqual(await js(`document.getElementById('menupanel').hidden`), false);
    as.ok((await js(teks('#menupanel'))).includes('Ekspor/Impor') && (await js(teks('#menupanel'))).includes('Master'));
    await ok(klik('tab', '[data-t="Ekspor/Impor"]')); as.strictEqual(await js(`document.getElementById('menupanel').hidden`), true, 'menu menutup setelah memilih');
    as.strictEqual(await js(`POS.u.pos()`), 'Ekspor/Impor');
    await js(`window.__tpl=${JSON.stringify(tpl)}; 1`);
    const pilihBerkas = (b, objek, nama) => js(`(function(){var i=document.querySelector('[data-b="${b}"]');var dt=new DataTransfer();dt.items.add(new File([JSON.stringify(${objek})],'${nama}',{type:'application/json'}));i.files=dt.files;i.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'})()`);
    await ok(pilihBerkas('x.templat', 'window.__tpl', 'template.json')); await tidur(400);
    as.ok((await js(teks('#isi'))).includes('Template aktif'), 'template tidak terimpor');
    // Template yang rusak ditolak
    await ok(pilihBerkas('x.templat', '{app:"lain"}', 'rusak.json')); await tidur(300);
    as.ok((await toast()).includes('template POS'), 'template rusak harus ditolak: ' + await toast());

    // Master
    await ok(tab('Master'));
    await ok(klik('m.tambahP'));
    await ok(set('[data-f="m.p.0.nama"]', 'Bu Sri')); await ok(set('[data-f="m.p.0.anggota"]', true)); await ok(set('[data-f="m.p.0.saldoAwal"]', '400.000'));
    await ok(klik('m.tambahP')); await ok(set('[data-f="m.p.1.nama"]', 'Pak Budi'));
    await ok(set('[data-f="m.b.0.harga"]', '70.000'));
    await ok(set('[data-f="m.b.0.barcode"]', '8999999000011'));
    as.strictEqual(await js(`POS.S.barang[0].barcode`), '8999999000011');
    await ok(klik('m.tambahB')); await ok(set('[data-f="m.b.1.barcode"]', '8999999000011'));
    as.ok((await toast()).includes('sudah dipakai'), 'barcode ganda harus ditolak: ' + await toast());
    await ok(klik('m.hapusB', '[data-i="1"]'));
    await ok(set('[data-f="m.s.0.saldoAwal"]', '800000'));
    as.strictEqual(await js(`POS.S.pelanggan[0].saldoAwal`), 400000);
    as.strictEqual(await js(`POS.u.ubahBilangan('2,5')+POS.u.ubahBilangan('2.5')+POS.u.ubahBilangan('1.500')`), 2.5 + 2.5 + 1500);

    // Pembelian kredit 30 @ 66.000
    await ok(tab('Pembelian'));
    await js(`(function(){var e=document.getElementById('bscan');e.value='8999999000011';e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})()`);
    as.strictEqual(await js(`POS.F.beli.k`), 'BRS-5KG', 'scan barcode di Pembelian');
    await ok(set('[data-f="beli.tgl"]', '2027-01-05')); await ok(set('[data-f="beli.pemasok"]', 'umum'));
    as.strictEqual(await js(`POS.F.beli.pemasok`), await js(`POS.S.pemasok[0].id`), 'ketik sebagian nama pemasok');
    await ok(set('[data-f="beli.faktur"]', '0123')); await ok(set('[data-f="beli.k"]', 'BRS-5KG')); await ok(set('[data-f="beli.q"]', '30')); await ok(set('[data-f="beli.h"]', '66000'));
    await ok(klik('beli.tambah')); await ok(klik('beli.simpan'));
    as.strictEqual(await js(`POS.S.tx.length`), 1, await toast());

    // Penjualan 1: anggota, campuran tunai+bank+kredit
    await ok(tab('Kasir'));
    await ok(set('[data-f="kasir.tgl"]', '2027-01-05')); 
    as.ok((await js(`document.querySelectorAll('#dlpelanggan option').length`)) === 2, 'saran pelanggan di datalist');
    await ok(set('[data-f="kasir.pelanggan"]', 'sri'));
    as.strictEqual(await js(`document.querySelector('[data-f="kasir.pelanggan"]').value`), 'Bu Sri', 'ketik huruf -> nama lengkap');
    as.strictEqual(await js(`POS.F.kasir.pelanggan`), await js(`POS.S.pelanggan[0].id`));
    as.strictEqual(await js(`document.getElementById('kinfo').textContent`), 'Anggota');
    await ok(set('[data-f="kasir.pelanggan"]', 'zzz')); as.ok((await toast()).includes('tidak ada di daftar'), await toast());
    as.strictEqual(await js(`POS.F.kasir.pelanggan`), '');
    await ok(set('[data-f="kasir.pelanggan"]', 'Bu Sri'));
    await ok(set('[data-f="kasir.k"]', 'BRS-5KG')); await ok(set('[data-f="kasir.q"]', '10')); await ok(klik('kasir.tambah'));
    as.ok((await js(teks('#ktot'))).includes('700.000'), 'total kasir: ' + await js(teks('#ktot')));
    await ok(set('[data-f="kasir.tunai"]', '400000')); await ok(set('[data-f="kasir.bank"]', '100000')); await ok(set('[data-f="kasir.kredit"]', '200000'));
    as.ok((await js(teks('#ksisa'))).includes('pas'), 'sisa: ' + await js(teks('#ksisa')));
    await ok(klik('kasir.simpan'));
    as.strictEqual(await js(`POS.S.tx.length`), 2, await toast());
    // Penjualan 2: umum, tunai pas
    await ok(set('[data-f="kasir.k"]', 'BRS-5KG')); await ok(set('[data-f="kasir.q"]', '20')); await ok(klik('kasir.tambah')); await ok(klik('kasir.pas')); await ok(klik('kasir.simpan'));
    as.strictEqual(await js(`POS.S.tx.length`), 3, await toast());
    // Barcode di Kasir: tiap scan menambah 1; barcode tak dikenal ditolak; fokus kembali ke kolom scan
    const scan = (c) => js(`(function(){var e=document.getElementById('scan');e.value=${JSON.stringify(c)};e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 'ok'})()`);
    await ok(scan('8999999000011')); await ok(scan('8999999000011'));
    as.strictEqual(await js(`POS.F.kasir.item.length`), 1); as.strictEqual(await js(`POS.F.kasir.item[0].q`), 2);
    as.ok((await js(teks('#ktot'))).includes('140.000'), 'total setelah 2 scan: ' + await js(teks('#ktot')));
    as.strictEqual(await js(`document.activeElement.id`), 'scan', 'fokus harus kembali ke kolom scan');
    await ok(scan('0000000000000')); as.ok((await toast()).includes('tidak dikenal'), await toast());
    as.strictEqual(await js(`POS.F.kasir.item.length`), 1);
    await ok(klik('kasir.batal'));
    // Penolakan: kredit tanpa pelanggan; melebihi stok
    await ok(set('[data-f="kasir.pelanggan"]', ''));
    await ok(set('[data-f="kasir.k"]', 'BRS-5KG')); await ok(set('[data-f="kasir.q"]', '1')); await ok(klik('kasir.tambah'));
    await ok(set('[data-f="kasir.kredit"]', '70000')); await ok(klik('kasir.simpan'));
    as.ok((await toast()).includes('pelanggan'), 'kredit tanpa pelanggan: ' + await toast());
    await ok(klik('kasir.batal')); await ok(set('[data-f="kasir.k"]', 'BRS-5KG')); await ok(set('[data-f="kasir.q"]', '999')); await ok(klik('kasir.tambah')); await ok(klik('kasir.pas')); await ok(klik('kasir.simpan'));
    as.ok((await toast()).includes('Stok minus'), 'stok minus: ' + await toast());
    as.strictEqual(await js(`POS.S.tx.length`), 3);
    await ok(klik('kasir.batal'));

    // Retur penjualan 1 kg (tunai), pelunasan, setoran
    await ok(tab('Retur'));
    await ok(set('[data-f="retur.tglJ"]', '2027-01-06')); await ok(set('[data-f="retur.refJ"]', await js(`POS.S.tx[1].id`)));
    await ok(set('[data-f="retur.qJ.BRS-5KG"]', '1')); await ok(klik('retur.simpanJUAL'));
    as.strictEqual(await js(`POS.S.tx.length`), 4, await toast());
    await ok(tab('Piutang & Utang'));
    await ok(set('[data-f="bayar.tgl"]', '2027-01-07')); await ok(set('[data-f="bayar.pelanggan"]', 'Bu Sri')); await ok(set('[data-f="bayar.tunai"]', '300000')); await ok(klik('bayar.terima'));
    await ok(tab('Kas')); await ok(set('[data-f="kas.tgl"]', '2027-01-10')); await ok(set('[data-f="kas.jumlah"]', '1000000')); await ok(klik('kas.setor'));
    as.strictEqual(await js(`POS.S.tx.length`), 6, await toast());
    // Opname
    await ok(tab('Stok & Opname')); await ok(set('[data-f="opname.tgl"]', '2027-01-11')); await ok(set('[data-f="opname.fisik.BRS-5KG"]', '55')); await ok(klik('opname.simpan'));
    as.strictEqual(await js(`POS.S.tx.length`), 7, await toast());

    // Ekspor: tangkap berkas lewat createObjectURL
    await ok(tab('Ekspor/Impor'));
    as.ok(!(await js(teks('#isi'))).includes('Tidak bisa diekspor'), 'ada galat ekspor: ' + (await js(teks('#isi'))).slice(0, 400));
    await js(`window.__blob=null; var o=URL.createObjectURL; URL.createObjectURL=function(b){window.__blob=b;return o.call(URL,b)}; 1`);
    await ok(klik('x.ekspor')); await tidur(600);
    const berkas = JSON.parse(await js(`window.__blob.text()`));
    // Lintas-validasi dengan akuntansiApp
    const ctx = { unit: 'Sembako', rows, barang: barangA, mutasi: mutasiA, impor: {}, templatDikenal: ['T-UI'], coaAda: (k) => !!K.core.coa.saldoNormal[k], komponen };
    const v = await K.core.posKontrak.validasiData(berkas, ctx);
    as.deepStrictEqual(v.galat, [], JSON.stringify(v.galat));
    as.deepStrictEqual(v.peringatan, [], JSON.stringify(v.peringatan));
    as.ok(berkas.jurnal.length > 10 && berkas.mutasiStok.length >= 4);

    // Hapus transaksi yang dirujuk retur ditolak; hapus setoran boleh
    await ok(tab('Riwayat'));
    as.strictEqual(await js(`POS.u.hapusTx(POS.S.tx[1].id)`), false);
    as.ok((await toast()).includes('dirujuk'), await toast());
    as.strictEqual(await js(`POS.S.tx.length`), 7);

    // Persistensi: muat ulang halaman, data tetap ada
    await tidur(600);
    await kirim('Page.navigate', { url }); await tidur(1500);
    as.strictEqual(await js(`POS.S.tx.length`), 7);
    as.ok((await js(teks('#isi'))).length > 0);
    as.deepStrictEqual(galat, []);
    console.log('uji UI POS lolos');
    ws.close();
  } finally { chrome.kill('SIGKILL'); }
})().catch((e) => { console.error('GAGAL', e); process.exit(1); });
