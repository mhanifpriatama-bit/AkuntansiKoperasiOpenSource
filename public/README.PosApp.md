# README.md — KDMP POS Sembako

Aplikasi kasir (POS) sederhana untuk gerai sembako koperasi (KDMP), berjalan sepenuhnya di peramban sebagai satu berkas HTML. Data disimpan lokal di IndexedDB, dan hasil transaksi dapat diekspor sebagai berkas JSON untuk diimpor ke aplikasi akuntansi (`akuntansiApp`) sesuai kontrak v1.1.

---

## Daftar Isi

- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Kontrak Data dengan akuntansiApp](#kontrak-data-dengan-akuntansiapp)
- [Cara Pakai](#cara-pakai)
- [Struktur State](#struktur-state)
- [Jenis Transaksi](#jenis-transaksi)
- [Logika FIFO & HPP](#logika-fifo--hpp)
- [Pemetaan Akun (COA)](#pemetaan-akun-coa)
- [Penyimpanan & Backup](#penyimpanan--backup)
- [Barcode & Kamera](#barcode--kamera)
- [Pintasan Keyboard](#pintasan-keyboard)
- [Cetak Struk](#cetak-struk)
- [Batasan & Catatan](#batasan--catatan)

---

## Fitur

| Modul | Keterangan |
|---|---|
| **Kasir** | Penjualan tunai/non-tunai/kredit, keranjang, saran barang, popup pembeli baru & produk baru, struk cetak |
| **Pembelian** | Pencatatan faktur pembelian dari pemasok (tunai/bank/kredit), harga beli terakhir tersimpan di Master |
| **Retur** | Retur penjualan (barang kembali ke stok) dan retur pembelian (barang kembali ke pemasok) |
| **Piutang & Utang** | Saldo per pelanggan/pemasok, pelunasan piutang, pembayaran utang |
| **Stok & Opname** | Stock opname dengan perhitungan selisih otomatis terhadap stok sistem |
| **Kas** | Setoran kas ke bank |
| **Master** | Barang, pelanggan (anggota/non-anggota), pemasok |
| **Riwayat** | Daftar transaksi dan jurnal |
| **Ekspor/Impor** | Impor template dari akuntansiApp, ekspor data POS (JSON + checksum) |

---

## Arsitektur

Berkas tunggal HTML dengan empat blok `<script>` yang saling terhubung lewat namespace global `POS`:

```
┌─────────────────────────────────────────────────────────┐
│  1. POS.mesin    — logika murni (FIFO, mutasi, jurnal)  │
│  2. POS.kontrak  — checksum SHA-256 & bangun berkas JSON │
│  3. POS.simpan   — persistensi IndexedDB (debounce 300ms)│
│  4. POS.kamera   — BarcodeDetector + getUserMedia        │
│  5. POS.A/F/R/u  — antarmuka, form state, render per tab │
└─────────────────────────────────────────────────────────┘
```

Prinsip penting: **`POS.mesin.hitung(state)` adalah fungsi murni tanpa DOM**. Ia menerima `state` dan mengembalikan `{mutasi, jurnal, galat, stok, ...}`. UI hanya memanggilnya dan menampilkan hasil. Setiap perubahan data membatalkan cache hasil (`POS.batal()`).

---

## Kontrak Data dengan akuntansiApp

### Template (input dari akuntansiApp)

Berkas template harus memiliki:

```json
{
  "app": "kdmp-pos-template",
  "versi": 1,
  "idTemplat": "...",
  "unit": "...",
  "periode": { "tahun": 2025, "bulan": 1 },
  "coa": [["1.1.1.01", "Kas Tunai", "Debit"], ...],
  "pemetaan": {
    "kasTunai": "...", "bank": "...", "piutang": "...",
    "penjualan": "...", "hpp": "...", "utangUsaha": "...",
    "selisihOpnameKurang": "...", "selisihOpnameLebih": "..."
  },
  "barang": [...],
  "stokAwal": [{ "tgl": "2025-01-01", "k": "...", "q": 10, "h": 5000, "lot": "..." }],
  "saldoReferensi": { "1.1.1.01": 1000000, ... }
}
```

Validasi dilakukan oleh `POS.kontrak.periksaTemplat()`.

### Berkas data POS (output ke akuntansiApp)

```json
{
  "app": "kdmp-pos-data",
  "versi": 1,
  "idBatch": "...",
  "idTemplat": "...",
  "unit": "...",
  "dibuat": "ISO-8601",
  "periode": { "dari": "YYYY-MM-DD", "sampai": "YYYY-MM-DD" },
  "jurnal": [{ "d", "no", "ak", "db", "kr", "ket", "kom?" }],
  "mutasiStok": [{ "d", "no", "k", "j", "q", "h", "nilai", "ket", "lot?" }],
  "barangBaru": [{ "k", "n", "akun" }],
  "kontrol": {
    "jumlahJurnal": 0,
    "jumlahMutasi": 0,
    "totalDebit": 0,
    "totalKredit": 0,
    "saldoAkhir": { "kode_akun": 0 },
    "checksum": "sha256-hex"
  }
}
```

**Checksum** = SHA-256 dari `JSON.stringify([jurnal, mutasiStok, barangBaru])` dengan urutan kunci tetap:

- Jurnal: `d, no, ak, db, kr, ket, kom`
- Mutasi: `d, no, k, j, q, h, nilai, ket, lot`
- Barang baru: `k, n, akun`

Nilai ini **harus identik** dengan yang dihitung oleh `akuntansiApp` saat impor.

---

## Cara Pakai

1. Buka berkas HTML di peramban modern (Chrome/Edge/Firefox). Untuk kamera barcode, gunakan `https://` atau `localhost`.
2. Buka **Menu › Ekspor/Impor**, impor template dari akuntansiApp.
3. Lengkapi **Master** (barang, pelanggan, pemasok) atau tambahkan langsung saat transaksi (popup otomatis).
4. Mulai transaksi di tab **Kasir**.
5. Di akhir periode, buka **Ekspor/Impor**, pilih rentang tanggal, unduh berkas JSON, impor ke akuntansiApp.

---

## Struktur State

```js
{
  tpl: null,          // template dari akuntansiApp
  barang: [],         // { k, n, akun, harga, hargaBeli, barcode? }
  pelanggan: [],      // { id, nama, anggota, noAnggota, saldoAwal }
  pemasok: [],        // { id, nama, akun, saldoAwal }
  tx: [],             // daftar transaksi (lihat di bawah)
  seq: 0,             // counter id
  versi: 1
}
```

---

## Jenis Transaksi

Semua transaksi memiliki `id`, `tgl` (ISO `YYYY-MM-DD`), `jenis`, dan `urut` (urutan input).

| Jenis | Bentuk | Keterangan |
|---|---|---|
| `JUAL` | `{pelanggan?, item:[{k,q,harga}], tunai, bank, kredit}` | Penjualan; tanpa pelanggan = non-anggota |
| `PELUNASAN` | `{pelanggan, tunai, bank}` | Terima pelunasan piutang |
| `BELI` | `{pemasok, faktur, item:[{k,q,h}], cara:'tunai'\|'bank'\|'kredit'}` | Pembelian |
| `BAYAR` | `{pemasok, jumlah, dari:'tunai'\|'bank'}` | Bayar utang pemasok |
| `RJUAL` | `{ref, pelanggan?, item:[{k,q}], cara:'tunai'\|'bank'\|'piutang'}` | Retur penjualan |
| `RBELI` | `{ref, item:[{k,q}], cara:'tunai'\|'bank'\|'utang'}` | Retur pembelian |
| `OPNAME` | `{item:[{k,fisik}]}` | Stock opname |
| `SETOR` | `{jumlah}` | Setoran kas ke bank |

Urutan pemrosesan: `tgl` naik, lalu `urut` naik.

---

## Logika FIFO & HPP

1. **Mutasi dasar** dibangun dari stok awal, pembelian, penjualan harian (digabung per hari per barang), dan retur pembelian.
2. **FIFO pertama (`F1`)** menghitung HPP penjualan harian per barang (`hppJual['tgl|k']`).
3. **Retur penjualan** masuk stok dengan HPP per satuan penjualan asal.
4. **Opname** menghitung selisih terhadap stok sistem pada tanggal itu (FIFO kedua), lalu selisihnya dicatat sebagai Masuk/Keluar.
5. **FIFO final (`F`)** menghasilkan `mutasiStok` final dan memvalidasi stok minus.

Rumus biaya keluar:

```
nilai = Σ (qty_ambil × h_lapisan)
h_rata = nilai / qty
```

Urutan lapisan mengikuti `d` (tanggal), lalu `PERINGKAT` (`Saldo Awal=0`, `Masuk=1`, `Keluar=2`), lalu indeks input. `lot` (jika ada) diprioritaskan.

---

## Pemetaan Akun (COA)

Kunci `pemetaan` yang digunakan:

| Kunci | Fungsi |
|---|---|
| `kasTunai` | Kas tunai |
| `bank` | Bank |
| `piutang` | Piutang pelanggan |
| `penjualan` | Pendapatan penjualan |
| `hpp` | Harga pokok penjualan |
| `utangUsaha` | Utang usaha (default bila pemasok tanpa akun) |
| `selisihOpnameKurang` | Beban selisih opname kurang |
| `selisihOpnameLebih` | Pendapatan selisih opname lebih |

Setiap barang memiliki `akun` persediaan (biasanya awalan `1.1.4.`). Pemasok dapat memiliki akun utang sendiri (awalan `2.1.3.`).

**Jurnal otomatis** dibuat per hari per jenis dokumen (`POS-YYYYMMDD-JENIS`) dan dicek keseimbangan Debit=Kredit per No Bukti.

---

## Penyimpanan & Backup

- Database: IndexedDB `kdmp_pos_sembako`, object store `s`, kunci `state`.
- Penulisan tertunda **300 ms** setelah perubahan (`POS.simpan.jadwalkan`).
- **Tanpa enkripsi** — POS diasumsikan berjalan di perangkat kasir yang terkontrol.
- Backup manual: **Ekspor/Impor › unduh JSON**. Jika IndexedDB tidak tersedia, data hanya di memori (unduh backup rutin!).

---

## Barcode & Kamera

- **Pemindai fisik (keyboard wedge)** selalu bekerja: fokus ke kolom Scan/Barang.
- **Kamera** memakai `BarcodeDetector` + `getUserMedia` (Chrome Android/desktop). Format: EAN-13/8, UPC-A/E, Code 128/39, ITF, QR.
- Mode `terus:true` (kasir) membiarkan kamera terbuka; kode sama diabaikan 1,5 detik.
- Barcode perintah (Code 128 berisi teks `CMD-TAB`, `CMD-ENTER`, `CMD-ATAS`, `CMD-BAWAH`) mensimulasikan tombol keyboard.

---

## Pintasan Keyboard

| Tombol | Aksi |
|---|---|
| `Tab` | Pindah field (Barang → Jumlah → Harga) |
| `Enter` di Barang terisi | Masuk keranjang, fokus kembali ke Barang |
| `Enter` di Barang kosong | Pindah ke pembayaran Tunai |
| `Enter` di kolom pembayaran | Pindah ke nama Pembeli |
| `Enter` di nama Pembeli | Simpan penjualan (dialog konfirmasi) |
| `↑` `↓` | Pilih saran (barang/pelanggan/pemasok) |
| `↑` `↓` di Tunai | Nominal bulat: 10.000 / 20.000 / 50.000 / 100.000 |
| `Esc` | Tutup saran |

---

## Cetak Struk

- Struk ditampilkan di panel kanan tab Kasir (`#struk`).
- Tombol **Cetak struk** memicu `window.print()`.
- CSS `@media print` menyembunyikan header, panel kiri, tombol, dan modal; hanya struk yang tercetak.
- Nomor struk: `STR-YYYYMMDD-NNN` (berurutan per hari).

---

## Batasan & Catatan

- **Satu perangkat, satu state**: tidak ada sinkronisasi multi-kasir.
- **Tanpa autentikasi**: siapa pun yang membuka berkas dapat mengakses data.
- **Stok minus ditolak**: transaksi yang menyebabkan stok negatif tidak disimpan (kecuali opname yang divalidasi terpisah).
- **Retur terikat transaksi asal**: hapus retur dulu sebelum menghapus transaksi asal.
- **Kredit butuh pelanggan terdaftar**: penjualan kredit tidak boleh untuk "Umum".
- **Kembalian hanya dari tunai**: kelebihan bayar non-tunai ditolak.
- **Opname butuh harga beli** untuk menilai selisih lebih; jika tidak ada, muncul galat.
- **Checksum wajib cocok** saat impor ke akuntansiApp; jika tidak, impor ditolak.

---

## Lisensi & Kredit

Aplikasi internal KDMP Sinduadi. Mesin POS, kontrak data, dan antarmuka ditulis dalam JavaScript murni tanpa dependensi eksternal.
