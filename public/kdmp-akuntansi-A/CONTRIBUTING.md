# Panduan Berkontribusi (Versi A)

1. *Fork*, buat cabang, ubah, uji manual di browser, kirim *pull request* yang menjelaskan apa, mengapa, dan cara mengujinya.
2. Karena angka laporan dipakai untuk pembukuan, **sebutkan eksplisit bila perubahan memengaruhi angka**.
3. Jaga urutan `<script>` di `index.html`; berkas hanya boleh memakai berkas yang dimuat sebelumnya.
4. Jangan mengubah bentuk data tersimpan/format backup tanpa migrasi; jangan menambah library dari CDN (harus jalan offline).
5. Jangan commit data keuangan nyata; pakai `contoh-data/data-sintetis.json`.
6. Bahasa: istilah akuntansi dan dokumentasi Indonesia; istilah teknis Inggris.

Untuk pengembangan jangka panjang (tes otomatis, tanpa global/`onclick`) disarankan memakai Versi B.
