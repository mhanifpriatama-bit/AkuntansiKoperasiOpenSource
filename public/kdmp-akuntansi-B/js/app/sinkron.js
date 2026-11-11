/*
 * Sinkronisasi antar tab/jendela browser pada komputer yang sama: tiap 10 detik memeriksa waktu ubah data unit
 * dan COA di IndexedDB; bila berubah, Konsolidasi membaca ulang data unit (kecuali unit yang diimpor dari paket).
 */
(function (KDMP) {
  'use strict';
  const kv = KDMP.storage.kv;
  const app = KDMP.app.state;
  const UNIT = KDMP.config.aplikasi.unit;
  let versi = {};
  let timer;

  const teks = (t) => { const e = document.getElementById('sync'); if (e) e.textContent = t; };
  const versiSekarang = () => kv.ver(['d_USP', 'd_Sembako', 'coa']);

  async function mulai() {
    try { versi = await versiSekarang(); } catch (e) { versi = {}; }
    clearInterval(timer);
    timer = setInterval(periksa, 10000);
    teks('✔ database lokal (offline)');
  }

  async function periksa() {
    if (document.hidden || !app.data || !app.kunci.DK) return;
    try {
      const v = await versiSekarang();
      const berubah = Object.keys(v).filter((k) => versi[k] !== v[k]);
      if (!berubah.length) { teks('🔄 sinkron ' + new Date().toLocaleTimeString('id-ID')); return; }
      for (const k of berubah) {
        if (k == 'coa') { await KDMP.storage.coaDb.muat(); continue; }
        const u = k.slice(2);
        if (app.konsol && UNIT.includes(u) && !(app.data.imp && app.data.imp[u])) {
          const x = await kv.get(k);
          if (x) {
            try {
              const d = await KDMP.security.kripto.dekripsiJson(await KDMP.security.kripto.kunciDariMentah(app.kunci.RAW[u]), x);
              app.data.units[u] = { rows: d.rows, tgl: 'sinkron ' + new Date().toLocaleTimeString('id-ID') };
            } catch (e) { /* data unit belum bisa dibaca: lewati */ }
          }
        }
      }
      versi = v;
      teks('🔄 data diperbarui ' + new Date().toLocaleTimeString('id-ID'));
      const a = document.activeElement;
      if (app.konsol && !(a && a.tagName == 'INPUT')) KDMP.app.navigasi.pergi();
    } catch (e) { teks('⚠ tidak terhubung'); }
  }

  KDMP.app.sinkron = { mulai };
})(globalThis.KDMP);
