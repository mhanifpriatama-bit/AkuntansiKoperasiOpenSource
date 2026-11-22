# KDMP POS Sembako

Aplikasi kasir untuk unit Sembako, satu berkas HTML offline (`dist/kdmp-pos-sembako.html`). Data disimpan di IndexedDB perangkat.
Terhubung ke akuntansiApp lewat dua berkas JSON (spesifikasi kontrak v1.1): **template** (akuntansiApp → POS) dan **data POS** (POS → akuntansiApp).

## Alur
1. akuntansiApp › Data › *Ekspor template POS* (pastikan metode biaya FIFO).
2. POS › Ekspor/Impor › impor template. Isi harga jual dan saldo awal piutang/utang per pihak di tab Master.
3. Catat transaksi: Kasir, Pembelian, Retur, Piutang & Utang, Opname, Kas.
4. POS › Ekspor/Impor › *Unduh data POS*, lalu akuntansiApp › Data › *Impor data POS* (pratinjau, titik pulih otomatis, idempoten).

## Tampilan dan barcode
- Halaman utama adalah **Kasir**. Tab lain dibuka lewat tombol **Menu** di samping judul.
- **Barcode** disimpan per barang (kolom Barcode di Master; hanya ada di POS, tidak dikirim ke akuntansiApp). Di Kasir, scan memasukkan 1 barang per scan; di Pembelian, scan memilih barang.
- Pemindai fisik (USB/Bluetooth, mode keyboard) cukup diarahkan ke kolom Scan lalu Enter. Tombol **Kamera** muncul bila peramban mendukung `BarcodeDetector` (umumnya Chrome, dan butuh https atau localhost).

## Perilaku penting
- Stok dan HPP dihitung FIFO di POS (`src/js/mesin.js`), identik dengan hitungan akuntansiApp. Transaksi yang membuat stok minus atau jurnal tak seimbang ditolak saat disimpan.
- Pelanggan menentukan komponen arus kas (anggota / non-anggota). Penjualan tanpa pelanggan = non-anggota. Kredit hanya untuk pelanggan terdaftar.
- No Bukti `POS-yyyymmdd-<JENIS>`; `BELI` dan `RBELI` per dokumen dengan akhiran `-nnn`. Retur pembelian mengurangi lapisan pembelian asal (`lot`).
- Template bulan berikutnya membuang transaksi sampai tanggal stok awal (sudah masuk akuntansiApp).
- Backup lokal (JSON) dan pemulihan ada di tab Ekspor/Impor. IndexedDB per perangkat: unduh backup secara rutin.

## Pengembangan
```
python3 build.py          # menyusun dist/kdmp-pos-sembako.html dan index.html (mode pengembangan)
node alat/uji-mesin.js    # mesin POS + lintas-validasi dengan modul akuntansiApp (Node saja)
node alat/uji-ui.js file://$PWD/dist/kdmp-pos-sembako.html 9361   # alur UI di Chrome headless
```
Modul: `mesin.js` (FIFO, jurnal), `kontrak.js` (template, data, checksum), `simpan.js` (IndexedDB), `ui-*.js` (tab).
