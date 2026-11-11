# Pengujian

## 1. Tes unit (Node, tanpa dependensi)

```
npm test
```

Mencakup (di `tests/`): format & rumus, migrasi COA, saldo & laporan (neraca balance, SHU, arus kas cocok dengan kas
neraca, konsolidasi & eliminasi), aset tetap & persediaan, dan enkripsi/ manajemen kunci.
Tes memuat berkas `js/` ke satu konteks `vm` seperti browser memuat `<script>` (`tests/pembantu/muat.js`).

Data: `tests/data/data-sintetis.json` – dua unit, jurnal Des 2025–Okt 2026, dibuat oleh generator (bukan data nyata).
Nilai harapan dihitung dari rumus pembuat data (lihat komentar di tes), bukan disalin dari keluaran program.

## 2. Uji pembanding di browser (regresi)

Dipakai saat refactor untuk membuktikan bahwa keluaran **sama persis** dengan versi sebelumnya. Alatnya ada di folder
`alat-verifikasi/` pada paket zip (membutuhkan `playwright` + Chromium):

```
node regresi-browser.js asli  APLIKASI_LAPORAN_KEUANGAN.html  hasil-asli.json
node regresi-browser.js B     ../kdmp-akuntansi-B/index.html  hasil-B.json
node bandingkan.js hasil-asli.json hasil-B.json
```

`regresi-browser.js` mengisi data sintetis lewat UI nyata (setup sandi, login USP/Sembako/Konsolidasi) dan merekam HTML 25 tampilan
plus matriks ekspor; `interaksi-browser.js` melakukan 34 langkah klik/ketik nyata (tambah/hapus baris, ganti akun, COA,
eliminasi manual, jurnal penyusutan, backup, ganti sandi). Atribut penanganan peristiwa dinormalkan sebelum
dibandingkan karena versi B memakai `data-aksi` sebagai ganti `onclick`.

Hasil saat dokumen ini ditulis: aplikasi asli, Versi A, dan Versi B **identik** pada seluruh tampilan dan langkah.

> `js/app/hook-uji.js` adalah pintu masuk khusus uji pembanding; tidak dipakai aplikasi.
