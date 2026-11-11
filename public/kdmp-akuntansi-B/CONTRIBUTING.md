# Panduan Berkontribusi

Terima kasih sudah ikut mengembangkan aplikasi ini. Aplikasi dipakai untuk pembukuan koperasi, jadi **angka laporan
harus tetap benar**: perubahan kecil yang salah bisa berdampak pada laporan.

## Alur kerja

1. *Fork* repositori, buat cabang (`fitur/nama-singkat` atau `perbaikan/nama-singkat`).
2. Buka `index.html` di browser untuk mencoba; jalankan `npm test`.
3. Ubah kode (lihat aturan di bawah). Tambahkan/ubah tes bila menyentuh `js/core/`.
4. Kirim *pull request*: jelaskan **apa**, **mengapa**, dan **bagaimana mengujinya**. Bila perubahan memengaruhi angka
   laporan, sebutkan secara eksplisit dan sertakan contoh sebelum/sesudah.

## Aturan kode

- **Bahasa:** istilah akuntansi, komentar, dan dokumentasi dalam Bahasa Indonesia; istilah teknis tetap Inggris
  (mis. *event*, *state*, *render*). Nama fungsi/variabel memakai nama yang jelas (`hitungSaldo`, bukan `calc`).
- **Lapisan:** `js/core/` tidak boleh menyentuh DOM, `document`, atau `KDMP.app.state`; semua masukan lewat parameter.
  Tampilan ada di `js/ui/` dan `js/fitur/`.
- **Tanpa global baru:** semuanya di namespace `KDMP`. Tanpa `eval`, tanpa atribut `onclick`/`onchange` di HTML;
  gunakan `KDMP.ui.aksi` (lihat `docs/arsitektur.md`).
- **Tanpa dependensi/ build wajib:** aplikasi harus tetap bisa dibuka langsung dari `index.html`. Jangan menambah
  library dari CDN (aplikasi harus jalan offline).
- **Kompatibilitas data:** jangan mengubah bentuk data tersimpan atau format berkas backup/paket
  (`docs/struktur-data.md`) tanpa migrasi dan catatan di PR. Data koperasi yang sudah ada tidak boleh rusak.
- **Keamanan:** jangan menyimpan sandi/kunci ke penyimpanan; escape semua teks pengguna yang disisipkan ke HTML (`esc`).
- **Data uji:** jangan commit data keuangan nyata. Gunakan data sintetis.

## Menambah tes

Tes di `tests/*.test.js` memakai `node:test`. Muat modul lewat `tests/pembantu/muat.js`, lihat contoh tes yang ada.
Untuk perubahan yang memengaruhi tampilan, jalankan juga uji pembanding di browser (`docs/pengujian.md`).

## Melaporkan masalah

Sertakan versi/tanggal aplikasi (tampil di layar login), langkah mengulang, dan hasil yang diharapkan. **Jangan melampirkan
berkas backup nyata** – berisi data keuangan (walau terenkripsi).
