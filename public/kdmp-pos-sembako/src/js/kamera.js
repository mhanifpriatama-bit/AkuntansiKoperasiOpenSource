/*
 * Pemindai barcode lewat kamera (API BarcodeDetector + getUserMedia). Hanya ada di peramban yang mendukung (mis. Chrome Android/desktop)
 * dan umumnya butuh halaman https atau localhost; bila tidak tersedia, pemindai fisik (keyboard wedge) tetap bekerja di kolom Scan.
 */
(function (POS) {
  'use strict';
  const FORMAT = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code'];
  const tersedia = () => !!(globalThis.BarcodeDetector && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const bunyi = () => {
    try {
      const c = new (globalThis.AudioContext || globalThis.webkitAudioContext)(), o = c.createOscillator();
      o.frequency.value = 880; o.connect(c.destination); o.start(); setTimeout(() => { o.stop(); c.close(); }, 90);
    } catch (e) { /* bunyi opsional */ }
  };

  /**
   * @param {(kode:string)=>void} bila  dipanggil tiap kode terbaca
   * @param {{terus?:boolean}} opsi  terus=true: kamera tetap terbuka (mode kasir); kode yang sama diabaikan 1,5 detik
   */
  async function pindai(bila, opsi) {
    if (!tersedia()) { POS.u.toast('Kamera/pemindai tidak tersedia di peramban ini. Pakai pemindai fisik atau ketik kodenya.', true); return; }
    let aliran;
    try { aliran = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); } catch (e) { POS.u.toast('Kamera tidak bisa dibuka: ' + (e.message || e.name), true); return; }
    const kotak = document.createElement('div');
    kotak.id = 'kam';
    kotak.innerHTML = '<video autoplay playsinline muted></video><div id="kamst">Arahkan kamera ke barcode…</div><button class="x" id="kamtutup">Tutup</button>';
    document.body.appendChild(kotak);
    const video = kotak.querySelector('video');
    video.srcObject = aliran;
    const det = new globalThis.BarcodeDetector({ formats: FORMAT });
    let terakhir = '', waktu = 0, mati = false;
    const tutup = () => { mati = true; clearInterval(t); aliran.getTracks().forEach((x) => x.stop()); kotak.remove(); };
    kotak.querySelector('#kamtutup').onclick = tutup;
    const t = setInterval(async () => {
      if (mati || video.readyState < 2) return;
      try {
        const hasil = await det.detect(video);
        if (!hasil.length) return;
        const kode = hasil[0].rawValue, kini = Date.now();
        if (kode === terakhir && kini - waktu < 1500) return;
        terakhir = kode; waktu = kini; bunyi();
        kotak.querySelector('#kamst').textContent = 'Terbaca: ' + kode;
        bila(kode);
        if (!(opsi && opsi.terus)) tutup();
      } catch (e) { /* bingkai gagal dibaca: coba lagi */ }
    }, 250);
  }

  POS.kamera = { tersedia, pindai };
})(globalThis.POS = globalThis.POS || {});
