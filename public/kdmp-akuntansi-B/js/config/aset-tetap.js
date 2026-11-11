/*
 * Kategori aset tetap -> [akun aset, akun akumulasi penyusutan, akun beban penyusutan].
 * Akun akumulasi/beban kosong ('') berarti kategori itu tidak disusutkan (mis. Tanah).
 * Dipakai tab BP Aset (jadwal penyusutan & jurnal penyusutan otomatis).
 */
;(function () {
  globalThis.KDMP = globalThis.KDMP || {};
  KDMP.config = KDMP.config || {};
  KDMP.config.kategoriAset = {
    'Tanah': ['1.3.1.01', '', ''],
    'Bangunan': ['1.3.2.01', '1.3.9.01', '6.1.8.01'],
    'Peralatan dan Mesin': ['1.3.3.01', '1.3.9.02', '6.1.8.02'],
    'Meubelair': ['1.3.3.02', '1.3.9.03', '6.1.8.03'],
    'Rak': ['1.3.3.03', '1.3.9.03', '6.1.8.03'],
    'Inventaris': ['1.3.3.04', '1.3.9.05', '6.1.8.05'],
    'Kendaraan': ['1.3.4.01', '1.3.9.04', '6.1.8.04'],
    'Tabung Gas': ['1.3.5.01', '1.3.9.02', '6.1.8.02']
  };
})();
