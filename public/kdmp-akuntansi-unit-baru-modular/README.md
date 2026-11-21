# KDMP Akuntansi — sumber modul

Aplikasi akuntansi koperasi (offline, satu berkas HTML untuk pengguna). Folder ini memuat **sumber modular**-nya;
berkas HTML tunggal dibuat darinya dengan satu perintah.

## Struktur

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

## Alur kerja

1. Ubah modul di `src/`.
2. Jalankan `python3 build.py` (atau `node build.js`).
3. Uji dengan membuka `index.html` di browser. Pesan galat menyebut nama modul dan nomor barisnya.
4. Bagikan `dist/kdmp-akuntansi.html`.

Sebelum mencoba versi baru dengan data kerja, unduh **Backup Database (.json)** dari aplikasi.

## Menambah modul

1. Buat berkas, mis. `src/js/fitur/laporan-baru.js`.
2. Tambahkan satu baris di `src/kerangka.html` pada urutan muat yang diinginkan:
   `<!--@js js/fitur/laporan-baru.js-->`

Urutan penanda adalah urutan muat. Modul harus dimuat setelah modul yang dipakainya
(mis. `core/` sebelum `ui/`, `ui/` sebelum `app/`, `app/` sebelum `fitur/`, `app/mulai.js` terakhir).
`build.py` memberi peringatan bila ada berkas di `src/` yang belum didaftarkan.

## Catatan

- Pemecahan ini **tidak mengubah perilaku**: hasil build identik per byte dengan berkas HTML tunggal sebelumnya
  (SHA-256 `79fe401b307549bba3824667481bd6883fefbf4189006569a366426b1ab94f1c`).
- `src/js/config/aplikasi.js` memuat logo dalam bentuk base64 (±23 KB). Bila ingin dipisah, jadikan modul sendiri.
- Komentar di beberapa modul menyebut `docs/struktur-data.md` dan `docs/format-laporan.md`; berkas itu belum ada.
- Modul dimuat sebagai skrip biasa (bukan ES module) agar tetap berjalan bila dibuka langsung dari folder (`file://`).

## Pertukaran data dengan POS Sembako (v1.1)

- `core/persediaan.js`: metode biaya `RATA` (bawaan) atau `FIFO`, dipilih per unit di BP Persediaan > Master Barang (`data.sub.hpp`).
  Retur pembelian memakai kolom `lot` (No Bukti mutasi Masuk asal).
- `core/pos-kontrak.js`: template, validasi, rencana impor idempoten, checksum SHA-256.
- `app/impor-pos.js`: tombol di tab Data (unit yang memakai persediaan): Ekspor template POS dan Impor data POS dengan pratinjau.
  Impor membuat titik pulih otomatis "Sebelum impor POS <idBatch>", mengganti baris ber-No Bukti `POS-` pada rentang tanggal berkas,
  dan mencatat batch di `data.imporPos`. Baris POS ditandai biru di tab Jurnal.
- Uji: `node alat/uji-fifo.js`, `node alat/uji-pos-kontrak.js`, `node alat/uji-impor-pos.js file://$PWD/dist/kdmp-akuntansi.html 9351`.
