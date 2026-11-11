# KDMP Akuntansi — Sistem Keuangan Koperasi Terbuka

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Framework](https://img.shields.io/badge/Architecture-Modular_ES6_%2B_React_19-emerald.svg)](https://react.dev/)
[![Offline First](https://img.shields.io/badge/Database-IndexedDB_Local--First-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Compliance](https://img.shields.io/badge/Standar-Permenkop_%26_SAK--EP-red.svg)](https://kemenkopukm.go.id/)

Sistem Informasi Akuntansi & Laporan Keuangan Koperasi Indonesia multi-unit (Unit Simpan Pinjam & Unit Usaha Toko/Sembako) dengan eliminasi konsolidasi otomatis, buku pembantu aset tetap, buku pembantu persediaan metode *moving average*, dan arus kas metode tidak langsung.

---

## 🏛️ Sejarah Proyek & Lembar Atribusi Kehormatan (*Attribution*)

Perangkat lunak ini memiliki nilai sejarah pengabdian masyarakat yang istimewa:

1. **Inisiator & Pemegang Hak Manfaat**:
   * **Koperasi Merah Putih (KDMP) Kalurahan Sinduadi**  
     Kapanewon Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta.
   * Dikoordinasikan dan diprakarsai oleh **Wakil Ketua (WAKA) Bidang Keanggotaan** bersama jajaran Pengurus KDMP Sinduadi dalam upaya digitalisasi akuntansi koperasi desa mandiri dan transparan.

2. **Perancang Logika & Tim Pengembang Perdana**:
   * **Mahasiswa Politeknik Keuangan Negara STAN (PKN STAN)**  
     Dirancang, diformulasikan, dan dikembangkan dalam kurun waktu **Periode Kerja Nyata (10 Hari)** pengabdian masyarakat di KDMP Sinduadi. Seluruh struktur Chart of Accounts (COA), jurnal eliminasi konsolidasi, depresiasi aset, dan arus kas disusun berdasarkan kaidah baku standar akuntansi koperasi Indonesia (PermenkopUKM & SAK-EP).

3. **Asistensi Teknologi & Pemodelan Kecerdasan Buatan**:
   * **Claude (Anthropic)** — Asistensi pemrograman awal single-file HTML & refraktorisasi modularisasi sistem : public/kdmp-akuntansi-A dan public/kdmp-akuntansi-B
   * **Aistudio (Gemini)** — refraktorisasi modularisasi sistem : public/kdmp-modular

4. **Status Lisensi & Hak Penggunaan**:
   * Berdasarkan izin resmi dari para mahasiswa perintis PKN STAN dan Pengurus KDMP Sinduadi, proyek ini resmi dirilis ke publik sebagai **Perangkat Lunak Terbuka (Open Source)** di bawah lisensi **[Apache License 2.0](./LICENSE)** agar dapat diadopsi, dipelajari, dan dikembangkan oleh ribuan Koperasi Desa, Koperasi Simpan Pinjam, dan BUMDes di seluruh Indonesia.

---

## ✨ Fitur Unggulan Sistem

### 1. Akuntansi Multi-Unit Usaha
- **Unit Simpan Pinjam (USP)**:
  - Pembukuan transaksi kredit, simpanan pokok, simpanan wajib, simpanan sukarela, Simapan, dan dana titipan.
  - Perhitungan Cadangan Kerugian Piutang (CRK).
- **Unit Sembako, Pupuk, dan Gas (Ritel)**:
  - Pencatatan pembelian barang dagangan, utang supplier (Bulog, Intimart, RNI, UMKM), dan pendapatan penjualan harian.

### 2. Konsolidasi Otomatis Antar-Unit (*Inter-Unit Elimination*)
- Menggabungkan laporan keuangan USP dan Sembako secara otomatis.
- **Auto-Eliminasi**: Mendeteksi dan mengeliminasi saldo rekening koran (*Rekening Koran Piutang Gerai Sembako* di USP vs *Utang ke USP* di Sembako).
- Mendukung kolom koreksi/eliminasi manual untuk penyesuaian khusus.

### 3. Laporan Keuangan Standar Koperasi Lengkap
- **Jurnal Umum**: Form input transaksi dengan debit/kredit seimbang, validasi akun otomatis, dan pemetaan komponen kas.
- **Buku Besar**: Filter per akun COA dengan saldo awal otomatis dan saldo berjalan (*running balance*).
- **Neraca Saldo**: Ringkasan saldo seluruh akun debit dan kredit.
- **Laporan Laba Rugi**: Menampilkan kinerja operasional per bulan dan akumulasi *year-to-date* (s.d. bulan berjalan).
- **Laporan Posisi Keuangan (Neraca)**: Pengecekan *balance* otomatis antara Aktiva vs Kewajiban & Ekuitas.
- **Laporan Arus Kas (LAK)**: Arus kas aktivitas Operasi, Investasi, dan Pendanaan dihitung otomatis dari akun lawan kas.

### 4. Buku Pembantu Khusus (*Sub-Ledger*)
- **BP Aset Tetap**:
  - Penjadwalan penyusutan per bulan & per tahun.
  - Pilihan metode: **Garis Lurus** (*Straight Line*) atau **Saldo Menurun** (*Double Declining*).
  - Generator tombol otomatis: satu klik langsung menerbitkan jurnal debit beban penyusutan & kredit akumulasi penyusutan.
- **BP Persediaan (Kartu Stok)**:
  - Penilaian stok menggunakan metode **Rata-Rata Bergerak** (*Moving Average*).
  - Mutasi barang masuk, barang keluar, HPP penjualan otomatis, dan rekonsiliasi ke Buku Besar.

### 5. Arsitektur Offline-First & Keamanan Berlapis
- **Database Lokal Browser (IndexedDB)**: Bekerja 100% offline tanpa perlu koneksi internet atau server backend.
- **Enkripsi Web Crypto API (AES-GCM 256-bit + PBKDF2 200.000 iterasi)**: Data disimpan dalam bentuk ciphertext terenkripsi dengan sandi unit dan sandi Admin konsolidasi.
- **Snapshot & Titik Pulih Otomatis**: Riwayat perubahan per hari disimpan secara otomatis dan dapat dipulihkan kapan saja jika terjadi salah input.
- **Ekspor & Impor Paket (.kdmp.json & .json backup)**: Unit dapat mengirim paket data ke bendahara dengan aman.

---

## 📂 Struktur Repositori

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

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Versi Murni Vanilla ES Modules (Pilihan A)
Versi ini tidak memerlukan instalasi Node.js atau dependensi apa pun. Cukup letakkan folder `/public/kdmp-modular/` di web server statis apa pun (Nginx, Apache, GitHub Pages, Vercel, Live Server VS Code):
```bash
# Akses langsung di browser setelah server berjalan:
http://localhost:3000/kdmp-modular/index.html
```

### 2. Menjalankan Versi React + TypeScript (Pilihan B)
```bash
# 1. Pastikan dependensi terpasang
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka browser di http://localhost:3000
```

---

## 🤝 Pedoman Kontribusi Komunitas (*Contributing*)

Kami menyambut hangat kontribusi dari akademisi akuntansi, mahasiswa, pengurus koperasi, dan *software engineer*:

1. **Fork Repositori ini**.
2. **Buat Branch Fitur Baru**:
   ```bash
   git checkout -b fitur/standar-coa-bumdes
   ```
3. **Komit Perubahan**:
   ```bash
   git commit -m "feat: tambahkan template COA khusus BUMDes sesuai Permendesa"
   ```
4. **Push ke Branch Anda**:
   ```bash
   git push origin fitur/standar-coa-bumdes
   ```
5. **Kirimkan Pull Request (PR)** dengan deskripsi yang jelas.

---

## 📜 Lisensi & Legalitas

Proyek ini dilisensikan di bawah **Apache License, Version 2.0**.  
Lihat berkas [LICENSE](./LICENSE) dan [NOTICE](./NOTICE) untuk rincian ketentuan hukum dan atribusi lengkap.

Dikelola dengan bangga untuk kemandirian ekonomi koperasi Indonesia.  
**Koperasi Merah Putih (KDMP) Kalurahan Sinduadi & Sahabat PKN STAN.**
