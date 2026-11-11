/*
 * Penanganan peristiwa terpusat (event delegation) sebagai pengganti atribut onclick="..." / onchange="...".
 *
 * Cara pakai:
 *   1. Daftarkan fungsi:   KDMP.ui.aksi.daftar({ 'jurnal.hapus': function (el, e) { ... } });
 *   2. Tempel pada HTML:   `<button ${klik('jurnal.hapus', { i: 3 })}>x</button>`
 *   3. Di fungsi, baca argumen dengan arg(el, 'i').
 *
 * Jenis peristiwa: klik (click), ubah (change), input (input), kirim (submit), seret (dragover + drop).
 * Satu pendengar per jenis dipasang di document, sehingga HTML yang dibuat ulang tiap render tidak perlu
 * memasang ulang pendengar. Semua nama aksi memakai pola "modul.aksi".
 */
(function (KDMP) {
  'use strict';
  const fungsi = {};
  const ATRIBUT = { klik: 'data-aksi', ubah: 'data-aksi-ubah', input: 'data-aksi-input', kirim: 'data-aksi-kirim', seret: 'data-aksi-seret' };

  function daftar(peta) {
    for (const nama in peta) {
      if (fungsi[nama]) throw new Error('Aksi ganda: ' + nama);
      fungsi[nama] = peta[nama];
    }
  }

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  /** Membuat atribut HTML: attr('klik', 'jurnal.hapus', {i:3}) -> data-aksi="jurnal.hapus" data-a-i="3" */
  function atribut(jenis, nama, args) {
    let s = ATRIBUT[jenis] + '="' + nama + '"';
    for (const k in args || {}) s += ' data-a-' + k + '="' + esc(args[k]) + '"';
    return s;
  }
  const klik = (nama, args) => atribut('klik', nama, args);
  const ubah = (nama, args) => atribut('ubah', nama, args);
  const input = (nama, args) => atribut('input', nama, args);
  const kirim = (nama, args) => atribut('kirim', nama, args);
  const seret = (nama, args) => atribut('seret', nama, args);

  /** Membaca argumen data-a-<nama> dari elemen. */
  const arg = (el, nama) => el.getAttribute('data-a-' + nama);

  function jalankan(jenis, e) {
    const el = e.target.closest && e.target.closest('[' + ATRIBUT[jenis] + ']');
    if (!el) return;
    const nama = el.getAttribute(ATRIBUT[jenis]);
    const f = fungsi[nama];
    if (!f) { console.error('Aksi tidak terdaftar: ' + nama); return; }
    if (jenis == 'kirim' || jenis == 'seret' || el.tagName == 'A') e.preventDefault();
    const hasil = f(el, e);
    if (hasil && typeof hasil.catch == 'function') hasil.catch((err) => window.__err && window.__err((err && err.message) || err));
  }

  /** Memasang pendengar sekali saat aplikasi dimulai. */
  function pasang() {
    document.addEventListener('click', (e) => jalankan('klik', e));
    document.addEventListener('change', (e) => jalankan('ubah', e));
    document.addEventListener('input', (e) => jalankan('input', e));
    document.addEventListener('submit', (e) => jalankan('kirim', e));
    document.addEventListener('dragover', (e) => { if (e.target.closest && e.target.closest('[' + ATRIBUT.seret + ']')) e.preventDefault(); });
    document.addEventListener('drop', (e) => jalankan('seret', e));
  }

  KDMP.ui.aksi = { daftar, pasang, klik, ubah, input, kirim, seret, arg };
})(globalThis.KDMP);
