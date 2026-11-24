/*
 * Pintu masuk untuk uji otomatis di browser (alat-verifikasi/regresi-browser.js). Tidak dipakai aplikasi sendiri.
 */
(function (KDMP) {
  'use strict';
  const app = KDMP.app.state;

  KDMP.uji = {
    /** Mengisi state aktif dengan data uji lalu menyimpannya. */
    async isiData(d) {
      Object.assign(app.data, { rows: d.rows || app.data.rows, sub: d.sub || app.data.sub, bulan: d.bulan, tahun: d.tahun });
      ['kop', 'alamat', 'kota', 'pet', 'ben', 'ket'].forEach((k) => { if (d[k] !== undefined) app.data[k] = d[k]; });
      document.getElementById('bln').value = d.bulan;
      document.getElementById('thn').value = d.tahun;
      await KDMP.app.simpan.saatIni();
    },
    /** Menampilkan tab (dan sub-tab) lalu mengembalikan HTML + matriks ekspor. */
    tampil(tab, sv) {
      if (sv) app.sv[tab] = sv;
      KDMP.app.navigasi.pergi(tab);
      return { html: document.getElementById('m').innerHTML, mat: KDMP.ui.ekspor.matriks() };
    },
    pilih(kunci, nilai) { app.sel[kunci] = nilai; }
  };
})(globalThis.KDMP);
