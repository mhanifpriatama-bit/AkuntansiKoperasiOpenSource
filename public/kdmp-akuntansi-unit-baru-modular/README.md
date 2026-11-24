# KDMP Akuntansi — Dokumentasi Lengkap

Aplikasi akuntansi koperasi **offline-first** yang berjalan di browser. Tersedia sebagai **satu berkas HTML** siap pakai untuk pengguna, dengan sumber modular untuk pengembang.

- **Lisensi:** Apache License 2.0
- **Standar:** PermenkopUKM & SAK-EP
- **Penyimpanan:** IndexedDB lokal, terenkripsi AES-GCM 256-bit
- **Tanpa server, tanpa internet**

---

## Daftar Isi

1. [Sejarah & Atribusi](#1-sejarah--atribusi)
2. [Fitur Unggulan](#2-fitur-unggulan)
3. [Panduan Pengguna (Versi HTML Tunggal)](#3-panduan-pengguna-versi-html-tunggal)
4. [Dokumentasi Pengembang (Sumber Modular)](#4-dokumentasi-pengembang-sumber-modular)
5. [Struktur Repositori](#5-struktur-repositori)
6. [Lisensi & Legalitas](#6-lisensi--legalitas)

---

## 1. Sejarah & Atribusi

Perangkat lunak ini memiliki nilai sejarah pengabdian masyarakat yang istimewa:

### 1.1 Inisiator & Pemegang Hak Manfaat

- **Koperasi Merah Putih (KDMP) Kalurahan Sinduadi**
  Kapanewon Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta.
- Dikoordinasikan dan diprakarsai oleh **Wakil Ketua (WAKA) Bidang Keanggotaan** bersama jajaran Pengurus KDMP Sinduadi dalam upaya digitalisasi akuntansi koperasi desa mandiri dan transparan.

### 1.2 Perancang Logika & Tim Pengembang Perdana

- **Mahasiswa Politeknik Keuangan Negara STAN (PKN STAN)**
  Dirancang, diformulasikan, dan dikembangkan dalam kurun waktu **Periode Kerja Nyata (10 Hari)** pengabdian masyarakat di KDMP Sinduadi. Seluruh struktur Chart of Accounts (COA), jurnal eliminasi konsolidasi, depresiasi aset, dan arus kas disusun berdasarkan kaidah baku standar akuntansi koperasi Indonesia (PermenkopUKM & SAK-EP).

### 1.3 Asistensi Teknologi & Pemodelan Kecerdasan Buatan

- **Claude (Anthropic)** — Asistensi pemrograman awal single-file HTML & refraktorisasi modularisasi sistem: `public/kdmp-akuntansi-A` dan `public/kdmp-akuntansi-B`
- **Aistudio (Gemini)** — Refraktorisasi modularisasi sistem: `public/kdmp-modular`

### 1.4 Status Lisensi & Hak Penggunaan

Berdasarkan izin resmi dari para mahasiswa perintis PKN STAN dan Pengurus KDMP Sinduadi, proyek ini resmi dirilis ke publik sebagai **Perangkat Lunak Terbuka (Open Source)** di bawah lisensi **[Apache License 2.0](./LICENSE)** agar dapat diadopsi, dipelajari, dan dikembangkan oleh ribuan Koperasi Desa, Koperasi Simpan Pinjam, dan BUMDes di seluruh Indonesia.

---

## 2. Fitur Unggulan

### 2.1 Akuntansi Multi-Unit Usaha

- **Unit Simpan Pinjam (USP):**
  - Pembukuan transaksi kredit, simpanan pokok, simpanan wajib, simpanan sukarela, Simapan, dan dana titipan.
  - Perhitungan Cadangan Kerugian Piutang (CRK).
- **Unit Sembako, Pupuk, dan Gas (Ritel):**
  - Pencatatan pembelian barang dagangan, utang supplier (Bulog, Intimart, RNI, UMKM), dan pendapatan penjualan harian.

### 2.2 Konsolidasi Otomatis Antar-Unit (*Inter-Unit Elimination*)

- Menggabungkan laporan keuangan USP dan Sembako secara otomatis.
- **Auto-Eliminasi:** Mendeteksi dan mengeliminasi saldo rekening koran (*Rekening Koran Piutang Gerai Sembako* di USP vs *Utang ke USP* di Sembako).
- Mendukung kolom koreksi/eliminasi manual untuk penyesuaian khusus.

### 2.3 Laporan Keuangan Standar Koperasi Lengkap

- **Jurnal Umum:** Form input transaksi dengan debit/kredit seimbang, validasi akun otomatis, dan pemetaan komponen kas.
- **Buku Besar:** Filter per akun COA dengan saldo awal otomatis dan saldo berjalan (*running balance*).
- **Neraca Saldo:** Ringkasan saldo seluruh akun debit dan kredit.
- **Laporan Laba Rugi:** Menampilkan kinerja operasional per bulan dan akumulasi *year-to-date* (s.d. bulan berjalan).
- **Laporan Posisi Keuangan (Neraca):** Pengecekan *balance* otomatis antara Aktiva vs Kewajiban & Ekuitas.
- **Laporan Arus Kas (LAK):** Arus kas aktivitas Operasi, Investasi, dan Pendanaan dihitung otomatis dari akun lawan kas.

### 2.4 Buku Pembantu Khusus (*Sub-Ledger*)

- **BP Aset Tetap:**
  - Penjadwalan penyusutan per bulan & per tahun.
  - Pilihan metode: **Garis Lurus** (*Straight Line*) atau **Saldo Menurun** (*Double Declining*).
  - Generator tombol otomatis: satu klik langsung menerbitkan jurnal debit beban penyusutan & kredit akumulasi penyusutan.
- **BP Persediaan (Kartu Stok):**
  - Penilaian stok menggunakan metode **Rata-Rata Bergerak** (*Moving Average*), atau **FIFO** (dipilih per unit di BP Persediaan > Master Barang, `data.sub.hpp`).
  - Mutasi barang masuk, barang keluar, HPP penjualan otomatis, dan rekonsiliasi ke Buku Besar.

### 2.5 Arsitektur Offline-First & Keamanan Berlapis

- **Database Lokal Browser (IndexedDB):** Bekerja 100% offline tanpa perlu koneksi internet atau server backend.
- **Enkripsi Web Crypto API (AES-GCM 256-bit + PBKDF2 200.000 iterasi):** Data disimpan dalam bentuk ciphertext terenkripsi dengan sandi unit dan sandi Admin konsolidasi.
- **Snapshot & Titik Pulih Otomatis:** Riwayat perubahan per hari disimpan secara otomatis dan dapat dipulihkan kapan saja jika terjadi salah input.
- **Ekspor & Impor Paket (.kdmp.json & .json backup):** Unit dapat mengirim paket data ke bendahara dengan aman.

### 2.6 Pertukaran Data dengan POS Sembako (v1.1)

- `core/persediaan.js`: metode biaya `RATA` (bawaan) atau `FIFO`, dipilih per unit di BP Persediaan > Master Barang (`data.sub.hpp`). Retur pembelian memakai kolom `lot` (No Bukti mutasi Masuk asal).
- `core/pos-kontrak.js`: template, validasi, rencana impor idempoten, checksum SHA-256.
- `app/impor-pos.js`: tombol di tab Data (unit yang memakai persediaan): Ekspor template POS dan Impor data POS dengan pratinjau. Impor membuat titik pulih otomatis "Sebelum impor POS <idBatch>", mengganti baris ber-No Bukti `POS-` pada rentang tanggal berkas, dan mencatat batch di `data.imporPos`. Baris POS ditandai biru di tab Jurnal.
- Uji: `node alat/uji-fifo.js`, `node alat/uji-pos-kontrak.js`, `node alat/uji-impor-pos.js file://$PWD/dist/kdmp-akuntansi.html 9351`.

---

## 3. Panduan Pengguna (Versi HTML Tunggal)

Aplikasi akuntansi koperasi yang berjalan **offline di browser**. Versi HTML tunggal adalah **satu berkas** (`kdmp-akuntansi-unit-baru.html`, hasil build `dist/kdmp-akuntansi.html`) yang sudah memuat semua kode dan logo. Tidak perlu install, server, atau internet.

Data disimpan terenkripsi (AES-GCM) di browser perangkat Anda (IndexedDB). Tidak ada data yang dikirim ke server.

### 3.1 Membuka aplikasi

1. Simpan berkas `kdmp-akuntansi-unit-baru.html` di perangkat (komputer atau HP).
2. Buka berkas itu dengan **Chrome, Edge, atau Firefox** terbaru.
   - Komputer: klik dua kali berkas, atau seret ke jendela browser.
   - Android: buka lewat Chrome (menu **Buka berkas** atau dari aplikasi pengelola berkas).

> **Penting — data terikat pada alamat berkas.** Data disimpan per alamat/berkas yang dibuka. Memindahkan berkas ke folder lain, mengganti nama, atau membukanya lewat alamat berbeda dapat membuat aplikasi tampak kosong. Jangan panik: pulihkan dari backup (lihat bagian 3.6). Pakailah **satu cara membuka yang tetap** di setiap perangkat.

### 3.2 Pengaturan awal (sekali)

Saat pertama dibuka, muncul layar **Pengaturan awal**. Isi tiga sandi (minimal 6 karakter):

| Sandi | Fungsi |
|---|---|
| **Sandi Admin** | Membuka **Konsolidasi** dan semua unit |
| **Sandi USP** | Hanya membuka unit USP |
| **Sandi Sembako** | Hanya membuka unit Sembako |

Lalu tekan **Buat**.

- **Sandi yang hilang tidak bisa dipulihkan.** Catat di tempat aman.
- Isi **sandi Admin yang SAMA** di semua perangkat (unit dan bendahara). Kalau berbeda, paket data unit tidak bisa diimpor ke Konsolidasi.

Pernah memakai aplikasi ini sebelumnya? Jangan tekan **Buat**. Pilih **Pulihkan dari file cadangan lengkap** dan pakai berkas backup lama. Sandi lama tetap berlaku.

### 3.3 Masuk (login)

Pilih **Masuk sebagai**: salah satu unit, atau **Konsolidasi (Admin)**, lalu isi sandinya.

- Aplikasi keluar otomatis setelah **10 menit** tanpa aktivitas.
- Data tersimpan otomatis. Tombol **Simpan** (atau Ctrl+S) menyimpan seketika.

Tab per unit: Jurnal, Buku Besar, Neraca Saldo, Laba Rugi, Neraca, Arus Kas, BP Aset, (BP Persediaan bila unit memakainya), Data. Tab Konsolidasi: Neraca Konsolidasi, Laba Rugi Konsolidasi, Master COA, Data Unit.

### 3.4 Menambah unit usaha baru

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

#### Memilih susunan laporan

Pilihan ini hanya mengatur **susunan Neraca dan Laba Rugi**. Semua akun bersaldo tetap muncul di laporan.

| Pilihan | Istilah lain | Pilih bila |
|---|---|---|
| Seperti USP | **Unit Jasa** | Tidak ada stok barang milik koperasi. Pendapatan berupa jasa, komisi, atau bunga. |
| Seperti Sembako | **Unit Dagang** | Membeli lalu menjual barang, punya persediaan dan harga pokok. |

Pertanyaan penentu: **adakah stok barang milik koperasi yang dibeli lalu dijual?** Ya → Dagang. Tidak → Jasa.

Contoh:

- **Kantin titip jual** (barang milik penitip) → Jasa, tanpa BP Persediaan. Yang menjadi pendapatan hanya komisi.
- **Layanan pembayaran sampah** → Jasa, tanpa BP Persediaan. Uang retribusi yang akan disetor ke pengelola dicatat sebagai utang ke pihak ketiga, bukan pendapatan.
- **Toko, apotek, gas, pupuk** → Dagang, centang BP Persediaan bila perlu kartu stok.

> Kebijakan pencatatan (mis. komisi dicatat bersih atau kotor) sebaiknya diputuskan bersama bendahara atau akuntan koperasi.

#### Batasan unit tambahan

- Belum bisa dihapus atau diganti namanya dari aplikasi.
- Eliminasi **otomatis** antar-unit hanya untuk pasangan RK Piutang Gerai Sembako (`1.1.9.08`, di USP) dan Utang ke USP (`2.1.9.01`, di Sembako). Selisih antar-unit lain diisi **manual** di kolom Eliminasi.
- Layar pengaturan awal hanya membuat USP dan Sembako. Unit lain ditambahkan setelahnya lewat layar login.

### 3.5 Alur kerja beberapa perangkat (unit → bendahara)

1. **Di perangkat unit:** pastikan unit tersedia (tambahkan unit dengan **kode yang sama** bila itu unit tambahan).
2. Login unit, isi jurnal.
3. Tab **Data** → **Ekspor paket untuk bendahara (.kdmp.json)** (atau **Unduh Backup Database**).
4. Kirim berkas ke bendahara (WhatsApp, flashdisk, dsb.).
5. **Di perangkat bendahara:** login **Konsolidasi (Admin)** → tab **Data Unit** → pilih atau seret berkas. Unit tambahan yang belum dikenal akan dikenali otomatis dari berkasnya.
6. Buka **Neraca Konsolidasi** dan **Laba Rugi Konsolidasi**.

Paket yang lebih dari 7 hari diberi peringatan agar unit mengekspor ulang. Syarat: **sandi Admin sama** di semua perangkat.

### 3.6 Backup dan pemulihan (wajib rutin)

Data hilang bila data situs browser dihapus (membersihkan cache/riwayat dengan opsi "data situs" ikut menghapusnya).

- **Backup:** tab **Data** → **Unduh Backup Database (.json)**. Lakukan rutin dan simpan di tempat terpisah.
- **Pulihkan:** layar login → **Pulihkan dari file cadangan lengkap**, atau tab Data → **Pulihkan backup**. Pemulihan **menimpa** data di perangkat itu. Masuk dengan sandi **lama**.
- Titik pulih otomatis harian (maksimal 5) tersedia di bagian bawah tab Data.

### 3.7 Memperbarui ke versi baru

1. Unduh **Backup Database (.json)** dari versi lama.
2. Buka berkas HTML versi baru.
3. Bila tampak kosong (karena alamat berbeda), pilih **Pulihkan dari file cadangan lengkap** di layar itu.

Mengganti berkas HTML tanpa mengubah cara membukanya biasanya tidak menghapus data, tetapi **selalu backup dulu**.

### 3.8 Pemecahan masalah

| Gejala | Penyebab / solusi |
|---|---|
| Muncul layar **Pengaturan awal** padahal sudah pernah dipakai | Alamat/berkas yang dibuka berbeda. Jangan tekan Buat; pilih **Pulihkan dari file cadangan lengkap**. |
| Tidak ada tautan **+ Tambah unit usaha baru** | Tautan hanya di **layar login** (bukan di layar Pengaturan awal). Selesaikan setup dulu. |
| **Sandi salah** | Sandi unit hanya membuka unitnya. Sandi Admin membuka Konsolidasi. Sandi hilang tidak bisa dipulihkan. |
| Impor ke Konsolidasi gagal "sandi Admin berbeda" | Sandi Admin di perangkat unit tidak sama dengan sandi Admin bendahara. |
| Neraca tidak seimbang | Periksa jurnal: total debit harus sama dengan total kredit. |

> Ini perangkat bantu pencatatan. Sebelum dipakai untuk pelaporan resmi, minta akuntan atau pengurus koperasi meninjau kebijakan akuntansi (COA, penyusutan, eliminasi) dan, bila perlu, tinjauan keamanan independen.

---

## 4. Dokumentasi Pengembang (Sumber Modular)

Folder `src/` memuat **sumber modular**; berkas HTML tunggal dibuat darinya dengan satu perintah. Pemecahan ini **tidak mengubah perilaku**: hasil build identik per byte dengan berkas HTML tunggal sebelumnya (SHA-256 `79fe401b307549bba3824667481bd6883fefbf4189006569a366426b1ab94f1c`).

### 4.1 Struktur sumber

```
src/
  kerangka.html        markup halaman + penanda urutan muat modul
  css/                 6 berkas gaya (urut menurut awalan angka)
  js/
    galat-global.js    penangan galat global (dimuat pertama)
    namespace.js       membuat objek KDMP dan sub-namespace
    config/            data konfigurasi: COA, laporan per unit, arus kas, identitas koperasi
    core/              logika akuntansi murni (tanpa DOM): saldo, laporan, FIFO/persediaan, konsolidasi
    storage/           IndexedDB, titik pulih, backup
    security/          enkripsi AES-GCM dan manajemen kunci/sandi
    ui/                komponen tampilan bersama: dom, aksi, grid, ekspor, kop laporan
    app/               state sesi, simpan, navigasi, sinkron, login, impor/ekspor paket, titik masuk (mulai.js)
    fitur/             satu berkas per tab: Jurnal, Buku Besar, Laporan, BP Aset, BP Persediaan, ...
    uji/               pintu masuk untuk uji otomatis di browser
build.py / build.js    penyusun (pilih salah satu; hasilnya identik)
alat/uji-asap.js       uji asap di Chrome headless (opsional)
alat/uji-fifo.js       uji hitungan FIFO (Node saja)
alat/uji-pos-kontrak.js uji kontrak POS: template, validasi, impor idempoten (Node saja)
alat/uji-impor-pos.js  uji alur impor data POS di Chrome headless
dist/                  hasil build: kdmp-akuntansi.html  <- berkas yang dibagikan
index.html             halaman pengembangan (memuat modul satu per satu)
```

### 4.2 Alur kerja pengembangan

1. Ubah modul di `src/`.
2. Jalankan `python3 build.py` (atau `node build.js`).
3. Uji dengan membuka `index.html` di browser. Pesan galat menyebut nama modul dan nomor barisnya.
4. Bagikan `dist/kdmp-akuntansi.html`.

Sebelum mencoba versi baru dengan data kerja, unduh **Backup Database (.json)** dari aplikasi.

### 4.3 Menambah modul

1. Buat berkas, mis. `src/js/fitur/laporan-baru.js`.
2. Tambahkan satu baris di `src/kerangka.html` pada urutan muat yang diinginkan:
   `<!--@js js/fitur/laporan-baru.js-->`

Urutan penanda adalah urutan muat. Modul harus dimuat setelah modul yang dipakainya (mis. `core/` sebelum `ui/`, `ui/` sebelum `app/`, `app/` sebelum `fitur/`, `app/mulai.js` terakhir). `build.py` memberi peringatan bila ada berkas di `src/` yang belum didaftarkan.

### 4.4 Catatan teknis

- `src/js/config/aplikasi.js` memuat logo dalam bentuk base64 (±23 KB). Bila ingin dipisah, jadikan modul sendiri.
- Komentar di beberapa modul menyebut `docs/struktur-data.md` dan `docs/format-laporan.md`; berkas itu belum ada.
- Modul dimuat sebagai skrip biasa (bukan ES module) agar tetap berjalan bila dibuka langsung dari folder (`file://`).

### 4.5 Membuat berkas HTML tunggal sendiri

Dari folder proyek `kdmp-akuntansi-B` (perlu Node.js 18+, tanpa dependensi lain):

```
node tools/satu-berkas.js      # menghasilkan dist/kdmp-akuntansi.html
npm test                       # menjalankan tes (opsional)
```

Hasilnya adalah satu berkas HTML mandiri yang bisa dibagikan ke pengguna.

---

## 5. Struktur Repositori

Aplikasi ini menyediakan dua jalur implementasi yang dapat disesuaikan dengan kebutuhan:

```text
├── LICENSE                             # Lisensi resmi Apache-2.0
├── NOTICE                              # Dokumen atribusi resmi KDMP & Mahasiswa PKN STAN
├── README.md                           # Dokumentasi komprehensif proyek
│
├── public/
│   └── kdmp-modular/                   # PILIHAN A: Versi Murni Vanilla ES Modules (Zero Build Step)
│       ├── index.html                  # Shell HTML mandiri (dapat dibuka langsung di browser)
│       ├── LICENSE                     # Salinan lisensi Apache-2.0
│       ├── css/
│       │   └── style.css               # Styling original akuntansi & media print A4
│       └── js/
│           ├── state.js                # State reaktif terpusat & sinkronisasi window
│           ├── config.js               # Konfigurasi spesifikasi LPK/LR, COA, & Logo Base64
│           ├── crypto.js               # Web Crypto: PBKDF2, AES-GCM, SHA-256 tokens
│           ├── db.js                   # Adapter IndexedDB & snapshot manager
│           ├── accounting-engine.js    # Mesin hitung saldo, penyusutan aset, & kartu stok
│           ├── export.js               # Formatter Rupiah, tanggal ID, ekspor XLS, CSV, PDF
│           ├── ui-renderers.js         # Renderer tabel ke-13 tab laporan keuangan
│           ├── auth.js                 # Autentikasi multi-unit & background sync
│           └── main.js                 # Entry point bootstrapper
│
└── src/                                # PILIHAN B: Versi Modern React 19 + TypeScript + Tailwind
    ├── components/                     # Komponen UI modern, dashboard analitik, & blueprint open source
    ├── services/                       # Accounting engine TypeScript modern
    └── types/                          # TypeScript definitions untuk model data akuntansi
```

> **Catatan:** `README.md` dan `PANDUAN-HTML-TUNGGAL.md` merujuk pada jalur **vanilla modular → satu berkas HTML** (`src/` dengan `build.py`/`build.js` menghasilkan `dist/kdmp-akuntansi.html`). Bagian `public/kdmp-modular/` dan `src/` React di atas adalah varian implementasi alternatif yang juga tersedia di repositori.

---

## 6. Lisensi & Legalitas

Proyek ini dilisensikan di bawah **Apache License, Version 2.0**.
Lihat berkas [LICENSE](./LICENSE) dan [NOTICE](./NOTICE) untuk rincian ketentuan hukum dan atribusi lengkap.

Dikelola dengan bangga untuk kemandirian ekonomi koperasi Indonesia.

**Koperasi Merah Putih (KDMP) Kalurahan Sinduadi & Sahabat PKN STAN.**
