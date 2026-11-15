# KDMP Akuntansi — Panduan Versi HTML Tunggal

Aplikasi akuntansi koperasi yang berjalan **offline di browser**. Versi HTML tunggal adalah **satu berkas**
(`kdmp-akuntansi-unit-baru.html`) yang sudah memuat semua kode dan logo. Tidak perlu install, server, atau internet.

Data disimpan terenkripsi (AES-GCM) di browser perangkat Anda (IndexedDB). Tidak ada data yang dikirim ke server.

---

## 1. Membuka aplikasi

1. Simpan berkas `kdmp-akuntansi-unit-baru.html` di perangkat (komputer atau HP).
2. Buka berkas itu dengan **Chrome, Edge, atau Firefox** terbaru.
   - Komputer: klik dua kali berkas, atau seret ke jendela browser.
   - Android: buka lewat Chrome (menu **Buka berkas** atau dari aplikasi pengelola berkas).

> **Penting — data terikat pada alamat berkas.** Data disimpan per alamat/berkas yang dibuka. Memindahkan berkas ke
> folder lain, mengganti nama, atau membukanya lewat alamat berbeda dapat membuat aplikasi tampak kosong. Jangan
> panik: pulihkan dari backup (lihat bagian 6). Pakailah **satu cara membuka yang tetap** di setiap perangkat.

---

## 2. Pengaturan awal (sekali)

Saat pertama dibuka, muncul layar **Pengaturan awal**. Isi tiga sandi (minimal 6 karakter):

| Sandi | Fungsi |
|---|---|
| **Sandi Admin** | Membuka **Konsolidasi** dan semua unit |
| **Sandi USP** | Hanya membuka unit USP |
| **Sandi Sembako** | Hanya membuka unit Sembako |

Lalu tekan **Buat**.

- **Sandi yang hilang tidak bisa dipulihkan.** Catat di tempat aman.
- Isi **sandi Admin yang SAMA** di semua perangkat (unit dan bendahara). Kalau berbeda, paket data unit tidak bisa
  diimpor ke Konsolidasi.

Pernah memakai aplikasi ini sebelumnya? Jangan tekan **Buat**. Pilih **Pulihkan dari file cadangan lengkap** dan pakai
berkas backup lama. Sandi lama tetap berlaku.

---

## 3. Masuk (login)

Pilih **Masuk sebagai**: salah satu unit, atau **Konsolidasi (Admin)**, lalu isi sandinya.

- Aplikasi keluar otomatis setelah **10 menit** tanpa aktivitas.
- Data tersimpan otomatis. Tombol **Simpan** (atau Ctrl+S) menyimpan seketika.

Tab per unit: Jurnal, Buku Besar, Neraca Saldo, Laba Rugi, Neraca, Arus Kas, BP Aset, (BP Persediaan bila unit memakainya),
Data. Tab Konsolidasi: Neraca Konsolidasi, Laba Rugi Konsolidasi, Master COA, Data Unit.

---

## 4. Menambah unit usaha baru

Selain USP dan Sembako, Anda bisa menambah unit sendiri. Ada dua jalan:

- **Dari layar login:** klik **+ Tambah unit usaha baru** (di bawah tautan "Lupa sandi?"). Butuh sandi Admin.
- **Sebagai Konsolidasi (Admin):** tab **Data Unit** → **Tambah unit usaha baru**.

Isian:

| Isian | Keterangan |
|---|---|
| Kode unit | 2–16 huruf/angka, diawali huruf, tanpa spasi (mis. `Kantin`). Tidak bisa diubah. |
| Nama unit | 3–60 karakter. Tampil di judul dan laporan. |
| Susunan laporan | Lihat di bawah. **Tidak bisa diubah** setelah unit dibuat. |
| Warna | Warna penanda unit. |
| Pakai tab BP Persediaan | Centang bila unit mencatat stok barang. |
| Sandi unit | Minimal 6 karakter. |

### Memilih susunan laporan

Pilihan ini hanya mengatur **susunan Neraca dan Laba Rugi**. Semua akun bersaldo tetap muncul di laporan.

| Pilihan | Istilah lain | Pilih bila |
|---|---|---|
| Seperti USP | **Unit Jasa** | Tidak ada stok barang milik koperasi. Pendapatan berupa jasa, komisi, atau bunga. |
| Seperti Sembako | **Unit Dagang** | Membeli lalu menjual barang, punya persediaan dan harga pokok. |

Pertanyaan penentu: **adakah stok barang milik koperasi yang dibeli lalu dijual?** Ya → Dagang. Tidak → Jasa.

Contoh:

- **Kantin titip jual** (barang milik penitip) → Jasa, tanpa BP Persediaan. Yang menjadi pendapatan hanya komisi.
- **Layanan pembayaran sampah** → Jasa, tanpa BP Persediaan. Uang retribusi yang akan disetor ke pengelola dicatat
  sebagai utang ke pihak ketiga, bukan pendapatan.
- **Toko, apotek, gas, pupuk** → Dagang, centang BP Persediaan bila perlu kartu stok.

> Kebijakan pencatatan (mis. komisi dicatat bersih atau kotor) sebaiknya diputuskan bersama bendahara atau akuntan koperasi.

### Batasan unit tambahan

- Belum bisa dihapus atau diganti namanya dari aplikasi.
- Eliminasi **otomatis** antar-unit hanya untuk pasangan RK Piutang Gerai Sembako (`1.1.9.08`, di USP) dan Utang ke USP
  (`2.1.9.01`, di Sembako). Selisih antar-unit lain diisi **manual** di kolom Eliminasi.
- Layar pengaturan awal hanya membuat USP dan Sembako. Unit lain ditambahkan setelahnya lewat layar login.

---

## 5. Alur kerja beberapa perangkat (unit → bendahara)

1. **Di perangkat unit:** pastikan unit tersedia (tambahkan unit dengan **kode yang sama** bila itu unit tambahan).
2. Login unit, isi jurnal.
3. Tab **Data** → **Ekspor paket untuk bendahara (.kdmp.json)** (atau **Unduh Backup Database**).
4. Kirim berkas ke bendahara (WhatsApp, flashdisk, dsb.).
5. **Di perangkat bendahara:** login **Konsolidasi (Admin)** → tab **Data Unit** → pilih atau seret berkas.
   Unit tambahan yang belum dikenal akan dikenali otomatis dari berkasnya.
6. Buka **Neraca Konsolidasi** dan **Laba Rugi Konsolidasi**.

Paket yang lebih dari 7 hari diberi peringatan agar unit mengekspor ulang. Syarat: **sandi Admin sama** di semua perangkat.

---

## 6. Backup dan pemulihan (wajib rutin)

Data hilang bila data situs browser dihapus (membersihkan cache/riwayat dengan opsi "data situs" ikut menghapusnya).

- **Backup:** tab **Data** → **Unduh Backup Database (.json)**. Lakukan rutin dan simpan di tempat terpisah.
- **Pulihkan:** layar login → **Pulihkan dari file cadangan lengkap**, atau tab Data → **Pulihkan backup**.
  Pemulihan **menimpa** data di perangkat itu. Masuk dengan sandi **lama**.
- Titik pulih otomatis harian (maksimal 5) tersedia di bagian bawah tab Data.

---

## 7. Memperbarui ke versi baru

1. Unduh **Backup Database (.json)** dari versi lama.
2. Buka berkas HTML versi baru.
3. Bila tampak kosong (karena alamat berbeda), pilih **Pulihkan dari file cadangan lengkap** di layar itu.

Mengganti berkas HTML tanpa mengubah cara membukanya biasanya tidak menghapus data, tetapi **selalu backup dulu**.

---

## 8. Membuat berkas HTML tunggal sendiri (untuk pengembang)

Dari folder proyek `kdmp-akuntansi-B` (perlu Node.js 18+, tanpa dependensi lain):

```
node tools/satu-berkas.js      # menghasilkan dist/kdmp-akuntansi.html
npm test                       # menjalankan tes (opsional)
```

Hasilnya adalah satu berkas HTML mandiri yang bisa dibagikan ke pengguna.

---

## 9. Pemecahan masalah

| Gejala | Penyebab / solusi |
|---|---|
| Muncul layar **Pengaturan awal** padahal sudah pernah dipakai | Alamat/berkas yang dibuka berbeda. Jangan tekan Buat; pilih **Pulihkan dari file cadangan lengkap**. |
| Tidak ada tautan **+ Tambah unit usaha baru** | Tautan hanya di **layar login** (bukan di layar Pengaturan awal). Selesaikan setup dulu. |
| **Sandi salah** | Sandi unit hanya membuka unitnya. Sandi Admin membuka Konsolidasi. Sandi hilang tidak bisa dipulihkan. |
| Impor ke Konsolidasi gagal "sandi Admin berbeda" | Sandi Admin di perangkat unit tidak sama dengan sandi Admin bendahara. |
| Neraca tidak seimbang | Periksa jurnal: total debit harus sama dengan total kredit. |

---

> Ini perangkat bantu pencatatan. Sebelum dipakai untuk pelaporan resmi, minta akuntan atau pengurus koperasi meninjau
> kebijakan akuntansi (COA, penyusutan, eliminasi) dan, bila perlu, tinjauan keamanan independen.
