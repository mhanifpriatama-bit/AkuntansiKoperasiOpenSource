# Aplikasi USP (Koperasi Merah Putih)

Satu berkas HTML offline: anggota, simpanan, pinjaman, angsuran, kas harian, ekspor jurnal ke akuntansiApp.
Data di IndexedDB terenkripsi (AES-GCM, kunci dari kata sandi). Kontrak: Spesifikasi Kontrak USP v1.

- `src/inti.js` perhitungan (jadwal, alokasi, tunggakan, ekspor jurnal); `src/layanan.js` aturan transaksi; `src/simpan.js`, `src/app.js` penyimpanan dan tampilan
- `node build.js` -> `dist/kdmp-usp.html`
- Uji: `node alat/uji-inti.js`, `node alat/uji-layanan.js`; `python3 alat/asap.py` (Chrome) lalu `node alat/uji-silang.js`

Belum ada di v1: peran dengan kata sandi terpisah, banyak kasir (paket kerja/kasir), Simapan, penyisihan piutang (CKP), SHU.
