/*
 * Identitas koperasi & aplikasi. Ubah berkas ini untuk memakai aplikasi di koperasi lain.
 * (Nama unit usaha, warna, dan spesifikasi laporan ada di laporan-*.js; akun di coa.js.)
 */
;(function () {
  globalThis.KDMP = globalThis.KDMP || {};
  KDMP.config = KDMP.config || {};
  KDMP.config.aplikasi = {
    namaLengkap: 'Koperasi Merah Putih Kalurahan Sinduadi', // tampil di header
    singkatan: 'KDMP',                                      // nama bawaan pada kop laporan
    judulHalaman: 'KDMP Akuntansi',
    judulLogin: 'Akuntansi Koperasi Merah Putih',
    subJudulLogin: 'Kalurahan Sinduadi',
    versi: 'Versi 9 · Offline · 02/11/2026',
    logo: 'assets/logo.png',                               // logo bawaan; pengguna bisa menggantinya di tab Data
    unit: ['USP', 'Sembako'],                               // unit usaha yang dikonsolidasi (urutan = urutan kolom)
    namaBulan: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    // Nama teknis di bawah ini jangan diubah: dipakai di format berkas backup & nama database,
    // sehingga berkas/ data lama tetap bisa dibuka.
    idTeknis: { database: 'kdmp_akuntansi', backup: 'kdmp-full', paketUnit: 'kdmp2', coa: 'kdmp-coa' }
  };
})();
