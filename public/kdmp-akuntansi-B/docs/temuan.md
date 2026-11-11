# Temuan saat refactor

Daftar keanehan/ risiko yang ditemukan ketika membaca kode asli. Sebagian besar **sengaja dibiarkan** agar
refactor tidak mengubah perilaku/ angka; keputusan perbaikannya ada pada pengurus & akuntan koperasi.

## Perlu keputusan akuntansi

1. **Nama akun ganda di COA bawaan.** "Pendapatan Jasa Pinjaman" ada di `4.1.3.02` dan `4.1.3.08`; "Beban Sewa" di
   `6.1.5.01` dan `9.2.3.01`. Menyulitkan pengguna memilih akun yang benar. *Usul:* bedakan namanya.
2. **Penyusutan saldo menurun tidak mencapai nilai residu di akhir umur.** Tarif dihitung 2 ÷ umur per tahun lalu dibagi 12;
   untuk umur 4 tahun & residu 10%, nilai buku akhir ±13% dari harga perolehan (bukan 10%), dan penyusutan berhenti
   setelah umur habis. Dipertahankan apa adanya (ada tesnya). *Usul:* pastikan metode sesuai kebijakan koperasi.
3. **Eliminasi otomatis hanya satu pasangan akun** (RK Piutang Gerai Sembako `1.1.9.08` vs Utang ke USP `2.1.9.01`); selisih
   antar-unit lain harus dimasukkan manual.
4. **Komponen Arus Kas otomatis hanya untuk kas *keluar*.** Kas masuk harus diisi manual pada kolom Komponen Arus Kas;
   akun lawan tertentu (mis. `1.1.2.*` Kredit Anggota) tidak dipetakan sehingga butuh pengisian manual.

## Teknis / keamanan

5. **Teks bebas (No Bukti, Keterangan) di Buku Besar tidak di-escape** pada kode asli, sehingga isi seperti `<b>` akan
   dirender sebagai HTML. **Versi B memperbaikinya** (`esc`); Versi A mempertahankan perilaku asli. Fungsi `esc` hanya
   mengganti `& " <` (tidak `>` dan `'`): aman untuk atribut ber-kutip ganda yang dipakai, tapi sebaiknya diperketat.
6. **`eval()` untuk rumus laporan** pada kode asli. Versi B menggantinya dengan `KDMP.core.rumus.hitungRumus`
   (hanya `+`/`-`); hasil identik untuk seluruh rumus di konfigurasi.
7. **Kode mati dibuang di kedua versi:** variabel `TOK`/`REG` (diisi tapi tidak pernah dibaca), kunci `d_Kantor` pada
   pengecekan sinkronisasi (tidak pernah ada), dan fungsi diagnosa "berkas terpotong" yang membaca teks `<script>` (tidak
   relevan setelah kode dipecah ke berkas terpisah).
8. **Keamanan kripto perlu ditinjau pihak yang kompeten** sebelum dipromosikan: PBKDF2 200.000 iterasi + AES-GCM
   (Web Crypto) terlihat wajar, tetapi sandi yang hilang **tidak bisa dipulihkan**, sandi minimal hanya 6 karakter, dan
   kunci disimpan di memori selama sesi. Data hilang bila data situs browser dihapus; ingatkan pengguna rutin membackup.
9. Logo bawaan sebelumnya tertanam sebagai base64 *url-safe* yang dikonversi saat dimuat; kini berkas biasa
   `assets/logo.png` (17 KB) yang dirujuk dari konfigurasi.

## Pekerjaan lanjutan yang disarankan

- Jumlah unit dinamis (saat ini USP + Sembako ditulis tetap di beberapa tempat; lihat `panduan-pengembang.md`).
- `js/app/paket-unit.js` memakai literal `'kdmp2'` alih-alih `config.aplikasi.idTeknis.paketUnit`.
- Tes otomatis untuk lapisan tampilan (saat ini diuji lewat uji pembanding di browser, bukan tes unit).
- Format impor/ekspor terbuka (CSV jurnal) agar data tidak terkunci di aplikasi.
