// Uji asap (opsional, butuh Node 22 dan Google Chrome): node alat/uji-asap.js file:///jalur/ke/index.html 9331
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
    await js(`KDMP.app.navigasi.pergi('BP Persediaan'); 1`);
    hasil.bpPersediaan = (await js(teks('#m'))).replace(/\s+/g, ' ').slice(0, 50);
    await js(`KDMP.app.navigasi.pergi('Neraca'); 1`);
    hasil.neraca = (await js(teks('#m'))).replace(/\s+/g, ' ').slice(0, 80);
    hasil.galatJs = galat;
    console.log(JSON.stringify(hasil, null, 1));
    ws.close();
  } finally { chrome.kill('SIGKILL'); }
})().catch((e) => { console.error('GAGAL', e); process.exit(1); });
