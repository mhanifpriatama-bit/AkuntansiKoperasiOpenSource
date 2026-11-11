/*
 * Simpan otomatis data aktif ke IndexedDB (terenkripsi dengan kunci sesi), tertunda 300 ms setelah perubahan
 * terakhir. Sekali sehari, sebelum simpan pertama, salinan versi sebelumnya dijadikan titik pulih otomatis.
 */
(function (KDMP) {
  'use strict';
  const kripto = KDMP.security.kripto;
  const kv = KDMP.storage.kv;
  const app = KDMP.app.state;
  let timer;
  let kotor = false;
  let terakhir = '';
  let hariSnapshot = '';

  async function saatIni() {
    clearTimeout(timer);
    if (!app.data || !app.kunci.DK) return;
    const d = Object.assign({}, app.data);
    delete d.units; // data unit untuk konsolidasi tidak ikut disimpan di data Admin
    const blob = await kripto.enkripsiJson(app.kunci.DK, d);
    const hari = new Date().toISOString().slice(0, 10);
    if (hariSnapshot != hari) {
      hariSnapshot = hari;
      const lama = await kv.get(app.kunci.KEY);
      if (lama) await KDMP.storage.titikPulih.buat(app.unit, 'Otomatis (sebelum perubahan pertama hari ini)', lama);
      await KDMP.storage.titikPulih.pangkas(app.unit);
    }
    await kv.set(app.kunci.KEY, blob);
    kotor = false;
    terakhir = new Date().toLocaleTimeString('id-ID');
    KDMP.ui.header.statusSimpan(kotor, terakhir);
  }

  /** Menandai ada perubahan; simpan sungguhan dijalankan 300 ms kemudian. */
  function jadwalkan() {
    kotor = true;
    KDMP.ui.header.statusSimpan(kotor, terakhir);
    clearTimeout(timer);
    timer = setTimeout(saatIni, 300);
  }

  /** Dipanggil saat sesi baru dimulai. */
  function reset() { hariSnapshot = ''; terakhir = ''; kotor = false; }

  async function manual() {
    if (!app.data) return;
    await saatIni();
    KDMP.ui.pesan.toast('Data tersimpan ke database aplikasi (' + terakhir + ')');
  }

  KDMP.app.simpan = { saatIni, jadwalkan, reset, manual, adaPerubahan: () => kotor, waktuTerakhir: () => terakhir };
  KDMP.ui.aksi.daftar({ 'simpan.manual': () => manual() });
})(globalThis.KDMP);
