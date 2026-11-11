/*
 * Pembantu DOM paling dasar: pemilih elemen dan area isi utama (#m).
 */
(function (KDMP) {
  'use strict';

  const $ = (selektor) => document.querySelector(selektor);

  /** Mengganti isi area utama. */
  function isi(html) { $('#m').innerHTML = html; }
  const tambahDiAwal = (html) => $('#m').insertAdjacentHTML('afterbegin', html);
  const tambahDiAkhir = (html) => $('#m').insertAdjacentHTML('beforeend', html);

  /** Menutup menu <details> "Unduh" setelah salah satu tombolnya dipilih. */
  function tutupMenu(el) {
    const d = el && el.closest && el.closest('details');
    if (d) d.open = false;
  }

  KDMP.ui.dom = { $, isi, tambahDiAwal, tambahDiAkhir, tutupMenu };
})(globalThis.KDMP);
