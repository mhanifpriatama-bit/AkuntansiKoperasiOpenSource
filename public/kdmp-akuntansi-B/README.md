# KDMP Akuntansi (Versi B – kode terstruktur)

Aplikasi akuntansi koperasi yang berjalan **sepenuhnya offline di browser**: jurnal, buku besar, neraca saldo,
laba rugi, neraca, arus kas, buku pembantu aset & persediaan, serta konsolidasi unit USP + Sembako.
Data disimpan terenkripsi (AES-GCM) di IndexedDB browser; tidak ada server.

Versi ini adalah susunan ulang dari aplikasi satu-berkas aslinya. **Perilaku dan angka laporan tidak berubah**
(dibuktikan dengan uji pembanding, lihat `docs/pengujian.md`); yang berubah hanya cara kode disusun agar mudah
dikembangkan bersama.

## Menjalankan

Buka `index.html` langsung di browser (Chrome/Edge/Firefox terbaru). Tidak perlu install, server, atau build.

Untuk membagikan ke pengguna koperasi sebagai **satu berkas**:

```
node tools/satu-berkas.js      # menghasilkan dist/kdmp-akuntansi.html
```

## Pengujian

```
npm test                       # atau: node --test "tests/*.test.js"   (Node 18+, tanpa dependensi)
```

Tes memakai **data sintetis** (`tests/data/data-sintetis.json`, bukan data koperasi nyata).

## Struktur

```
index.html              kerangka halaman + urutan muat skrip
assets/logo.png         logo bawaan (bisa diganti di js/config/aplikasi.js)
css/                    gaya, dipecah per area
js/config/              DATA: identitas koperasi, COA, spesifikasi laporan, arus kas, kategori aset
js/core/                LOGIKA AKUNTANSI murni (tanpa DOM, tanpa state global) -> mudah dites
js/storage/             IndexedDB, titik pulih, backup
js/security/            enkripsi & manajemen sandi/kunci
js/ui/                  komponen tampilan bersama (tabel laporan, input tanggal/angka, ekspor, dialog)
js/app/                 state sesi, login/setup, navigasi, simpan otomatis, sinkronisasi, paket unit
js/fitur/               satu berkas per tab (Jurnal, Buku Besar, Neraca, BP Aset, ...)
tests/                  tes Node
tools/                  skrip bantu (penggabung satu-berkas)
docs/                   dokumentasi
```

Skrip dimuat sebagai JavaScript biasa (bukan ES module) agar tetap jalan dari `file://`. Seluruh kode berada di
bawah satu namespace `KDMP`; tidak ada variabel global lain dan tidak ada atribut `onclick` di HTML.

## Dokumentasi

- [`docs/arsitektur.md`](docs/arsitektur.md) – lapisan, urutan muat, alur event, state
- [`docs/panduan-pengembang.md`](docs/panduan-pengembang.md) – cara menambah akun, laporan, unit, tab; mengganti identitas koperasi
- [`docs/format-laporan.md`](docs/format-laporan.md) – format spesifikasi laporan deklaratif
- [`docs/struktur-data.md`](docs/struktur-data.md) – bentuk data yang disimpan (kompatibel dengan versi asli)
- [`docs/pengujian.md`](docs/pengujian.md) – tes unit & uji pembanding di browser
- [`docs/temuan.md`](docs/temuan.md) – keanehan/bug yang ditemukan saat refactor (belum diubah perilakunya)
- [`CONTRIBUTING.md`](CONTRIBUTING.md) – cara berkontribusi

## Lisensi

MIT – lihat [`LICENSE`](LICENSE).

> Catatan: ini perangkat bantu pencatatan. Sebelum dipakai untuk pelaporan resmi, minta akuntan/pengurus koperasi
> meninjau kebijakan akuntansi (COA, penyusutan, eliminasi) dan, bila perlu, tinjauan keamanan independen.
