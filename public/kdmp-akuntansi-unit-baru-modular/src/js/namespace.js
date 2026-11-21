/*
 * Namespace tunggal aplikasi: semua kode berada di bawah `KDMP`, tidak ada variabel global lain.
 *
 *   KDMP.config   data konfigurasi (COA, spesifikasi laporan, identitas koperasi)  -> js/config/
 *   KDMP.core     logika akuntansi murni, TANPA DOM dan TANPA state global       -> js/core/
 *   KDMP.storage  IndexedDB, titik pulih, backup                                  -> js/storage/
 *   KDMP.security kripto dan manajemen kunci/sandi                                -> js/security/
 *   KDMP.ui       komponen tampilan yang dipakai banyak fitur                     -> js/ui/
 *   KDMP.app      state sesi, navigasi, login, sinkronisasi                       -> js/app/
 *   KDMP.fitur    satu berkas per tab (Jurnal, Neraca, BP Aset, ...)              -> js/fitur/
 *
 * Berkas dimuat sebagai skrip biasa (bukan ES module) agar tetap berjalan bila index.html
 * dibuka langsung dari folder (file://). Urutan muat ada di index.html.
 */
(function (root) {
  'use strict';
  const KDMP = (root.KDMP = root.KDMP || {});
  ['config', 'core', 'storage', 'security', 'ui', 'app', 'fitur'].forEach(function (n) {
    KDMP[n] = KDMP[n] || {};
  });
})(globalThis);
