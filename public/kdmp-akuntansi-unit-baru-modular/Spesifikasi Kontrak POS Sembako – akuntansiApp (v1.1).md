# Spesifikasi Kontrak POS Sembako – akuntansiApp (v1.1)

Nov 21, 2026 · @Hanif

## Tujuan dan keputusan

Kontrak ini menetapkan cara POS Sembako dan akuntansiApp bertukar data lewat dua berkas JSON, sehingga jurnal penjualan, pembelian, dan persediaan unit Sembako masuk tanpa diketik ulang.

Keputusan yang sudah disepakati:

- Dua berkas: **template** (akuntansiApp ke POS) dan **data POS** (POS ke akuntansiApp). Tidak ada server atau sinkronisasi online.
- POS berupa satu berkas HTML offline dengan IndexedDB, seperti akuntansiApp.
- POS menghitung stok dan HPP dengan **FIFO** (Opsi A). akuntansiApp menghitung ulang FIFO sebagai pemeriksaan silang.
- akuntansiApp dipakai sebagai aplikasi baru setelah tutup buku: saldo awal dan stok awal diisi lebih dulu, tanpa migrasi riwayat.
- Pencatatan perpetual: pembelian didebit ke Persediaan (1.1.4.xx), dan penjualan menghasilkan jurnal HPP.
- Cakupan v1: penjualan (tunai, bank/QRIS, kredit), pelunasan piutang, pembelian (tunai, kredit), pembayaran utang pemasok, retur penjualan dan pembelian, stok opname, setoran kas ke bank.

Di luar v1: PPN, banyak cabang, sinkronisasi online, dan tanda tangan kriptografi (HMAC).

**Istilah.** *Batch* = satu kali ekspor data POS. *Lapisan* = satu lot pembelian yang belum habis terjual. *No Bukti* = kolom `no` pada jurnal; untuk data POS selalu berawalan `POS-`.

## Alur kerja

Data bergerak lewat berkas, satu langkah pada satu waktu: akuntansiApp memberi template, POS mengisinya selama operasi harian, dan akuntansiApp memasukkan hasilnya ke jurnal hanya setelah validasi dan pratinjau yang Anda setujui.

&#91;embedded content: alur kerja · 6 langkah, 2 pihak\]

Alur ini berulang setiap kali data POS perlu masuk ke pembukuan (harian, mingguan, atau bulanan). Template cukup diekspor ulang bila COA atau Master Barang berubah.

## Berkas template (akuntansiApp ke POS)

Template memberi POS daftar akun, barang, stok awal, dan pemetaan akun, sehingga operator POS tidak mengetik kode akun. Nama berkas: `KDMP_POS_TEMPLATE_<unit>_<yyyy-mm-dd>.json`, dibuat dari tab Data unit Sembako lewat tombol **Ekspor template POS**.

| Field | Tipe | Isi |
| --- | --- | --- |
| `app` | teks | Selalu `kdmp-pos-template` |
| `versi` | angka bulat | Versi kontrak, saat ini `1` |
| `idTemplat` | teks (UUID) | Dibuat baru pada setiap ekspor; dikirim kembali oleh POS di setiap data POS |
| `dibuat` | teks ISO | Waktu ekspor, dengan zona waktu |
| `unit` | teks | Kode unit, mis. `Sembako` |
| `koperasi` | teks | Nama koperasi (kop laporan) |
| `periode` | `{tahun, bulan}` | Periode aktif di akuntansiApp saat ekspor |
| `metodeHpp` | teks | `FIFO` |
| `posisiStok` | tanggal ISO | Tanggal posisi `stokAwal` dan `saldoReferensi` |
| `coa` | `[[kode, nama, saldoNormal]]` | Seluruh COA aktif, termasuk akun tambahan Admin |
| `komponenArusKas` | `[teks]` | 21 komponen arus kas; nilai `kom` di jurnal harus salah satunya |
| `barang` | `[{k, n, akun}]` | Master Barang: kode, nama, akun persediaan (1.1.4.xx) |
| `stokAwal` | `[{k, tgl, q, h}]` | Lapisan FIFO yang tersisa pada `posisiStok`; satu baris per lapisan, urutan array = urutan FIFO |
| `saldoReferensi` | `{kode: nilai}` | Saldo akun kas/bank (1.1.1.*), piutang (1.1.2.*), persediaan (1.1.4.*), dan utang usaha (2.1.3.*) pada `posisiStok` |
| `pemetaan` | `{peran: kode}` | Akun bawaan per peran (lihat bagian pemetaan) |

Aturan:

- POS menolak berkas yang `app`-nya salah atau `versi`-nya belum dikenal.
- Template yang lebih baru menggantikan yang lama. Bila COA atau Master Barang berubah di akuntansiApp, ekspor template baru; POS menyimpan `idTemplat` terbaru dan memakainya pada ekspor berikutnya.
- Saldo awal piutang per pelanggan diisi di POS, dan totalnya harus sama dengan `saldoReferensi` akun piutang.

## Berkas data POS (POS ke akuntansiApp)

Berkas ini membawa jurnal dan mutasi stok satu rentang tanggal. Nama berkas: `KDMP_POS_DATA_<unit>_<dari>_<sampai>.json`. Rupiah ditulis sebagai bilangan bulat; jumlah barang (`q`) boleh memakai sampai 3 desimal.

| Field | Tipe | Isi |
| --- | --- | --- |
| `app` | teks | Selalu `kdmp-pos-data` |
| `versi` | angka bulat | `1` |
| `idBatch` | teks (UUID) | Dibuat baru pada setiap ekspor |
| `idTemplat` | teks | `idTemplat` dari template yang dipakai POS |
| `unit` | teks | Harus sama dengan unit yang sedang login di akuntansiApp |
| `dibuat` | teks ISO | Waktu ekspor, dengan zona waktu |
| `periode` | `{dari, sampai}` | Rentang tanggal, inklusif, ISO `yyyy-mm-dd` |
| `jurnal` | `[{d, no, ak, db, kr, ket, kom}]` | Baris jurnal, bentuknya sama dengan baris di tab Jurnal |
| `mutasiStok` | `[{d, no, k, j, q, h, nilai, ket, lot}]` | Mutasi barang, sama dengan Mutasi Stok di BP Persediaan ditambah `nilai` dan `lot` |
| `barangBaru` | `[{k, n, akun}]` | Barang yang ditambahkan di POS dan belum ada di Master Barang |
| `kontrol` | objek | Total kontrol (lihat bagian kontrol) |

Baris `jurnal`:

- `d`: tanggal ISO. `no`: No Bukti, selalu berawalan `POS-`.
- `ak`: kode akun diikuti nama, mis. `1.1.1.01 Kas Tunai`. Impor hanya memakai kodenya dan menormalkan nama dari COA.
- `db`, `kr`: bilangan bulat tidak negatif; hanya salah satunya yang terisi.
- `kom`: komponen arus kas, hanya pada baris kas/bank (1.1.1.\*), dan wajib pada baris kas masuk.

Baris `mutasiStok`:

- `j`: `Masuk` atau `Keluar`. POS tidak mengirim `Saldo Awal`; stok awal datang dari template.
- `q`: jumlah, selalu positif. `h`: harga satuan. `nilai`: total rupiah baris itu (pembulatan dari `q` × `h`).
- `lot`: opsional, hanya untuk `Keluar` retur pembelian; berisi `no` mutasi `Masuk` asal.
- Satu baris per barang, per hari, per jenis transaksi (lihat bagian FIFO).

## Pemetaan transaksi ke jurnal

POS membuat jurnal harian ringkas per jenis transaksi. Satu No Bukti adalah satu jurnal yang seimbang (total debit sama dengan total kredit). Format No Bukti: `POS-yyyymmdd-<JENIS>`, ditambah `-nnn` bila ada lebih dari satu dokumen pada hari itu.

**Akun bawaan per peran** (dikirim di `pemetaan` pada template; operator boleh mengganti dengan akun lain yang ada di COA):

| Peran | Akun bawaan |
| --- | --- |
| `kasTunai` | 1.1.1.01 Kas Tunai |
| `bank` | 1.1.1.02 Kas di Bank BRI (akun kas 1.1.1.\* lain boleh dipilih di POS) |
| `penjualan` | 4.1.1.01 Pendapatan Penjualan Barang Dagangan |
| `hpp` | 5.1.1.01 Harga Pokok Penjualan Barang Dagangan |
| `piutang` | 1.1.2.01 Piutang Usaha |
| `utangUsaha` | 2.1.3.01 Utang Usaha (akun per pemasok, mis. 2.1.3.02, boleh dipilih di POS) |
| `selisihOpnameKurang` | 6.1.9.12 Beban Kerugian Penjualan |
| `selisihOpnameLebih` | 4.1.9.02 Pendapatan Lainnya |

Akun persediaan tidak ada di `pemetaan`: tiap barang membawa akunnya sendiri (`barang.akun`), dan baris persediaan dikelompokkan per akun.

**Jenis transaksi:**

| Kode | Jenis | Debit | Kredit | `kom` pada baris kas |
| --- | --- | --- | --- | --- |
| `JUAL` | Penjualan harian | Kas/bank/piutang per cara bayar; HPP | Penjualan; Persediaan per akun | Masuk: Penerimaan Kas dari Pelayanan kepada Anggota atau dari Non Anggota |
| `PELUNASAN` | Pelunasan piutang | Kas/bank | Piutang | Masuk: sama seperti penjualan |
| `BELI` | Pembelian | Persediaan per akun | Kas/bank (tunai) atau Utang Usaha | Keluar: dikosongkan (otomatis) |
| `BAYAR` | Pembayaran utang pemasok | Utang Usaha | Kas/bank | Keluar: dikosongkan (otomatis) |
| `RJUAL` | Retur penjualan | Penjualan; Persediaan | Kas/bank atau Piutang; HPP | Keluar: diisi komponen penerimaan yang sama (mengurangi) |
| `RBELI` | Retur pembelian | Kas/bank atau Utang Usaha | Persediaan | Masuk: Pembelian Harga Pokok Barang |
| `OPNAME` | Selisih stok opname | Kurang: beban selisih. Lebih: Persediaan | Kurang: Persediaan. Lebih: pendapatan selisih | Tidak ada |
| `SETOR` | Setoran kas ke bank | Bank | Kas Tunai | Tidak ada |

Aturan arus kas (mengikuti perilaku akuntansiApp saat ini):

- Komponen arus kas diturunkan otomatis hanya untuk **kas keluar** yang `kom`-nya kosong. Untuk **kas masuk**, POS wajib mengisi `kom`; bila tidak, laporan Arus Kas menunjukkan selisih terhadap Kas di Neraca.
- Retur penjualan tunai tidak punya aturan otomatis (akun lawannya pendapatan), jadi `kom` diisi eksplisit pada baris kas keluar.
- Penjualan ke anggota dan non-anggota dipisah menjadi dua baris kas, masing-masing dengan `kom` sendiri.
- Baris HPP sama dengan jumlah baris persediaan yang sudah dibulatkan, supaya jurnal tetap seimbang.

## Aturan FIFO dan mutasi stok

POS dan akuntansiApp harus menghasilkan HPP yang sama dari data yang sama, jadi aturan FIFO di bawah berlaku untuk keduanya.

1. **Lapisan.** Setiap stok awal dan setiap mutasi `Masuk` membentuk satu lapisan (tanggal, sisa jumlah, harga satuan). Mutasi `Keluar` mengambil dari lapisan tertua lebih dulu.
2. **Urutan pemrosesan.** Diurutkan menurut tanggal. Pada tanggal yang sama: stok awal, lalu semua `Masuk`, lalu semua `Keluar`; di dalam kelompok yang sama mengikuti urutan array. Aturan ini berbeda dari metode rata-rata yang sekarang dipakai BP Persediaan, yang hanya mengikuti urutan input.
3. **Nilai `Keluar`.** Jumlah dari (jumlah diambil × harga lapisan) untuk semua lapisan yang terpakai, dibulatkan ke rupiah per baris. `h` pada baris `Keluar` = `nilai` ÷ `q`.
4. **Agregasi.** `Masuk`: satu baris per barang per dokumen pembelian. `Keluar`: satu baris per barang per hari per jenis transaksi (`JUAL`, `RBELI`, `OPNAME`).
5. **Retur penjualan.** Barang kembali sebagai `Masuk` dengan `h` = HPP per satuan pada penjualan asal, dan membentuk lapisan baru pada tanggal retur.
6. **Retur pembelian.** `Keluar` dengan `lot` = No Bukti `Masuk` asal. Lapisan itu dikurangi lebih dulu, bukan lapisan tertua.
7. **Stok opname.** Selisih kurang menjadi `Keluar` (nilai FIFO biasa). Selisih lebih menjadi `Masuk` dengan harga lapisan terakhir barang itu.
8. **Stok awal.** POS tidak mengirim `Saldo Awal`. Lapisan awal berasal dari `stokAwal` di template; di akuntansiApp, dari mutasi `Saldo Awal` di Mutasi Stok (beberapa baris untuk satu barang = beberapa lapisan).
9. **Stok minus.** Tidak boleh. `Keluar` yang melebihi stok pada tanggalnya ditolak saat impor.

**Pemeriksaan silang.** Saat impor, akuntansiApp menghitung ulang FIFO dari lapisan awal dan semua mutasi, lalu membandingkan `nilai` setiap baris `Keluar`. Selisih lebih dari Rp 1 per baris ditampilkan sebagai peringatan di pratinjau.

## Validasi, pratinjau, dan impor

Impor di akuntansiApp berjalan dalam satu urutan dan tidak mengubah data sebelum Anda mengonfirmasi.

1. Baca berkas: JSON valid, `app` = `kdmp-pos-data`, `versi` didukung.
2. Cocokkan konteks: `unit` sama dengan unit yang login, dan `idTemplat` dikenal.
3. Jalankan validasi (tabel di bawah).
4. Tampilkan pratinjau: jumlah baris jurnal yang baru, diganti, dan dihapus; total debit dan kredit per jenis; barang baru; perbandingan HPP; perbandingan saldo kontrol.
5. Setelah konfirmasi, buat titik pulih otomatis berlabel `Sebelum impor POS <idBatch>`.
6. Terapkan: hapus baris jurnal dan mutasi stok yang `no`-nya berawalan `POS-` dengan tanggal dalam `periode`, lalu tambahkan isi berkas. Gabungkan `barangBaru` ke Master Barang berdasarkan kode barang.
7. Catat batch di `data.imporPos[idBatch] = {ts, dari, sampai, namaBerkas}`, simpan, lalu tampilkan hasil impor.

**Galat (impor diblokir)** dan **peringatan (butuh konfirmasi)**:

| Tingkat | Pemeriksaan |
| --- | --- |
| Galat | Kode akun tidak ada di COA |
| Galat | Total debit tidak sama dengan total kredit pada satu No Bukti |
| Galat | Tanggal di luar `periode`, atau `no` tidak berawalan `POS-` |
| Galat | `db` atau `kr` negatif, atau keduanya terisi pada satu baris |
| Galat | `kom` bukan salah satu komponen arus kas, atau `kom` ada pada baris non-kas |
| Galat | Kode barang tidak ada di Master Barang maupun `barangBaru` |
| Galat | `Keluar` melebihi stok pada tanggalnya, atau `lot` tidak ditemukan |
| Galat | Checksum atau total kontrol jumlah dan debit/kredit tidak cocok |
| Peringatan | `idTemplat` tidak dikenal, atau COA berubah sejak template diekspor |
| Peringatan | `nilai` baris `Keluar` berbeda lebih dari Rp 1 dari hitungan FIFO akuntansiApp |
| Peringatan | Saldo akhir menurut POS berbeda dari Buku Besar (lihat bagian kontrol) |
| Peringatan | Rentang tumpang tindih dengan batch yang diimpor lebih baru (`dibuat` lebih lama) |

**Sifat impor:**

- **Idempoten.** Mengimpor berkas yang sama dua kali menghasilkan data akhir yang sama, karena baris `POS-` dalam rentang itu diganti, bukan ditambah.
- **Baris manual aman.** Baris yang `no`-nya tidak berawalan `POS-` tidak pernah disentuh.
- **Baris `POS-` yang diubah manual akan tertimpa** pada impor ulang. Tab Jurnal memberi penanda pada baris `POS-` untuk mengingatkan hal ini.

## Total kontrol dan integritas

Objek `kontrol` di data POS memungkinkan akuntansiApp memeriksa bahwa berkas utuh dan angkanya cocok dengan buku besar.

| Field | Isi |
| --- | --- |
| `jumlahJurnal` | Banyaknya baris di `jurnal` |
| `jumlahMutasi` | Banyaknya baris di `mutasiStok` |
| `totalDebit`, `totalKredit` | Jumlah seluruh `db` dan `kr` di `jurnal` |
| `saldoAkhir` | `{kode: nilai}` saldo akun pada `periode.sampai` menurut POS: tiap akun kas/bank (1.1.1.*), piutang (1.1.2.*), persediaan (1.1.4.*), dan utang usaha (2.1.3.*) yang dipakai POS |
| `checksum` | SHA-256 (heksadesimal) dari `JSON.stringify([jurnal, mutasiStok, barangBaru])`, dengan urutan kunci objek persis seperti di spesifikasi ini |

Cara memakainya:

- Jumlah baris, total debit/kredit, dan checksum yang tidak cocok adalah galat: berkas rusak atau diubah.
- `saldoAkhir` dibandingkan dengan saldo Buku Besar pada `periode.sampai` setelah impor disimulasikan. Selisih hanya peringatan, karena Buku Besar juga memuat jurnal manual yang tidak berasal dari POS.

Checksum hanya mendeteksi kerusakan atau perubahan yang tidak disengaja. Ia tidak membuktikan siapa pembuat berkas, karena tidak ada kunci rahasia bersama. Bila nanti perlu, versi 2 bisa memakai HMAC dengan kode integrasi yang sama di kedua aplikasi.

## Contoh JSON

Contoh berikut dipersingkat (berkas asli memuat seluruh COA dan 21 komponen arus kas) tetapi angkanya konsisten: jurnal seimbang, FIFO dan saldo kontrol dapat dihitung ulang.

**Template**

```json
{
  "app": "kdmp-pos-template",
  "versi": 1,
  "idTemplat": "b3f1c2a0-7d4e-4c55-9a10-2f6e8d1b7c33",
  "dibuat": "2027-01-02T08:30:00+07:00",
  "unit": "Sembako",
  "koperasi": "Koperasi Merah Putih Kalurahan Sinduadi",
  "periode": { "tahun": 2027, "bulan": 1 },
  "metodeHpp": "FIFO",
  "posisiStok": "2026-12-31",
  "coa": [
    ["1.1.1.01", "Kas Tunai", "Debit"],
    ["1.1.1.02", "Kas di Bank BRI", "Debit"],
    ["1.1.2.01", "Piutang Usaha", "Debit"],
    ["1.1.4.02", "Persediaan Barang dari Bulog", "Debit"],
    ["2.1.3.01", "Utang Usaha", "Kredit"],
    ["4.1.1.01", "Pendapatan Penjualan Barang Dagangan", "Kredit"],
    ["5.1.1.01", "Harga Pokok Penjualan Barang Dagangan", "Debit"]
  ],
  "komponenArusKas": [
    "Penerimaan Kas dari Pelayanan kepada Anggota",
    "Penerimaan Kas dari Non Anggota",
    "Pembelian Harga Pokok Barang"
  ],
  "barang": [
    { "k": "BRS-5KG", "n": "Beras Premium 5 kg", "akun": "1.1.4.02" }
  ],
  "stokAwal": [
    { "k": "BRS-5KG", "tgl": "2026-12-31", "q": 40, "h": 62000 },
    { "k": "BRS-5KG", "tgl": "2026-12-31", "q": 20, "h": 64000 }
  ],
  "saldoReferensi": {
    "1.1.1.01": 15000000, "1.1.1.02": 5000000, "1.1.2.01": 2400000,
    "1.1.4.02": 3760000, "2.1.3.01": 800000
  },
  "pemetaan": {
    "kasTunai": "1.1.1.01", "bank": "1.1.1.02", "penjualan": "4.1.1.01",
    "hpp": "5.1.1.01", "piutang": "1.1.2.01", "utangUsaha": "2.1.3.01",
    "selisihOpnameKurang": "6.1.9.12", "selisihOpnameLebih": "4.1.9.02"
  }
}
```

**Data POS** (satu hari: penjualan Rp 2.000.000 dengan 28 sak beras keluar, dan pembelian kredit 30 sak)

```json
{
  "app": "kdmp-pos-data",
  "versi": 1,
  "idBatch": "7e0a9d52-3c1b-4f6a-8b27-c41d90e5a6f8",
  "idTemplat": "b3f1c2a0-7d4e-4c55-9a10-2f6e8d1b7c33",
  "unit": "Sembako",
  "dibuat": "2027-01-06T07:45:00+07:00",
  "periode": { "dari": "2027-01-05", "sampai": "2027-01-05" },
  "jurnal": [
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "1.1.1.01 Kas Tunai", "db": 1000000, "kr": 0, "ket": "Penjualan tunai anggota", "kom": "Penerimaan Kas dari Pelayanan kepada Anggota" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "1.1.1.01 Kas Tunai", "db": 500000, "kr": 0, "ket": "Penjualan tunai non-anggota", "kom": "Penerimaan Kas dari Non Anggota" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "1.1.1.02 Kas di Bank BRI", "db": 300000, "kr": 0, "ket": "Penjualan QRIS anggota", "kom": "Penerimaan Kas dari Pelayanan kepada Anggota" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "1.1.2.01 Piutang Usaha", "db": 200000, "kr": 0, "ket": "Penjualan kredit" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "4.1.1.01 Pendapatan Penjualan Barang Dagangan", "db": 0, "kr": 2000000, "ket": "Penjualan harian" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "5.1.1.01 Harga Pokok Penjualan Barang Dagangan", "db": 1736000, "kr": 0, "ket": "HPP penjualan harian" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "ak": "1.1.4.02 Persediaan Barang dari Bulog", "db": 0, "kr": 1736000, "ket": "HPP penjualan harian" },
    { "d": "2027-01-05", "no": "POS-20270105-BELI-001", "ak": "1.1.4.02 Persediaan Barang dari Bulog", "db": 1980000, "kr": 0, "ket": "Pembelian faktur 0123" },
    { "d": "2027-01-05", "no": "POS-20270105-BELI-001", "ak": "2.1.3.01 Utang Usaha", "db": 0, "kr": 1980000, "ket": "Pembelian faktur 0123" }
  ],
  "mutasiStok": [
    { "d": "2027-01-05", "no": "POS-20270105-BELI-001", "k": "BRS-5KG", "j": "Masuk", "q": 30, "h": 66000, "nilai": 1980000, "ket": "Faktur 0123" },
    { "d": "2027-01-05", "no": "POS-20270105-JUAL", "k": "BRS-5KG", "j": "Keluar", "q": 28, "h": 62000, "nilai": 1736000, "ket": "Penjualan harian" }
  ],
  "barangBaru": [],
  "kontrol": {
    "jumlahJurnal": 9,
    "jumlahMutasi": 2,
    "totalDebit": 5716000,
    "totalKredit": 5716000,
    "saldoAkhir": {
      "1.1.1.01": 16500000, "1.1.1.02": 5300000, "1.1.2.01": 2600000,
      "1.1.4.02": 4004000, "2.1.3.01": 2780000
    },
    "checksum": "3b1f0c7a5e9d42d8a6c1f4e07b2d9a85c3e6f1a0b7d4c2e9f8a1b3c5d7e9f012"
  }
}
```

Catatan contoh: nilai `checksum` di atas hanya ilustrasi; nilai sebenarnya dihitung dari isi berkas. HPP 1.736.000 berasal dari 28 sak × Rp 62.000 (lapisan tertua), dan Utang Usaha 2.780.000 = saldo referensi 800.000 + pembelian 1.980.000.

## Perubahan di akuntansiApp

Perubahan mengikuti struktur modul yang sudah ada (namespace `KDMP`, logika murni di `core`, tampilan di `app` dan `fitur`).

| Modul | Perubahan |
| --- | --- |
| `config/aplikasi` | Tambah `idTeknis.posTemplat = 'kdmp-pos-template'` dan `idTeknis.posData = 'kdmp-pos-data'`. |
| `config/unit`, `core/unit` | Tambah pengaturan `hpp` per unit: `'RATA'` (bawaan, untuk USP dan unit lama) atau `'FIFO'`. Formulir tambah unit mendapat pilihan metode saat opsi persediaan dicentang. |
| `core/persediaan` | Tambah `hitungStokFifo(barang, mutasi, batas)` dengan bentuk hasil sama seperti `hitungStok` ditambah daftar lapisan. Urutan: tanggal, lalu Saldo Awal, Masuk, Keluar. Mendukung `lot`. `hitungStok` yang ada tetap untuk metode `RATA`. |
| `core/posKontrak` (baru) | Fungsi murni tanpa DOM, bisa diuji di Node: `bangunTemplat()`, `validasiData()`, `rencanaImpor()`, `hitungChecksum()`. |
| `app/imporPos` (baru) | Alur tampilan: pilih berkas, pratinjau, konfirmasi, titik pulih otomatis, terapkan, daftar batch. Aksi `pos.templat`, `pos.impor`, `pos.terapkan`. |
| `fitur/data` | Tombol **Ekspor template POS** dan **Impor data POS**, hanya untuk unit yang memakai persediaan; tabel riwayat batch dari `data.imporPos`. |
| `fitur/persediaan` | Kartu Stok dan Rekap memakai metode unit; tampilkan label metode (FIFO atau Rata-rata) dan lapisan tersisa per barang. |
| `fitur/jurnal` | Beri penanda pada baris dengan No Bukti berawalan `POS-` dan catatan bahwa perubahan manual akan tertimpa saat impor ulang. |
| `storage`, `app/paket` | `data.imporPos` ikut tersimpan terenkripsi bersama data unit dan ikut dalam backup; paket unit untuk bendahara hanya membawa `rows` seperti sekarang. |
| Uji | Tambah kasus FIFO, validasi kontrak, dan impor idempoten ke alat uji regresi browser yang sudah ada. |

Urutan pengerjaan yang disarankan: `core/persediaan` (FIFO) dan `core/posKontrak` lebih dulu karena bisa diuji tanpa tampilan, lalu `app/imporPos` dan tombol di tab Data.

## Keputusan yang ditetapkan

Sembilan hal yang tadinya terbuka sudah ditetapkan mengikuti rekomendasi (21 Nov 2026). Spesifikasi siap dipakai untuk implementasi.

- [ ] **Retur pembelian dan `lot`.** Retur pembelian dinilai pada lapisan pembelian asal (`lot`), sehingga HPP dan stok tetap akurat.
- [ ] **Akun selisih opname.** Kurang memakai 6.1.9.12, lebih memakai 4.1.9.02.
- [ ] **Anggota atau non-anggota.** Anggota dicatat di POS, bukan di akuntansiApp. POS mengirim status pelanggan di data, dan itu menentukan `kom` penerimaan kas.
- [ ] **Piutang per pelanggan.** Satu akun 1.1.2.01 di akuntansiApp. Rincian per pelanggan dipegang POS.
- [ ] **Akun utang per pemasok.** Satu akun per pemasok (2.1.3.xx), dikirim lewat `pemetaan` di template.
- [ ] **Stok minus.** Ditolak. POS tidak boleh menjual melebihi stok, dan impor menolak data yang membuat stok negatif.
- [ ] **Keamanan berkas.** Checksum SHA-256 cukup untuk v1 (hanya integritas). HMAC ditunda ke versi berikutnya.
- [ ] **Jangka waktu ekspor.** POS boleh mengekspor kapan saja dengan rentang tanggal. Impor idempoten, jadi tumpang tindih aman.
- [ ] **Repo sumber.** Modul sumber ada di `public/kdmp-akuntansi-unit-baru-modular/` (PR #1). Perubahan dikerjakan di sana, lalu dibangun menjadi satu berkas HTML.
