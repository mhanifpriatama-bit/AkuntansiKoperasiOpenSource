# KDMP Akuntansi (Versi A – pecah berkas)

Aplikasi akuntansi koperasi yang berjalan **sepenuhnya offline di browser** (jurnal, buku besar, neraca saldo, laba rugi,
neraca, arus kas, buku pembantu aset & persediaan, konsolidasi USP + Sembako). Data terenkripsi di IndexedDB; tanpa server.

**Versi A = pendekatan minimal:** aplikasi satu-berkas asli dipecah menjadi CSS, konfigurasi, dan JavaScript per topik.
**Isi kode tidak ditulis ulang** (gaya, nama variabel, variabel global, `onclick` inline tetap seperti aslinya), sehingga risikonya
paling kecil dan perbedaannya dari aplikasi asli mudah ditelusuri. Perilaku & angka laporan identik dengan aslinya
(lihat `docs/pengujian.md` di Versi B / `alat-verifikasi/`).

## Menjalankan

Buka `index.html` di browser (Chrome/Edge/Firefox terbaru). Tanpa install, server, atau build.
Satu berkas untuk dibagikan: `node tools/satu-berkas.js` → `dist/kdmp-akuntansi.html`.

## Struktur

```
index.html            kerangka halaman + urutan muat skrip
assets/logo.png       logo bawaan
css/                  gaya per area (dasar, tata-letak, tabel, form, komponen, cetak)
config/               DATA: identitas koperasi (aplikasi.js), COA, laporan USP/Sembako/Konsolidasi, arus kas, migrasi COA lama
js/                   KODE, bernomor sesuai urutan muat (lihat docs/peta-berkas.md)
contoh-data/          data sintetis untuk uji coba
tools/                penggabung satu-berkas
docs/                 peta berkas, temuan
```

Perlu diketahui: kode di `js/` masih memakai variabel global bersama (`S`, `K`, `COA`, ...) dan **urutan `<script>` di
`index.html` harus dijaga**. Untuk kode yang lebih terstruktur dan bisa dites otomatis, lihat Versi B.

## Mengganti identitas koperasi / logo

Ubah `config/aplikasi.js` dan letakkan logo di `assets/`. Jangan mengubah nama teknis database/format berkas (data lama tak terbaca).

## Lisensi

MIT – lihat `LICENSE`. Catatan: sebelum dipakai untuk pelaporan resmi, minta akuntan/pengurus meninjau kebijakan akuntansi
dan keamanan (lihat `docs/temuan.md`).
