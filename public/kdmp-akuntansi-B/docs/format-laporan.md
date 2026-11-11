# Format spesifikasi laporan

Laporan Posisi Keuangan (`LPK`, neraca) dan Laba Rugi (`LR`) didefinisikan sebagai daftar baris (array) di
`js/config/laporan-*.js`. Mesinnya: `KDMP.core.laporan.susunLaporan`.

| Baris | Arti |
|---|---|
| `["H", level, "Judul"]` | judul bagian (tanpa angka); level 1–3 menentukan tebal/indent |
| `["B"]` | awal blok; subtotal `S` menjumlah semua baris sejak `B` terakhir |
| `["A", "1.1.1.01", "Uraian"]` | satu akun; uraian boleh diganti, bila kosong dipakai nama dari Master COA |
| `["O", "Uraian", [awalan...], [kecuali...], "kunci", flag]` | "lainnya": jumlah akun berawalan tertentu yang belum tampil sebagai baris `A` di blok itu; `kecuali` = kode yang dikeluarkan; flag `true` = grup "Aset Lain-lain" (hanya konsolidasi) |
| `["S", "kunci", "Uraian"]` | subtotal blok |
| `["T", "kunci", "Uraian", "[a]+[b]-[c]"]` | total dari nilai baris bernama lain (hanya `+` dan `-`) |
| `["L", "kunci", "Uraian", "kunciLaba"]` | nilai dari luar (mis. SHU berjalan dari Laba Rugi) |

Hasil `susunLaporan(spec, peta, nilaiL)` = `{ rows: [{it, v}], key: {kunci: nilai} }`. Neraca dianggap *balance*
bila `key.tot_aset == key.tot_ke` (lihat `js/fitur/laporan-unit.js`).

Contoh (potongan):

```js
["H", 1, "ASET"], ["B"],
["A", "1.1.1.01"], ["A", "1.1.1.02"],
["O", "Kas dan bank lainnya", ["1.1.1."], ["1.1.1.01", "1.1.1.02"], "kas_lain", false],
["S", "tot_kas", "Total Kas dan Bank"]
```

## Arus kas (`js/config/arus-kas.js`)

Baris: `[level, uraian, tipe, argumen]`, bernomor mulai 13 mengikuti lembar Excel asal. Tipe: `h` judul, `c` komponen
(jumlah dari kolom *Komponen Arus Kas* jurnal), `s` jumlah baris nomor a..b, `x`/`x1` rumus `=E26+E18`
(`SUM(E55:E57)` didukung), `open` saldo kas awal, `e` baris kosong.
