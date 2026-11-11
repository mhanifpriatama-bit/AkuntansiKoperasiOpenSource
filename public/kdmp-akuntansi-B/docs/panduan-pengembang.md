# Panduan Pengembang

## Mengganti identitas koperasi / logo

Ubah `js/config/aplikasi.js` (`namaLengkap`, `judulLogin`, `subJudulLogin`, `versi`, `logo`) dan taruh logo baru di
`assets/`. Nilai di `idTeknis` **jangan diubah** (nama database & format berkas backup; mengubahnya membuat data lama
tidak terbaca). Pengguna juga bisa mengganti logo per unit lewat tab *Data*.

> Beberapa nama akun di COA bawaan masih memuat nama koperasi asal (mis. "Utang Pengurus KDMP Sinduadi"); ubah di
> `js/config/coa.js` bila perlu.

## Menambah akun (COA) bawaan

Tambahkan baris `[kode, nama, saldoNormal]` di `js/config/coa.js`. Kode berpola `x.x.x.xx`; 4 digit pertama harus sudah
dikenal struktur laporan. Akun yang ditambah pengguna lewat tab *Master COA* disimpan di database, bukan di berkas ini.
Akun baru muncul di laporan lewat baris `["O", ...]` ("akun lain berawalan ...") atau tambahkan baris `["A", kode, ...]`
di spesifikasi laporan agar tampil eksplisit.

## Mengubah susunan laporan

Edit `js/config/laporan-usp.js`, `laporan-sembako.js`, `laporan-konsolidasi.js` (format di
[`format-laporan.md`](format-laporan.md)). Setelah mengubah, jalankan `npm test`; tes neraca memeriksa keseimbangan.

## Mengubah Laporan Arus Kas

- Susunan: `js/config/arus-kas.js` (daftar komponen + baris laporan).
- Pemetaan otomatis akun lawan → komponen: `js/config/pemetaan-arus-kas.js`.

## Menambah kategori aset tetap

`js/config/aset-tetap.js`: `'Nama kategori': [akunAset, akunAkumulasi, akunBeban]`. Akun akumulasi/beban kosong = tidak disusutkan.

## Menambah tab baru

1. Buat `js/fitur/nama-tab.js`:
   ```js
   (function (KDMP) {
     'use strict';
     const app = KDMP.app.state;
     function render() { KDMP.ui.dom.isi('<p>Halo</p>'); }
     KDMP.app.tab['Nama Tab'] = { render };
   })(globalThis.KDMP);
   ```
2. Tambahkan `<script src="js/fitur/nama-tab.js"></script>` di `index.html` (sebelum `hook-uji.js`).
3. Tambahkan nama tab di `daftarTab()` pada `js/app/navigasi.js`.
4. Logika hitungan taruh di `js/core/` (bukan di berkas tab) dan beri tes.

## Menambah unit usaha

Belum sepenuhnya berbasis konfigurasi. Daftar unit ada di `js/config/aplikasi.js` (`unit`), tetapi saat ini masih ada
bagian yang mengasumsikan dua unit USP + Sembako: kolom konsolidasi (`js/fitur/konsolidasi.js`), eliminasi otomatis
RK/Utang (`js/core/konsolidasi.js`), tab per unit (`js/app/navigasi.js`), dan layar setup/login (`js/app/sesi.js`).
Menjadikan jumlah unit dinamis adalah pekerjaan lanjutan yang baik untuk komunitas (lihat `docs/temuan.md`).

## Konvensi

- Fungsi di `core/` menerima data lewat parameter dan tidak mengubah argumen, kecuali bila disebut di komentarnya
  (mis. `terapkanAkunLama` dan `migrasiData` sengaja mengubah data lama di tempat).
- Teks pengguna yang disisipkan ke HTML selalu lewat `esc()`.
- Angka uang disimpan sebagai angka (rupiah); format tampilan lewat `KDMP.core.format.rupiah`.
