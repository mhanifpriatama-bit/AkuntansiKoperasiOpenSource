# Panduan Berkontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan **KDMP Akuntansi — Sistem Keuangan Koperasi Terbuka**! Proyek ini dirancang agar dapat dimanfaatkan oleh ribuan Koperasi Desa, BUMDes, dan UMKM di seluruh Indonesia.

---

## 👥 Siapa Saja yang Bisa Berkontribusi?

Kontributor tidak hanya terbatas pada programmer/developer. Kami sangat membutuhkan kolaborasi dari berbagai bidang:

1. **Akademisi & Praktisi Akuntansi (Mahasiswa STAN, Dosen, Auditor)**:
   - Evaluasi kesesuaian laporan keuangan dengan standar SAK EP / PermenkopUKM terbaru.
   - Perumusan template bagan akun (COA) untuk jenis koperasi lain (misal: Koperasi Syariah, Koperasi Pertanian, KUD, BUMDes).
   - Penulisan skenario uji saldo dan validasi kepatuhan pajak koperasi.

2. **Pengurus & Bendahara Koperasi di Lapangan**:
   - Memberikan masukan (*feedback*) terkait alur kerja pembukuan harian yang dirasa rumit atau perlu disederhanakan.
   - Melaporkan kendala (*bug*) saat input transaksi atau saat rekonsiliasi data.

3. **Software Engineer & Web Developer**:
   - Optimalisasi performa database offline IndexedDB.
   - Pengembangan fitur baru (integrasi pencetakan struk termal, ekspor PDF kustom, grafik visual, PWA installable).
   - Perbaikan bug teknis dan penyempurnaan UI/UX responsive mobile.

---

## 🛠️ Alur Kontribusi Kode via GitHub

Alur kerja (*workflow*) kontribusi kode dilakukan menggunakan standar **Fork & Pull Request**:

```text
[Original Repo] ───────(Fork)───────> [Repo Fork Anda]
                                             │ (git clone & buat branch)
                                             ▼
[Review & Merge] <──(Pull Request)─── [Commit Fitur Anda]
```

### Langkah-langkah Teknis:

1. **Fork Repositori**:
   Klik tombol **Fork** di pojok kanan atas halaman GitHub proyek ini untuk membuat salinan di akun Anda.

2. **Clone ke Komputer Lokal**:
   ```bash
   git clone https://github.com/USERNAME-ANDA/akuntansi-koperasi.git
   cd akuntansi-koperasi
   ```

3. **Buat Branch Baru**:
   Gunakan nama branch yang deskriptif:
   ```bash
   git checkout -b fitur/template-coa-syariah
   # atau
   git checkout -b fix/perbaikan-format-tanggal
   ```

4. **Lakukan Perubahan & Uji Coba**:
   - Untuk versi Vanilla ES Modules, buka dan uji di `/public/kdmp-modular/index.html`.
   - Untuk versi React, jalankan `npm run dev` dan pastikan `npm run lint` serta `npm run build` berhasil tanpa error.

5. **Commit Perubahan**:
   Tuliskan pesan komit yang jelas dalam Bahasa Indonesia atau Inggris:
   ```bash
   git commit -m "feat: tambahkan dukungan template akun koperasi syariah"
   ```

6. **Push dan Buka Pull Request (PR)**:
   ```bash
   git push origin fitur/template-coa-syariah
   ```
   Buka halaman GitHub repositori asli, lalu klik **"Compare & pull request"**. Jelaskan apa yang diubah dan bagaimana cara mengujinya.

---

## 💡 Etika & Komitmen Kontribusi

- **Keterbukaan & Saling Menghormati**: Sambut kontributor pemula dengan ramah. Diskusikan solusi teknis dengan santun.
- **Lisensi Apache 2.0**: Dengan mengirimkan kontribusi (*Pull Request*), Anda menyetujui bahwa kontribusi Anda dilisensikan di bawah lisensi Apache 2.0 yang sama.
- **Kemandirian & Non-Proprietary**: Utamakan solusi *local-first*, ringan, dan tidak bergantung pada layanan cloud berbayar agar tetap terjangkau untuk koperasi desa terpencil.

Terima kasih atas dedikasi Anda dalam memajukan ekonomi kerakyatan Indonesia!
