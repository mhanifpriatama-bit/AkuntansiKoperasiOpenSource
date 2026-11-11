/*
 * Ganti sandi dari tab Data (unit) atau Data Unit (Admin). Logika kunci ada di KDMP.security.kunci.
 */
(function (KDMP) {
  'use strict';
  const app = KDMP.app.state;
  const UNIT = KDMP.config.aplikasi.unit;

  async function ganti(u, sandiBaru) {
    if (!sandiBaru || sandiBaru.length < 6) return alert('Sandi minimal 6 karakter');
    const k = app.kunci;
    if (u == 'Admin' && app.konsol) {
      k.DK = await KDMP.security.kunci.gantiSandiAdmin(k.META, k.RAW, sandiBaru);
      k.PIN = sandiBaru;
      KDMP.app.simpan.jadwalkan(); // data Admin dienkripsi ulang dengan kunci baru
    } else if (app.konsol ? UNIT.includes(u) : u == app.unit) {
      await KDMP.security.kunci.gantiSandiUnit(k.META, u, app.konsol ? k.RAW[u] : k.RAW, sandiBaru);
      if (!app.konsol) k.PIN = sandiBaru;
    } else return alert('Tidak diizinkan');
    try {
      await KDMP.storage.kv.set('meta', k.META);
      alert('Sandi diganti');
    } catch (e) { alert('Gagal menyimpan ke server: ' + ((e && e.message) || e)); }
  }

  KDMP.ui.aksi.daftar({
    'sandi.gantiUnit': () => ganti(app.unit, prompt('Sandi baru (min. 6 karakter):') || ''),
    'sandi.gantiAdmin': () => ganti('Admin', prompt('Sandi Admin baru:') || ''),
    'sandi.resetUnit': () => { const u = prompt('Unit (USP/Sembako):'); return ganti(u, prompt('Sandi baru unit:') || ''); }
  });
  KDMP.app.sandi = { ganti };
})(globalThis.KDMP);
