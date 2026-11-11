# Arsitektur (Versi B)

## Prinsip

1. **Data terpisah dari logika, logika terpisah dari tampilan.**
   `js/config/` (data) → `js/core/` (hitungan) → `js/ui/` + `js/fitur/` (tampilan).
2. **`js/core/` murni**: tidak memakai DOM, `document`, atau state global. Masukan lewat parameter, keluaran berupa
   nilai. Karena itu bisa dites di Node tanpa browser.
3. **Satu namespace `KDMP`**, tanpa variabel global lain. Skrip biasa (bukan ES module) agar jalan dari `file://`.
4. **Tidak ada `onclick` inline.** Peristiwa ditangani terpusat oleh `KDMP.ui.aksi`.

## Lapisan dan urutan muat

Urutan `<script>` di `index.html` penting: setiap berkas hanya boleh memakai berkas di atasnya.

| Lapisan | Folder | Isi | Boleh bergantung pada |
|---|---|---|---|
| Namespace & state | `js/namespace.js`, `js/app/state.js` | objek `KDMP`, state sesi | – |
| Config | `js/config/` | COA, laporan, arus kas, identitas | – |
| Core | `js/core/` | format, rumus, COA, saldo, laporan, arus kas, konsolidasi, aset tetap, persediaan | config, core |
| Storage | `js/storage/` | IndexedDB, titik pulih, backup | config, core |
| Security | `js/security/` | kripto, manajemen kunci | core |
| UI | `js/ui/` | dom, aksi, pesan, tabel laporan, input tanggal/angka, ekspor, grid buku pembantu | core, storage |
| App | `js/app/` | simpan otomatis, navigasi, login/setup, sinkronisasi, paket unit, panel database | semua di atas |
| Fitur | `js/fitur/` | satu berkas per tab | semua di atas |
| Titik masuk | `js/app/main.js` | pasang pendengar, buka database, tampilkan login | semua |

## State sesi

`KDMP.app.state` (`js/app/state.js`) memegang semua yang berubah selama sesi: data yang dibuka (`data`), apakah mode
konsolidasi (`konsol`), unit (`unit`), tab aktif, dan kunci enkripsi (`kunci`, hanya di memori). Bentuk `data` dijelaskan di
[`struktur-data.md`](struktur-data.md).

## Alur data sebuah laporan

```
state.data.rows (jurnal)
   └─ core/saldo.hitungSaldo(rows, tahun, bulan)     → saldo per akun (cum, mon, M, kom, ...)
        └─ core/laporan.susunLaporan(spesifikasi, peta)  → baris laporan + nilai
             └─ ui/tabel-laporan → HTML  → fitur/laporan-unit.js menampilkannya
```

Konsolidasi: `core/konsolidasi.kolomKonsolidasi` memanggil rantai yang sama untuk tiap unit, lalu menambah kolom
jumlah, eliminasi, dan konsolidasi.

## Penanganan peristiwa (`KDMP.ui.aksi`)

```js
// 1. daftarkan fungsi (di berkas fitur)
KDMP.ui.aksi.daftar({ 'jurnal.hapus': (el) => hapusBaris(+arg(el, 'i')) });

// 2. tempel di template HTML
`<button ${klik('jurnal.hapus', { i })}>×</button>`
// menghasilkan: <button data-aksi="jurnal.hapus" data-a-i="3">×</button>
```

Jenis: `klik`, `ubah` (change), `input`, `kirim` (submit), `seret` (drag-drop). Satu pendengar per jenis dipasang di
`document` sekali saat mulai, sehingga HTML hasil `innerHTML` tidak perlu dipasangi pendengar lagi.
Nama aksi memakai pola `modul.aksi`. Mendaftarkan nama yang sama dua kali melempar galat.

## Tab

Tab adalah objek `{ render() }` yang didaftarkan di `KDMP.app.tab[nama]`. `KDMP.app.navigasi.pergi(nama)` membangun
menu, memanggil `render()`, lalu menambahkan spanduk konsolidasi / kolom tanda tangan bila perlu.
Daftar tab per sesi ada di `daftarTab()` pada `js/app/navigasi.js`.

## Penyimpanan & keamanan (ringkas)

- Semua data di IndexedDB (`kdmp_akuntansi`, store `s`), nilai data unit **terenkripsi** AES-GCM.
- Kunci data unit acak 32 byte; dibungkus oleh kunci dari sandi unit (PBKDF2 200.000 iterasi) dan oleh kunci dari
  sandi Admin. Detail di komentar `js/security/kunci.js`.
- Simpan otomatis tertunda 300 ms (`js/app/simpan.js`), disertai titik pulih harian (maks. 5) dan sinkronisasi antar tab
  (`js/app/sinkron.js`).
