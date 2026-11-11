/*
 * Titik masuk: memasang pendengar peristiwa, pintasan keyboard, lalu membuka database dan menampilkan
 * layar setup (pertama kali) atau login.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const apl = KDMP.config.aplikasi;
  const app = KDMP.app.state;

  async function mulai() {
    $('#nm-koperasi').textContent = apl.namaLengkap;
    $('#lg').src = apl.logo;
    document.getElementById('ttl').textContent = '';
    KDMP.ui.aksi.pasang();

    addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key == 's' || e.key == 'S')) { e.preventDefault(); if (app.data) KDMP.app.simpan.manual(); }
    });
    addEventListener('beforeunload', (e) => { if (KDMP.app.simpan.adaPerubahan()) { e.preventDefault(); e.returnValue = ''; } });

    try {
      KDMP.app.sesi.kotak('<p>Membuka database lokal…</p>');
      await KDMP.storage.kv.open();
      try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* tidak wajib */ }
      app.kunci.META = await KDMP.storage.kv.get('meta');
      window.__ok = 2;
      app.kunci.META ? KDMP.app.sesi.tampilkanLogin() : KDMP.app.sesi.tampilkanSetup();
    } catch (e) {
      window.__err('Gagal membuka database lokal (IndexedDB): ' + ((e && e.message) || e));
    }
  }

  KDMP.app.mulai = mulai;
  mulai();
})(globalThis.KDMP);
