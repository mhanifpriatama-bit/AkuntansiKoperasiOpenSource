# Peta berkas (Versi A)

Urutan di bawah = urutan muat di `index.html`. Berkas hanya boleh memakai yang di atasnya (atau fungsi yang baru
dipanggil saat aplikasi berjalan).

| Berkas | Isi |
|---|---|
| `js/00-penanganan-error.js` | pesan bila aplikasi gagal dimuat |
| `config/aplikasi.js` | nama koperasi, judul login, versi, logo |
| `config/coa.js` | Master COA bawaan |
| `config/coa-legacy.js` | data migrasi COA versi lama |
| `config/arus-kas.js` | komponen & susunan Laporan Arus Kas |
| `config/laporan-usp.js`, `laporan-sembako.js`, `laporan-konsolidasi.js` | spesifikasi Neraca (LPK) & Laba Rugi (LR) |
| `js/10-konstanta.js` | nama bulan, peta saldo normal `NM`, `COA` |
| `js/11-migrasi-coa.js` | `migCoa`, `legacy`: migrasi data lama |
| `js/12-variabel-global.js` | variabel global (`S` data aktif, `K` mode konsolidasi, `DK/RAW/PIN/META` kunci), `f` format rupiah, `R` daftar tab |
| `js/20-kripto.js` | PBKDF2, AES-GCM, base64 |
| `js/21-penyimpanan-indexeddb.js` | `kv` (IndexedDB) |
| `js/30-hitung-saldo.js` | `calc`: saldo akun dari jurnal |
| `js/31-susun-laporan.js` | `ev` (susun laporan), `rep` (tabel), `unitData`, `lakRows`, `konX`, `kcols` (konsolidasi) |
| `js/32-arus-kas-komponen.js` | pemetaan otomatis komponen arus kas |
| `js/40-ui-umum.js` | `esc`, tanggal, `toast`, status, `go` (navigasi) |
| `js/41-input-tanggal-angka.js` | input tanggal & angka berformat |
| `js/42-simpan-otomatis.js` | `save`, `saveNow`, titik pulih otomatis |
| `js/43-ekspor.js` | simpan berkas, cetak, CSV, Excel |
| `js/44-kop-laporan.js` | kop laporan, logo, tanda tangan |
| `js/45-coa.js` | pengelolaan Master COA |
| `js/50-login-dan-setup.js` | setup sandi, login, reset |
| `js/51-sinkronisasi.js` | sinkronisasi antar tab |
| `js/52-mulai-sesi.js` | `start`: memulai sesi setelah login |
| `js/53-paket-unit.js` | ekspor/impor paket unit, ganti sandi |
| `js/54-backup.js` | backup & pemulihan database |
| `js/60-…68-*.js` | satu berkas per tab: Jurnal, Buku Besar, Laporan unit, Data, Konsolidasi, Master COA, komponen buku pembantu, BP Aset, BP Persediaan |
| `js/80-panel-database.js` | panel database, titik pulih, Ctrl+S |
| `js/99-main.js` | titik masuk |

## Menelusuri ke aplikasi asli

Kode di `js/` adalah potongan utuh dari berkas asli (`APLIKASI LAPORAN KEUANGAN.html`) dengan tiga perubahan: nama koperasi/logo
dibaca dari `config/aplikasi.js`, tiap tab didaftarkan `R['Nama']=function(){…}` (bukan satu literal objek), dan fungsi
diagnosa berkas terpotong dibuang.
