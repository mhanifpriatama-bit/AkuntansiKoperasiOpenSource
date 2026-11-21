/*
 * Daftar pilihan akun (<datalist id=dl>) untuk kolom Akun di jurnal & buku besar. Diperbarui otomatis
 * setiap Master COA berubah.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { esc } = KDMP.core.format;

  function perbarui() {
    const d = $('#dl');
    if (d) d.innerHTML = KDMP.core.coa.daftar.map((a) => `<option value="${esc(a[0] + ' ' + a[1])}">`).join('');
  }
  KDMP.core.coa.saatBerubah(perbarui);
  KDMP.ui.daftarAkun = { perbarui };
})(globalThis.KDMP);
