/*
 * Pemetaan otomatis akun lawan -> Komponen Arus Kas, dipakai ketika baris kas/bank keluar
 * tidak diisi Komponen Arus Kas secara manual. Diperiksa berurutan: awalan pertama yang cocok menang.
 * null = akun diabaikan (tidak menghasilkan komponen otomatis).
 */
;(function () {
  globalThis.KDMP = globalThis.KDMP || {};
  KDMP.config = KDMP.config || {};
  KDMP.config.pemetaanArusKas = [
    ['1.1.4.', 'Pembelian Harga Pokok Barang'],
    ['5.', 'Pembelian Harga Pokok Barang'],
    ['2.1.3.', 'Pembelian Harga Pokok Barang'],
    ['6.1.9.09', 'Pembayaran Pajak'],
    ['9.3.', 'Pembayaran Pajak'],
    ['2.1.4.', 'Pembayaran Pajak'],
    ['6.1.4.', 'Pembayaran Beban Telepon'],
    ['2.1.6.', 'Pembayaran Beban Telepon'],
    ['6.2.', 'Pembayaran Beban Pemasaran'],
    ['6.1.8.', null],
    ['6.1.7.', null],
    ['6.1.', 'Pembayaran Beban Administrasi'],
    ['2.1.5.', 'Pembayaran Beban Administrasi'],
    ['9.2.', 'Pengeluaran Beban Lain-lain'],
    ['1.3.9.', null],
    ['1.3.', 'Pembelian Aset Tetap'],
    ['1.2.', 'Pengeluaran Investasi'],
    ['2.2.', 'Pembayaran Pinjaman Jangka Panjang'],
    ['2.1.2.', 'Pembagian SHU']
  ];
})();
