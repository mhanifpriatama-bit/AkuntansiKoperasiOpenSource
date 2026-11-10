/**
 * @license
 * KDMP Akuntansi - Configuration, Master COA & Templates Module
 */
import { S, B, $ } from './state.js';

export const MON = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export const CFG = {
  coa: [
    ["1.1.1.01","Kas Tunai","Debit"],["1.1.1.02","Kas di Bank BRI","Debit"],["1.1.1.03","Kas di Bank BRI a/n BKM","Debit"],
    ["1.1.1.04","Kas di Bank BRI a/n Koperasi","Debit"],["1.1.1.05","Kas di Bank BRI KDMP","Debit"],["1.1.1.06","Kas di Bank BPD","Debit"],
    ["1.1.1.07","Kas di Bank BDP KDMP","Debit"],["1.1.1.08","Kas Kecil (Petty Cash)","Debit"],["1.1.1.09","Deposito (< 3 bulan)","Debit"],
    ["1.1.2.01","Piutang Usaha","Debit"],["1.1.2.02","Piutang kepada Pegawai","Debit"],["1.1.2.03","Piutang Simpanan Pokok Anggota","Debit"],
    ["1.1.2.04","Piutang Simpanan Wajib Anggota","Debit"],["1.1.2.05","Piutang Anggota","Debit"],["1.1.2.06","Kredit Anggota","Debit"],
    ["1.1.3.01","Penyisihan Piutang Usaha Tak Tertagih","Kredit"],["1.1.3.02","Penyisihan Piutang kepada Pegawai Tak Tertagih","Kredit"],
    ["1.1.3.03","Penyisihan Piutang Simpanan Pokok Anggota Tak Tertagih","Kredit"],["1.1.3.04","Penyisihan Piutang Simpanan Wajib Anggota Tak Tertagih","Kredit"],
    ["1.1.3.05","Cadangan Kerugian Piutang (CRK)","Kredit"],["1.1.4.01","Persediaan Barang Dagangan","Debit"],["1.1.4.02","Persediaan Barang dari Bulog","Debit"],
    ["1.1.4.03","Persediaan Barang Gas","Debit"],["1.1.4.04","Persediaan Barang dari Intimart","Debit"],["1.1.4.05","Persediaan Barang dari Indogrosir","Debit"],
    ["1.1.4.06","Persediaan Barang dari RNI","Debit"],["1.1.4.07","Persediaan Barang dari UMKM","Debit"],["1.1.4.08","Persediaan Pupuk","Debit"],
    ["1.1.4.09","Persediaan PT Otsuka","Debit"],["1.1.4.10","Persediaan PT ArtaBoga","Debit"],["1.1.4.11","Persediaan ATK","Debit"],
    ["1.1.4.12","Persediaan Lainnya","Debit"],["1.1.4.13","Perlengkapan","Debit"],["1.1.5.01","Sewa Dibayar Dimuka","Debit"],
    ["1.1.5.02","Asuransi Dibayar Dimuka","Debit"],["1.1.5.03","PPh 25","Debit"],["1.1.5.04","PPN Masukan","Debit"],
    ["1.1.8.99","Aset Lancar Lainnya","Debit"],["1.1.9.01","RK Pusat","Debit"],["1.1.9.02","RK Unit Toko","Debit"],
    ["1.1.9.03","RK Pusat Unit Apotek","Debit"],["1.1.9.04","RK Unit Simpan Pinjam","Debit"],["1.1.9.05","RK Unit Klinik","Debit"],
    ["1.1.9.06","RK Unit Gudang","Debit"],["1.1.9.07","RK Unit Logistik","Debit"],["1.1.9.08","RK Piutang Gerai Sembako","Debit"],
    ["1.1.9.09","RK Piutang Gerai Klinik","Debit"],["1.1.9.10","RK Piutang Gerai Apotek","Debit"],["1.2.1.01","Investasi dalam Deposito","Debit"],
    ["1.2.1.99","Investasi Lainnya","Debit"],["1.3.1.01","Tanah","Debit"],["1.3.2.01","Gedung dan Bangunan","Debit"],
    ["1.3.3.01","Peralatan dan Mesin","Debit"],["1.3.3.02","Meubelair","Debit"],["1.3.3.03","Rak","Debit"],
    ["1.3.3.04","Inventaris","Debit"],["1.3.4.01","Kendaraan","Debit"],["1.3.5.01","Tabung Gas","Debit"],
    ["1.3.8.99","Aset Tetap Lainnya","Debit"],["1.3.9.01","Akumulasi Penyusutan Gedung dan Bangunan","Kredit"],
    ["1.3.9.02","Akumulasi Penyusutan Peralatan dan Mesin","Kredit"],["1.3.9.03","Akumulasi Penyusutan Meubelair","Kredit"],
    ["1.3.9.04","Akumulasi Penyusutan Kendaraan","Kredit"],["1.3.9.05","Akumulasi Penyusutan Inventaris","Kredit"],
    ["1.3.9.99","Akumulasi Penyusutan Aset Tetap Lainnya","Kredit"],["1.4.1.01","Software","Debit"],["1.4.2.01","Amortisasi Aset Tidak Berwujud","Kredit"],
    ["1.5.1.01","Investasi Jangka Panjang","Debit"],["1.9.1.99","Aset Lain-lain lainnya","Debit"],["2.1.1.01","Utang Simpanan Pokok","Kredit"],
    ["2.1.1.02","Utang Simpanan Wajib","Kredit"],["2.1.1.03","Utang Simpanan Sukarela","Kredit"],["2.1.1.04","Simpanan Anggota","Kredit"],
    ["2.1.1.05","Simpanan Masa Depan (Simapan)","Kredit"],["2.1.1.06","Dana Titipan Bagi Hasil Simpanan Anggota","Kredit"],
    ["2.1.1.07","Dana Titipan Simpanan Masa Depan","Kredit"],["2.1.2.01","Utang SHU","Kredit"],["2.1.2.02","Utang Dana Anggota Dibagi","Kredit"],
    ["2.1.2.03","Utang Cadangan Umum","Kredit"],["2.1.2.04","Utang Dana Pengurus dan Pengawas","Kredit"],["2.1.2.05","Utang Dana Karyawan","Kredit"],
    ["2.1.2.06","Utang Dana PAD","Kredit"],["2.1.2.07","Utang Dana Pendidikan","Kredit"],["2.1.2.08","Utang Dana Sosial","Kredit"],
    ["2.1.2.09","Dana Titipan SHU Anggota","Kredit"],["2.1.3.01","Utang Usaha","Kredit"],["2.1.3.02","Utang ke Intimart","Kredit"],
    ["2.1.3.03","Utang ke RNI","Kredit"],["2.1.3.04","Utang ke UMKM","Kredit"],["2.1.3.05","Utang ke PT Otsuka","Kredit"],
    ["2.1.3.06","Utang Dana Bergulir","Kredit"],["2.1.4.01","PPN Keluaran","Kredit"],["2.1.4.02","PPh 21","Kredit"],
    ["2.1.4.03","PPh 23","Kredit"],["2.1.4.04","PPh 29","Kredit"],["2.1.4.05","Utang Pajak SHU","Kredit"],
    ["2.1.5.01","Utang Gaji dan Tunjangan","Kredit"],["2.1.6.01","Utang Listrik","Kredit"],["2.1.6.02","Utang Telepon","Kredit"],
    ["2.1.6.99","Utang Utilitas Lainnya","Kredit"],["2.1.7.01","Pendapatan Sewa Diterima Dimuka","Kredit"],
    ["2.1.8.01","Utang kepada Pihak Ketiga Jk. Pendek","Kredit"],["2.1.8.99","Utang kepada Pihak Ketiga Jk. Pendek Lainnya","Kredit"],
    ["2.1.9.01","Utang ke USP","Kredit"],["2.1.9.02","Utang Beban YMH Dibayar","Kredit"],["2.1.9.03","Utang Pengurus KDMP Sinduadi","Kredit"],
    ["2.1.9.99","Utang Jangka Pendek Lainnya","Kredit"],["2.2.1.01","Utang ke Bank","Kredit"],["2.2.2.01","Utang kepada Pihak Ketiga Jk. Panjang","Kredit"],
    ["2.2.9.99","Utang Jangka Panjang Lainnya","Kredit"],["3.1.1.01","Simpanan Pokok","Kredit"],["3.1.2.01","Simpanan Wajib","Kredit"],
    ["3.1.3.01","Simpanan Sukarela","Kredit"],["3.1.4.01","Simpanan Hari Tua Pengurus dan Karyawan","Kredit"],
    ["3.1.5.01","Modal Awal","Kredit"],["3.1.6.01","Penyertaan Modal Desa","Kredit"],["3.2.1.01","Hibah","Kredit"],
    ["3.2.1.02","Modal Donasi/Sumbangan","Kredit"],["3.2.1.03","Modal Dana Hibah DAPM","Kredit"],["3.3.1.01","Dana Cadangan Umum","Kredit"],
    ["3.4.1.01","Sisa Hasil Usaha Belum Dibagikan","Kredit"],["3.9.1.01","Ikhtisar Laba Rugi","Kredit"],["3.9.1.02","Ikhtisar Sisa Hasil Usaha","Kredit"],
    ["4.1.1.01","Pendapatan Penjualan Barang Dagangan","Kredit"],["4.1.1.02","Pendapatan Komisi Konsinyasi","Kredit"],
    ["4.1.2.01","Pendapatan Penjualan Barang Jadi","Kredit"],["4.1.3.01","Pendapatan Jasa Dokter","Kredit"],
    ["4.1.3.02","Pendapatan Jasa Pinjaman","Kredit"],["4.1.3.03","Pendapatan Jasa Sewa","Kredit"],
    ["4.1.3.04","Pendapatan Jasa Pengiriman","Kredit"],["4.1.3.05","Pendapatan Administrasi","Kredit"],
    ["4.1.3.06","Pendapatan Jasa YMH Diterima","Kredit"],["4.1.3.07","Pendapatan BRI Link","Kredit"],
    ["4.1.3.08","Pendapatan Jasa Pinjaman","Kredit"],["4.1.9.01","Pendapatan Pelayanan Anggota Lainnya","Kredit"],
    ["4.1.9.02","Pendapatan Lainnya","Kredit"],["5.1.1.01","Harga Pokok Penjualan Barang Dagangan","Debit"],
    ["5.1.1.02","Harga Pokok Penjualan Barang Jadi","Debit"],["5.2.1.01","Harga Pokok Produksi","Debit"],
    ["6.1.1.01","Beban Gaji dan Tunjangan Pegawai","Debit"],["6.1.1.02","Beban Gaji dan Tunjangan Pengawas","Debit"],
    ["6.1.1.03","Beban Honor Lembur","Debit"],["6.1.1.04","Beban Insentif (Bonus)","Debit"],["6.1.1.05","Beban Komisi","Debit"],
    ["6.1.1.06","Beban Seragam Pegawai","Debit"],["6.1.1.07","Beban Penguatan SDM","Debit"],["6.1.1.08","Beban Honorarium Pengurus","Debit"],
    ["6.1.1.09","Beban Honorarium Pengawas","Debit"],["6.1.1.99","Beban Pegawai Lainnya","Debit"],["6.1.2.01","Beban ATK","Debit"],
    ["6.1.2.02","Beban Foto Copy","Debit"],["6.1.2.03","Beban Konsumsi Rapat","Debit"],["6.1.2.04","Beban Cetak dan Dekorasi","Debit"],
    ["6.1.2.05","Beban Ongkos Kirim","Debit"],["6.1.2.99","Beban Perlengkapan Lainnya","Debit"],["6.1.3.01","Beban Pemeliharaan dan Perbaikan","Debit"],
    ["6.1.4.01","Beban Listrik","Debit"],["6.1.4.02","Beban Telepon dan Internet","Debit"],["6.1.4.99","Beban Utilitas Lainnya","Debit"],
    ["6.1.5.01","Beban Sewa","Debit"],["6.1.5.02","Beban Asuransi","Debit"],["6.1.6.01","Beban Keamanan","Debit"],
    ["6.1.6.02","Beban Kebersihan","Debit"],["6.1.7.01","Beban Penyisihan Piutang Tak Tertagih","Debit"],
    ["6.1.8.01","Beban Penyusutan Gedung dan Bangunan","Debit"],["6.1.8.02","Beban Penyusutan Peralatan dan Mesin","Debit"],
    ["6.1.8.03","Beban Penyusutan Meubelair","Debit"],["6.1.8.04","Beban Penyusutan Kendaraan","Debit"],
    ["6.1.8.05","Beban Penyusutan Inventaris","Debit"],["6.1.8.06","Beban Amortisasi Aset Tak Berwujud","Debit"],
    ["6.1.9.01","Beban Parkir","Debit"],["6.1.9.02","Beban Laundry","Debit"],["6.1.9.03","Beban Pendamping","Debit"],
    ["6.1.9.04","Beban Pengawas","Debit"],["6.1.9.05","Beban Audit","Debit"],["6.1.9.06","Beban Perjalanan Dinas","Debit"],
    ["6.1.9.07","Beban Transportasi","Debit"],["6.1.9.08","Beban Jamuan Tamu","Debit"],["6.1.9.09","Beban Pajak","Debit"],
    ["6.1.9.10","Beban Lain-Lain","Debit"],["6.1.9.11","Beban Iuran Pupuk","Debit"],["6.1.9.12","Beban Kerugian Penjualan","Debit"],
    ["6.1.9.13","Beban Operasional","Debit"],["6.1.9.14","Beban RAT","Debit"],["6.1.9.15","Beban Musyawarah","Debit"],
    ["6.1.9.16","Beban Notaris","Debit"],["6.1.9.17","Beban Jasa Simpanan Wajib","Debit"],["6.1.9.18","Beban Jasa Simpanan Sukarela","Debit"],
    ["6.1.9.19","Beban Jasa Simpanan Anggota","Debit"],["6.1.9.20","Beban Jasa Simp. Masa Depan","Debit"],
    ["6.1.9.21","Beban Administrasi BRI Link","Debit"],["6.1.9.22","Beban Administrasi dan Umum Lainnya","Debit"],
    ["6.2.1.01","Beban Gaji dan Tunjangan Bag. Pemasaran","Debit"],["6.2.2.01","Beban Iklan","Debit"],
    ["6.2.2.02","Beban Promosi","Debit"],["6.2.2.03","Beban Dana Sosial","Debit"],["6.2.2.04","Beban Promosi Ekonomi Anggota (PEA)","Debit"],
    ["6.2.3.99","Beban Pemasaran Lainnya","Debit"],["9.1.1.01","Pendapatan Bunga","Kredit"],["9.1.2.01","Pendapatan Sewa","Kredit"],
    ["9.1.3.01","Pendapatan Denda","Kredit"],["9.1.4.01","Pendapatan Iklan","Kredit"],["9.1.9.99","Pendapatan Lain-lain lainnya","Kredit"],
    ["9.2.1.01","Beban Administrasi Bank","Debit"],["9.2.2.01","Beban Bunga","Debit"],["9.2.3.01","Beban Sewa","Debit"],
    ["9.2.9.99","Beban Lain-lain lainnya","Debit"],["9.3.1.01","Beban Pajak Bunga Bank","Debit"],["9.3.1.02","Beban Pajak Reklame","Debit"],
    ["9.3.1.03","Beban PPh 21","Debit"],["9.3.1.04","Beban PPh 23","Debit"],["9.3.1.05","Beban PPh 25","Debit"],
    ["9.3.1.06","Beban PPh 29","Debit"],["9.3.1.07","Beban PPh Final","Debit"],["9.3.1.08","Beban PPh Koperasi","Debit"],
    ["9.3.1.99","Beban Pajak Lainnya","Debit"]
  ],
  kom: [
    "Penerimaan Kas dari Pelayanan kepada Anggota","Penerimaan Kas dari Non Anggota","Penerimaan Pendapatan Lain-lain",
    "Pembelian Harga Pokok Barang","Pembayaran Beban Administrasi","Pembayaran Beban Pemasaran","Pengeluaran Beban Lain-lain",
    "Pembayaran Beban Telepon","Pembayaran Pajak","Penjualan Aset Tetap","Penjualan Investasi","Pembelian Aset Tetap",
    "Pengeluaran Investasi","Simpanan Anggota","Simpanan Lainnya","Hibah","Pinjaman Jangka Panjang","Pinjaman Jangka Pendek",
    "Pembayaran Pinjaman Jangka Panjang","Pembayaran Pinjaman Jangka Pendek","Pembagian SHU"
  ],
  lak: [
    [1,"ARUS KAS DARI AKTIVITAS OPERASI","h",null],[2,"Arus Kas Masuk","h",null],
    [3,"Penerimaan Kas dari Pelayanan kepada Anggota","c",null],[3,"Penerimaan Kas dari Non Anggota","c",null],[3,"Penerimaan Pendapatan Lain-lain","c",null],
    [0,"Jumlah arus kas masuk dari aktivitas operasi","s",[15,17]],[2,"Arus Kas Keluar","h",null],
    [3,"Pembelian Harga Pokok Barang","c",null],[3,"Pembayaran Beban Administrasi","c",null],[3,"Pembayaran Beban Pemasaran","c",null],
    [3,"Pengeluaran Beban Lain-lain","c",null],[3,"Pembayaran Beban Telepon","c",null],[3,"Pembayaran Pajak","c",null],
    [0,"Jumlah arus kas keluar dari aktivitas operasi","s",[20,25]],[0,"Arus kas bersih dari aktivitas operasi","x","=E26+E18"],[0,"","e",null],
    [1,"ARUS KAS DARI AKTIVITAS INVESTASI","h",null],[2,"Arus Kas Masuk","h",null],[3,"Penjualan Aset Tetap","c",null],[3,"Penjualan Investasi","c",null],
    [0,"Jumlah arus kas masuk dari aktivitas Investasi","s",[31,32]],[2,"Arus Kas Keluar","h",null],[3,"Pembelian Aset Tetap","c",null],
    [3,"Pengeluaran Investasi","c",null],[0,"Jumlah arus kas keluar dari aktivitas Investasi","s",[35,36]],
    [0,"Arus kas bersih dari aktivitas Investasi","x","=E37+E33"],[0,"","e",null],[1,"ARUS KAS DARI AKTIVITAS PENDANAAN","h",null],
    [2,"Arus Kas Masuk","h",null],[3,"Simpanan Anggota","c",null],[3,"Simpanan Lainnya","c",null],[3,"Hibah","c",null],
    [3,"Pinjaman Jangka Panjang","c",null],[3,"Pinjaman Jangka Pendek","c",null],[0,"Jumlah arus kas masuk dari aktivitas Pendanaan","s",[42,46]],
    [2,"Arus Kas Keluar","h",null],[3,"Pembayaran Pinjaman Jangka Panjang","c",null],[3,"Pembayaran Pinjaman Jangka Pendek","c",null],
    [3,"Pembagian SHU","c",null],[0,"Jumlah arus kas keluar dari aktivitas Pendanaan","s",[49,51]],
    [0,"Arus kas bersih dari aktivitas Pendanaan","x","=E52+E47"],[0,"","e",null],[1,"Kenaikan (penurunan) Kas","x1","=E53+E38+E27"],
    [1,"Saldo kas awal tahun","open",null],[1,"Saldo kas akhir periode","x1","=SUM(E55:E56)"]
  ],
  U: {
    USP: {
      name: "Unit Simpan Pinjam", color: "#C55A11",
      LPK: [
        ["H",1,"ASET"],["H",2,"Aset Lancar"],["B"],["A","1.1.1.01","Kas"],["A","1.1.1.06","Bank BPD KDMP"],["A","1.1.1.02","Bank BRI KDMP"],
        ["A","1.1.9.08","RK Piutang Gerai Sembako"],["A","1.1.9.09","RK Piutang Gerai Klinik"],["A","1.1.9.10","RK Piutang Gerai Apotek"],
        ["A","1.1.2.06","Kredit Anggota Koperasi"],["A","1.1.3.05","CRK (Cadangan Kerugian Piutang)"],["O","Aset lancar lainnya",["1.1."],[],null,false],
        ["S","tot_al","Total Aset Lancar"],["H",2,"Aset Tetap"],["B"],["A","1.3.3.04","Inventaris"],["A","1.3.9.05","Akumulasi Penyusutan Inventaris"],
        ["O","Aset tetap lainnya (akun lain)",["1.3."],[],null,false],["S","tot_at","Total Aset Tetap"],["H",2,"Aset Lain-lain"],["B"],
        ["O","Aset lain-lain lainnya",["1.2.","1.4.","1.5.","1.9."],[],null,false],["S","aset_lain","Total Aset Lain-lain"],
        ["T","tot_aset","JUMLAH AKTIVA","[tot_al]+[tot_at]+[aset_lain]"],["H",1,"KEWAJIBAN & EKUITAS"],["H",2,"Kewajiban Jangka Pendek"],["B"],
        ["A","2.1.2.02","Dana Anggota Dibagi"],["A","2.1.2.04","Dana Pengurus & Pengawas"],["A","2.1.2.05","Dana Karyawan"],["A","2.1.2.07","Dana Pendidikan"],
        ["A","2.1.2.06","Dana PAD"],["A","2.1.2.08","Dana Sosial"],["A","2.1.1.03","Simpanan Sukarela"],["A","2.1.1.05","Simpanan Masa Depan (Simapan)"],
        ["A","2.1.4.02","Hutang Pajak PPh 21"],["A","2.1.4.05","Hutang Pajak SHU Anggota"],["A","2.1.1.06","Dana Titipan Bagi Hasil Simp. Anggota"],
        ["A","2.1.2.09","Dana Titipan SHU Anggota"],["A","2.1.1.07","Dana Titipan Simpanan Masa Depan"],["A","2.1.1.04","Simpanan Anggota"],
        ["A","2.1.9.02","Beban YMH Dibayar"],["O","Kewajiban jangka pendek lainnya",["2.1."],[],null,false],["S","tot_kjp","Total Kewajiban Jangka Pendek"],
        ["H",2,"Kewajiban Jangka Panjang"],["B"],["A","2.2.2.01","Hutang Pihak ke 3 (Dinas Koperasi)"],["A","3.1.4.01","Simp. Hari Tua Pengurus & Karyawan"],
        ["O","Kewajiban jangka panjang lainnya",["2.2."],[],null,false],["S","tot_kjpj","Total Kewajiban Jangka Panjang"],["T","tot_kew","TOTAL KEWAJIBAN","[tot_kjp]+[tot_kjpj]"],
        ["H",2,"Ekuitas"],["B"],["A","3.1.5.01","Modal Awal"],["A","3.1.1.01","Simpanan Pokok"],["A","3.1.2.01","Simpanan Wajib"],["A","3.1.3.01","Simpanan Sukarela"],
        ["A","3.3.1.01","Dana Cadangan Umum"],["A","3.2.1.03","Dana Hibah DAPM"],["O","Ekuitas lainnya",["3."],["3.1.4.01"],null,false],["S","tot_eku","Total Ekuitas"],
        ["L","laba","=LABA","laba"],["L","pot","Potongan Pajak 11%","9.3.1.08"],["L","lb","Laba Bersih Setelah Pajak","shu_final"],["T","tot_ke","JUMLAH KEWAJIBAN & EKUITAS","[tot_kew]+[tot_eku]+[lb]"]
      ],
      LR: [
        ["H",1,"PENDAPATAN"],["B"],["A","4.1.3.05","Pendapatan Administrasi"],["A","4.1.3.02","Pendapatan Jasa Pinjaman"],
        ["A","9.1.9.99","Pendapatan Lain2 Non Operasional"],["A","9.1.1.01","Pendapatan Bunga Bank"],["A","4.1.3.07","Pendapatan BRI Link"],
        ["A","4.1.3.06","Pendapatan Jasa YMH Diterima"],["O","Pendapatan lainnya",["4.","7.","9.1."],[],null,false],["S","tot_pend","Jumlah Pendapatan"],
        ["H",1,"BIAYA"],["B"],["A","6.1.1.01","Gaji & Tunjangan Pegawai"],["A","6.1.1.08","Honor Pengurus"],["A","6.1.9.07","Biaya Transport"],
        ["A","6.1.9.15","Biaya Musyawarah"],["A","6.1.1.09","Honor Pengawas"],["A","6.1.9.14","Biaya RAT"],["A","6.1.9.05","Biaya Audit KAP"],
        ["A","9.2.1.01","Biaya Administrasi Bank"],["A","6.1.9.17","Biaya Jasa Simpanan Wajib"],["A","6.1.9.18","Biaya Jasa Simpanan Sukarela"],
        ["A","6.1.9.21","Biaya Administrasi BRI Link"],["A","6.1.9.19","Biaya Jasa Simpanan Anggota"],["A","6.1.9.20","Biaya Jasa Simp. Masa Depan"],
        ["A","6.1.9.06","Biaya Perjalanan Dinas"],["A","6.1.9.22","Biaya Beban Umum"],["A","6.1.8.05","Biaya Penyusutan Inventaris"],
        ["A","6.1.9.16","Biaya Notaris"],["A","9.3.1.06","Biaya Pajak Badan"],["A","9.2.2.01","Biaya Bunga Dana Chanelling"],
        ["A","6.2.2.04","Biaya Promosi Ekonomi Anggota (PEA)"],["O","Biaya lainnya",["5.","6.","8.","9.2.","9.3."],["9.3.1.08"],null,false],
        ["S","tot_biaya","Jumlah Biaya"],["T","laba","=\"Laba s/d \"&UPPER(INDEX(bulan_list,bulan_lap))&\" \"&YEAR(tgl_lap)","[tot_pend]-[tot_biaya]"],
        ["A","9.3.1.08","Potongan Pajak 11%"],["T","shu_final","Laba Bersih Setelah Pajak","[laba]-[9.3.1.08]"]
      ]
    },
    Sembako: {
      name: "Unit Sembako, Pupuk dan Gas", color: "#2E7D32",
      LPK: [
        ["H",1,"ASET"],["H",2,"Aset Lancar"],["B"],["A","1.1.1.01","Kas Tunai"],["A","1.1.1.06","Kas di Bank BPD"],["A","1.1.1.02","Kas di Bank BRI"],
        ["A","1.1.2.01","Piutang Usaha"],["A","1.1.4.02","Persediaan Barang dari Bulog"],["A","1.1.4.03","Persediaan Barang Gas"],
        ["A","1.1.4.04","Persediaan Barang dari Intimart"],["A","1.1.4.05","Persediaan Barang dari Indogrosir"],["A","1.1.4.06","Persediaan Barang dari RNI"],
        ["A","1.1.4.07","Persediaan Barang dari UMKM"],["A","1.1.4.12","Persediaan Lainnya"],["A","1.1.4.11","Alat Tulis Kantor (ATK)"],
        ["A","1.1.4.08","Persediaan Pupuk"],["A","1.1.4.09","Persediaan PT Otsuka"],["A","1.1.4.10","Persediaan PT ArtaBoga"],
        ["O","Aset lancar lainnya",["1.1."],[],null,false],["S","tot_al","Total Aset Lancar"],["H",2,"Aset Tetap"],["B"],
        ["A","1.3.2.01","Bangunan"],["A","1.3.3.01","Peralatan dan Mesin"],["A","1.3.3.02","Meubelair"],["A","1.3.3.03","Rak"],
        ["A","1.3.9.01","Akumulasi Penyusutan Bangunan"],["A","1.3.9.02","Akumulasi Penyusutan Peralatan dan Mesin"],
        ["A","1.3.9.03","Akumulasi Penyusutan Meubelair"],["A","1.3.8.99","Aset Tetap Lainnya"],["A","1.3.5.01","Tabung Gas"],
        ["O","Aset tetap lainnya (akun lain)",["1.3."],[],null,false],["S","tot_at","Total Aset Tetap"],["H",2,"Aset Lain-lain"],["B"],
        ["O","Aset lain-lain lainnya",["1.2.","1.4.","1.5.","1.9."],[],null,false],["S","aset_lain","Total Aset Lain-lain"],
        ["T","tot_aset","TOTAL ASET","[tot_al]+[tot_at]+[aset_lain]"],["H",1,"KEWAJIBAN"],["H",2,"Kewajiban Jangka Pendek"],["B"],
        ["A","2.1.9.01","Utang ke USP"],["A","2.1.3.02","Utang ke Intimart"],["A","2.1.3.03","Utang ke RNI"],["A","2.1.3.04","Utang ke UMKM"],
        ["A","2.2.1.01","Utang Ke Bank"],["A","2.1.8.01","Utang Pihak Ke 3"],["A","2.1.3.05","Utang PT Otsuka"],["A","2.1.9.02","Utang Beban YMH"],
        ["A","2.1.2.02","Utang Dana Anggota Dibagi"],["A","2.1.2.03","Utang Cadangan Umum"],["A","2.1.2.04","Utang Dana Pengurus Dan Pengawas"],
        ["A","2.1.2.05","Utang Dana Karyawan"],["A","2.1.2.06","Utang Dana PAD"],["A","2.1.2.07","Utang Dana Pendidikan"],
        ["A","2.1.2.08","Utang Dana Sosial"],["A","2.1.9.03","Utang Pengurus KDMP Sinduadi"],["O","Kewajiban jangka pendek lainnya",["2.1."],[],null,false],
        ["S","tot_kjp","Total Kewajiban Jangka Pendek"],["H",2,"Kewajiban Jangka Panjang"],["B"],
        ["O","Kewajiban jangka panjang lainnya",["2.2."],["2.2.1.01"],null,false],["S","kjpj","Total Kewajiban Jangka Panjang"],
        ["T","tot_kew","TOTAL KEWAJIBAN","[tot_kjp]+[kjpj]"],["H",1,"EKUITAS"],["B"],["A","3.1.6.01","Penyertaan Modal Desa"],
        ["A","3.2.1.02","Modal Donasi/Sumbangan"],["A","3.9.1.01","Ikhtisar Laba Rugi (periode yang telah ditutup)"],
        ["L","shu_brj","Ikhtisar Laba Rugi (laba berjalan s.d. bulan ini)","shu_final"],["O","Ekuitas lainnya",["3."],[],null,false],
        ["S","tot_eku","TOTAL EKUITAS"],["T","tot_ke","TOTAL KEWAJIBAN DAN EKUITAS","[tot_kew]+[tot_eku]"]
      ],
      LR: [
        ["H",1,"PENDAPATAN USAHA"],["H",2,"Pendapatan Jasa"],["B"],["A","4.1.1.01","Pendapatan Penjualan Barang Dagangan"],
        ["A","4.1.9.02","Pendapatan Lainnya"],["O","Pendapatan usaha lainnya",["4."],[],null,false],["S","tot_pend","Total Pendapatan"],
        ["H",1,"HARGA POKOK PEMBELIAN"],["H",2,"Harga Pokok Pembelian Barang Dagangan"],["B"],["A","5.1.1.01","Harga Beli Persediaan"],
        ["O","Harga pokok lainnya",["5."],[],null,false],["S","tot_hpp","Total Harga Pokok Pembelian"],["T","laba_kotor","Laba (Rugi) Kotor","[tot_pend]-[tot_hpp]"],
        ["H",1,"BEBAN-BEBAN USAHA"],["H",2,"Beban Administrasi dan Umum"],["B"],["A","6.1.8.01","Beban Penyusutan Bangunan"],
        ["A","6.1.8.02","Beban Penyusutan Peralatan dan Mesin"],["A","6.1.8.03","Beban Penyusutan Meja dan Kursi"],
        ["A","6.1.9.09","Beban Pajak"],["A","6.1.9.10","Beban Lain-Lain"],["A","9.2.1.01","Beban Administrasi Bank"],
        ["A","6.1.9.11","Beban Iuran Pupuk"],["A","6.1.4.01","Beban Listrik"],["A","6.1.9.12","Beban Kerugian Penjualan"],
        ["A","6.1.9.13","Beban Operasional"],["A","6.1.9.14","Beban RAT"],["A","9.2.2.01","Beban Bunga Pinjaman"],
        ["O","Beban usaha lainnya",["6."],[],null,false],["S","tot_beban","Total Beban-Beban"],["T","laba_op","LABA (RUGI) OPERASI","[laba_kotor]-[tot_beban]"],
        ["H",2,"Pendapatan Lain-lain"],["B"],["O","Pendapatan lain-lain lainnya",["7.","9.1."],[],null,false],["S","pl","Total Pendapatan Lain-lain"],
        ["H",2,"Beban Lain-lain"],["B"],["O","Beban lain-lain lainnya",["8.","9.2."],["9.2.1.01","9.2.2.01"],null,false],
        ["S","bl","Total Beban Lain-lain"],["H",2,"Beban Pajak"],["B"],["O","Beban pajak lainnya",["9.3."],[],null,false],
        ["S","pjk","Total Beban Pajak"],["T","shu_final","LABA (RUGI) BERSIH","[laba_op]+[pl]-[bl]-[pjk]"]
      ]
    },
    KON: {
      name: "Konsolidasi Unit Usaha (USP dan Sembako)", color: "#5B2C83",
      LPK: [
        ["H",1,"ASET"],["H",2,"Aset Lancar"],["B"],["A","1.1.1.01","Kas Tunai"],["A","1.1.1.06","Kas di Bank BPD"],["A","1.1.1.02","Kas di Bank BRI"],
        ["A","1.1.2.01","Piutang Usaha"],["A","1.1.2.06","Kredit Anggota Koperasi"],["A","1.1.3.05","CRK (Cadangan Kerugian Piutang)"],
        ["A","1.1.9.08","RK Piutang Gerai Sembako"],["A","1.1.9.09","RK Piutang Gerai Klinik"],["A","1.1.9.10","RK Piutang Gerai Apotek"],
        ["A","1.1.4.02","Persediaan Barang dari Bulog"],["A","1.1.4.03","Persediaan Barang Gas"],["A","1.1.4.04","Persediaan Barang dari Intimart"],
        ["A","1.1.4.05","Persediaan Barang dari Indogrosir"],["A","1.1.4.06","Persediaan Barang dari RNI"],["A","1.1.4.07","Persediaan Barang dari UMKM"],
        ["A","1.1.4.12","Persediaan Lainnya"],["A","1.1.4.11","Alat Tulis Kantor (ATK)"],["A","1.1.4.08","Persediaan Pupuk"],
        ["A","1.1.4.09","Persediaan PT Otsuka"],["A","1.1.4.10","Persediaan PT ArtaBoga"],["O","Aset lancar lainnya",["1.1."],[],null,false],
        ["S","tot_al","Total Aset Lancar"],["H",2,"Aset Tetap"],["B"],["A","1.3.2.01","Bangunan"],["A","1.3.3.01","Peralatan dan Mesin"],
        ["A","1.3.3.02","Meubelair"],["A","1.3.3.03","Rak"],["A","1.3.3.04","Inventaris"],["A","1.3.4.01","Kendaraan"],
        ["A","1.3.5.01","Tabung Gas"],["A","1.3.8.99","Aset Tetap Lainnya"],["A","1.3.9.01","Akumulasi Penyusutan Bangunan"],
        ["A","1.3.9.02","Akumulasi Penyusutan Peralatan dan Mesin"],["A","1.3.9.03","Akumulasi Penyusutan Meubelair"],
        ["A","1.3.9.05","Akumulasi Penyusutan Inventaris"],["A","1.3.9.04","Akumulasi Penyusutan Kendaraan"],
        ["O","Aset tetap lainnya (akun lain)",["1.3."],[],null,false],["S","tot_at","Total Aset Tetap"],["H",2,"Aset Lain-lain"],["B"],
        ["O","Aset lain-lain lainnya",["1.2.","1.4.","1.5.","1.9."],[],null,false],["S","aset_lain","Total Aset Lain-lain"],
        ["T","tot_aset","TOTAL ASET","[tot_al]+[tot_at]+[aset_lain]"],["H",1,"KEWAJIBAN"],["H",2,"Kewajiban Jangka Pendek"],["B"],
        ["A","2.1.1.04","Simpanan Anggota"],["A","2.1.1.03","Simpanan Sukarela"],["A","2.1.1.05","Simpanan Masa Depan (Simapan)"],
        ["A","2.1.1.06","Dana Titipan Bagi Hasil Simp. Anggota"],["A","2.1.1.07","Dana Titipan Simpanan Masa Depan"],
        ["A","2.1.2.02","Utang Dana Anggota Dibagi"],["A","2.1.2.03","Utang Cadangan Umum"],["A","2.1.2.04","Utang Dana Pengurus Dan Pengawas"],
        ["A","2.1.2.05","Utang Dana Karyawan"],["A","2.1.2.06","Utang Dana PAD"],["A","2.1.2.07","Utang Dana Pendidikan"],
        ["A","2.1.2.08","Utang Dana Sosial"],["A","2.1.2.09","Dana Titipan SHU Anggota"],["A","2.1.3.01","Utang Usaha"],
        ["A","2.1.3.02","Utang ke Intimart"],["A","2.1.3.03","Utang ke RNI"],["A","2.1.3.04","Utang ke UMKM"],
        ["A","2.1.3.05","Utang PT Otsuka"],["A","2.1.4.02","Hutang Pajak PPh 21"],["A","2.1.4.05","Hutang Pajak SHU Anggota"],
        ["A","2.1.5.01","Utang Gaji dan Tunjangan"],["A","2.1.6.01","Utang Listrik"],["A","2.1.8.01","Utang Pihak Ke 3 (Jangka Pendek)"],
        ["A","2.1.9.01","Utang ke USP"],["A","2.1.9.02","Utang Beban YMH"],["A","2.1.9.03","Utang Pengurus KDMP Sinduadi"],
        ["O","Kewajiban jangka pendek lainnya",["2.1."],[],null,false],["S","tot_kjp","Total Kewajiban Jangka Pendek"],
        ["H",2,"Kewajiban Jangka Panjang"],["B"],["A","2.2.1.01","Utang Ke Bank"],["A","2.2.2.01","Hutang Pihak ke 3 (Dinas Koperasi)"],
        ["O","Kewajiban jangka panjang lainnya",["2.2."],[],null,false],["S","tot_kjpj","Total Kewajiban Jangka Panjang"],
        ["T","tot_kew","TOTAL KEWAJIBAN","[tot_kjp]+[tot_kjpj]"],["H",1,"EKUITAS"],["B"],["A","3.1.5.01","Modal Awal"],
        ["A","3.1.6.01","Penyertaan Modal Desa"],["A","3.1.1.01","Simpanan Pokok"],["A","3.1.2.01","Simpanan Wajib"],
        ["A","3.1.3.01","Simpanan Sukarela"],["A","3.1.4.01","Simp. Hari Tua Pengurus & Karyawan"],["A","3.2.1.01","Hibah"],
        ["A","3.2.1.02","Modal Donasi/Sumbangan"],["A","3.2.1.03","Dana Hibah DAPM"],["A","3.3.1.01","Dana Cadangan Umum"],
        ["A","3.9.1.01","Ikhtisar Laba Rugi (periode yang telah ditutup)"],["L","shu_brj","Laba (Rugi) Berjalan s.d. bulan ini","shu_final"],
        ["O","Ekuitas lainnya",["3."],[],null,false],["S","tot_eku","TOTAL EKUITAS"],["T","tot_ke","TOTAL KEWAJIBAN DAN EKUITAS","[tot_kew]+[tot_eku]"]
      ],
      LR: [
        ["H",1,"PENDAPATAN USAHA"],["B"],["A","4.1.1.01","Pendapatan Penjualan Barang Dagangan"],["A","4.1.3.02","Pendapatan Jasa Pinjaman"],
        ["A","4.1.3.05","Pendapatan Administrasi"],["A","4.1.3.07","Pendapatan BRI Link"],["A","4.1.3.06","Pendapatan Jasa YMH Diterima"],
        ["A","4.1.9.02","Pendapatan Lainnya"],["O","Pendapatan usaha lainnya",["4."],[],null,false],["S","tot_pend","Total Pendapatan"],
        ["H",1,"HARGA POKOK PEMBELIAN"],["B"],["A","5.1.1.01","Harga Beli Persediaan"],["O","Harga pokok lainnya",["5."],[],null,false],
        ["S","tot_hpp","Total Harga Pokok Pembelian"],["T","laba_kotor","Laba (Rugi) Kotor","[tot_pend]-[tot_hpp]"],
        ["H",1,"BEBAN-BEBAN USAHA"],["B"],["A","6.1.1.01","Gaji & Tunjangan Pegawai"],["A","6.1.1.08","Honor Pengurus"],
        ["A","6.1.1.09","Honor Pengawas"],["A","6.1.4.01","Beban Listrik"],["A","6.1.9.07","Biaya Transport"],["A","6.1.9.15","Biaya Musyawarah"],
        ["A","6.1.9.14","Beban RAT"],["A","6.1.9.05","Biaya Audit KAP"],["A","6.1.9.17","Biaya Jasa Simpanan Wajib"],
        ["A","6.1.9.18","Biaya Jasa Simpanan Sukarela"],["A","6.1.9.19","Biaya Jasa Simpanan Anggota"],["A","6.1.9.20","Biaya Jasa Simp. Masa Depan"],
        ["A","6.1.9.21","Biaya Administrasi BRI Link"],["A","6.1.9.06","Biaya Perjalanan Dinas"],["A","6.1.9.22","Biaya Beban Umum"],
        ["A","6.1.9.16","Biaya Notaris"],["A","6.1.8.01","Beban Penyusutan Bangunan"],["A","6.1.8.02","Beban Penyusutan Peralatan dan Mesin"],
        ["A","6.1.8.03","Beban Penyusutan Meja dan Kursi"],["A","6.1.8.05","Biaya Penyusutan Inventaris"],["A","6.1.9.09","Beban Pajak"],
        ["A","6.1.9.10","Beban Lain-Lain"],["A","6.1.9.11","Beban Iuran Pupuk"],["A","6.1.9.12","Beban Kerugian Penjualan"],
        ["A","6.1.9.13","Beban Operasional"],["A","6.2.2.04","Biaya Promosi Ekonomi Anggota (PEA)"],["O","Beban usaha lainnya",["6."],[],null,false],
        ["S","tot_beban","Total Beban-Beban Usaha"],["T","laba_op","LABA (RUGI) OPERASI","[laba_kotor]-[tot_beban]"],
        ["H",1,"PENDAPATAN DAN BEBAN LAIN-LAIN"],["B"],["A","9.1.1.01","Pendapatan Bunga Bank"],["A","9.1.9.99","Pendapatan Lain2 Non Operasional"],
        ["O","Pendapatan lain-lain lainnya",["7.","9.1."],[],null,false],["S","tot_pl","Total Pendapatan Lain-lain"],["B"],
        ["A","9.2.1.01","Beban Administrasi Bank"],["A","9.2.2.01","Beban Bunga Pinjaman / Bunga Dana Chanelling"],
        ["O","Beban lain-lain lainnya",["8.","9.2."],[],null,false],["S","tot_bl","Total Beban Lain-lain"],["B"],
        ["A","9.3.1.06","Biaya Pajak Badan"],["A","9.3.1.08","Potongan Pajak 11%"],["O","Beban pajak lainnya",["9.3."],[],null,false],
        ["S","tot_pjk","Total Beban Pajak"],["T","shu_final","LABA (RUGI) BERSIH","[laba_op]+[tot_pl]-[tot_bl]-[tot_pjk]"]
      ]
    }
  }
};

export const NM = {};
export let COA = CFG.coa;
export const COA0 = JSON.parse(JSON.stringify(CFG.coa));
COA.forEach(a => NM[a[0]] = a[2]);

export const OLDC = ["1.1.1.01", "1.1.1.02", "1.1.1.03", "1.1.1.04", "1.1.1.05", "1.1.1.06", "1.1.1.07", "1.1.1.08", "1.1.1.09", "1.1.1.10", "1.1.1.11", "1.1.2.01", "1.1.2.02", "1.1.2.03", "1.1.2.04", "1.1.2.05", "1.1.2.06", "1.1.3.01", "1.1.3.02", "1.1.3.03", "1.1.3.04", "1.1.3.05", "1.1.4.01", "1.1.4.02", "1.1.4.03", "1.1.4.04", "1.1.4.05", "1.1.4.06", "1.1.4.07", "1.1.4.08", "1.1.4.09", "1.1.4.10", "1.1.4.11", "1.1.4.12", "1.1.4.13", "1.1.5.01", "1.1.5.02", "1.1.5.03", "1.1.5.04", "1.1.8.99", "1.1.9.01", "1.1.9.02", "1.1.9.03", "1.1.9.04", "1.1.9.05", "1.1.9.06", "1.1.9.07", "1.1.9.08", "1.1.9.09", "1.1.9.10", "1.2.1.01", "1.2.1.99", "1.3.1.01", "1.3.2.01", "1.3.3.01", "1.3.3.02", "1.3.3.03", "1.3.3.04", "1.3.4.01", "1.3.5.01", "1.3.5.02", "1.3.5.03", "1.3.5.04", "1.3.5.05", "1.3.9.01", "1.3.9.99", "1.4.1.01", "1.4.2.01", "1.5.1.01", "1.9.1.99", "2.1.1.01", "2.1.1.02", "2.1.1.03", "2.1.1.04", "2.1.1.05", "2.1.1.06", "2.1.1.07", "2.1.2.01", "2.1.2.02", "2.1.2.03", "2.1.2.04", "2.1.2.05", "2.1.2.06", "2.1.2.07", "2.1.2.08", "2.1.2.09", "2.1.3.01", "2.1.3.02", "2.1.3.03", "2.1.3.04", "2.1.3.05", "2.1.3.06", "2.1.4.01", "2.1.4.02", "2.1.4.03", "2.1.4.04", "2.1.4.05", "2.1.5.01", "2.1.6.01", "2.1.6.02", "2.1.6.99", "2.1.7.01", "2.1.8.01", "2.1.8.99", "2.1.9.01", "2.1.9.02", "2.1.9.03", "2.1.9.99", "2.2.1.01", "2.2.2.01", "2.2.9.99", "3.1.1.01", "3.1.2.01", "3.1.3.01", "3.1.4.01", "3.1.5.01", "3.1.6.01", "3.2.1.01", "3.2.1.02", "3.2.1.03", "3.3.1.01", "3.4.1.01", "3.9.1.01", "3.9.1.02", "4.1.1.01", "4.1.1.02", "4.1.2.01", "4.1.3.01", "4.1.3.02", "4.1.3.03", "4.1.3.04", "4.1.3.05", "4.1.3.06", "4.1.3.07", "4.1.3.08", "4.1.9.01", "4.1.9.02", "4.2.1.01", "4.2.2.01", "4.2.3.01", "4.2.3.02", "4.2.3.03", "4.2.3.04", "4.2.9.01", "5.1.1.01", "5.1.1.02", "5.2.1.01", "6.1.1.01", "6.1.1.02", "6.1.1.03", "6.1.1.04", "6.1.1.05", "6.1.1.06", "6.1.1.07", "6.1.1.08", "6.1.1.09", "6.1.1.99", "6.1.2.01", "6.1.2.02", "6.1.2.03", "6.1.2.04", "6.1.2.05", "6.1.2.06", "6.1.2.99", "6.1.3.01", "6.1.4.01", "6.1.4.02", "6.1.4.99", "6.1.5.01", "6.1.5.02", "6.1.6.01", "6.1.6.02", "6.1.7.01", "6.1.8.01", "6.1.8.02", "6.1.8.03", "6.1.8.04", "6.1.8.05", "6.1.8.06", "6.1.9.01", "6.1.9.02", "6.1.9.03", "6.1.9.04", "6.1.9.05", "6.1.9.06", "6.1.9.07", "6.1.9.08", "6.1.9.09", "6.1.9.10", "6.1.9.11", "6.1.9.12", "6.1.9.13", "6.1.9.14", "6.1.9.15", "6.1.9.16", "6.1.9.17", "6.1.9.18", "6.1.9.19", "6.1.9.20", "6.1.9.21", "6.1.9.22", "6.1.9.23", "6.2.1.01", "6.2.2.01", "6.2.2.02", "6.2.2.03", "6.2.2.04", "6.2.3.99", "9.1.1.01", "9.1.2.01", "9.1.3.01", "9.1.4.01", "9.1.9.99", "9.2.1.01", "9.2.2.01", "9.2.3.01", "9.2.9.99", "9.3.1.01", "9.3.1.02", "9.3.1.03", "9.3.1.04", "9.3.1.05", "9.3.1.06", "9.3.1.07", "9.3.1.08", "9.3.1.99"];

export const LEG = {
  '6.1.2.06': ['Ongkos Kantor', 'Debit'], '6.1.9.23': ['Transport RAT', 'Debit'],
  '4.2.1.01': ['Pendapatan Penjualan Barang Dagangan (Non-Anggota)', 'Kredit'],
  '4.2.2.01': ['Pendapatan Penjualan Barang Jadi (Non-Anggota)', 'Kredit'],
  '4.2.3.01': ['Pendapatan Jasa Dokter (Non-Anggota)', 'Kredit'],
  '4.2.3.02': ['Pendapatan Jasa Pinjaman (Non-Anggota)', 'Kredit'],
  '4.2.3.03': ['Pendapatan Jasa Sewa (Non-Anggota)', 'Kredit'],
  '4.2.3.04': ['Pendapatan Jasa Pengiriman (Non-Anggota)', 'Kredit'],
  '4.2.9.01': ['Pendapatan Pelayanan Non-Anggota Lainnya', 'Kredit']
};

export const MIG = {
  '1.3.5.01': '1.3.9.01', '1.3.5.02': '1.3.9.02', '1.3.5.03': '1.3.9.03',
  '1.3.5.04': '1.3.9.04', '1.3.5.05': '1.3.9.05', '1.3.9.01': '1.3.5.01', '1.3.9.99': '1.3.8.99'
};

export const RMK = {'1.1.1.10':'1.1.1.08','1.1.1.11':'1.1.1.09'};

export const LOGO = "data:image/png;base64," + (
"iVBORw0KGgoAAAANSUhEUgAAAQQAAAD0CAMAAABKM6iVAAAAkFBMVEX______v___v7-___-_v_-_v7-_vz9__3-_f79_f79_f3-_fv8_fz8_Pz8-vr59fT48PDw5-b31dTU1NTev7_3qan2jY2tqKiQkJDsaGlo"+
"aGj8NDL_MjL8MjHxQkPxNjaAQEH_MTP_MTH-MS_7MTH_MDH7MDD6Li-ELS4eHh4PDw8FBQUDAwMCAgIBAQEAAAASDDKDAABDdElEQVR42u1dCZuiyLJFqFQKJAFXCkULAf3c8P__uxcnMkFQXKq7587MfZfpqbIU"+
"gYyM5cSSkYbxv-N_x_-O_x1_92Gapq0O_lO_Ns3_D0NXwzftxnsWHc1zBE74L578xthtGQRhOGoeYRgEsn8lhm2K_y5iXMfjynA0mU5ndHzdHvTedDqdjALpVbQyzP8aFlC__WCE0X99rVbr9a77WK9XK1CDSBEG"+
"Wl_8--mgRSCg6cfw1eizYqmOLMk2OOhlmqb4UWRMijVIMR2NArNFx3-jGrSV-DMBVhh-lmXL5WKxXCZJUdCwF0kCAmyShP5IiyInOizpFHrFXEGEmITyX24KwAI1AZI8WSyzLKFxEg9siizbNiUhy4pCUSTfEnkW"+
"i6IAU4AQmiHMf6MYmGFFgYK4PqWpXxAr7HaJYng-KqXIf6zXxADJlsQlJd4oiExZUdPhXykWEhQgAmQ0vQmJQLbJGpqP7MBk0jKRE2U0ar1JlEiVmEA0QAdpAUb8iyBROFEUSGjyl5tlmm93avis9wPf7vpmj-GD"+
"1qHgoByaItsmmg4j1g_mv4MExASQgk1CYr6F6Oda24eB75oEEsWn6Il-vy8E_hf43-z3zb5p93AJ1w9YkliUSCZINCBH6xXY4Z9PBjyePwITFEmSZItlWgt16A9oqnue57rDYf-z1zOvh8F_9YRtD4cuHWavZ_Tl"+
"VaXApCRb0hZgh384GUw2BzN6bpJnEoN0s9sRC0yZjS3H8xyHdJvV7w_61o0gKKgsxGAwAFUEnTywjB4IATpsl6Qriak2YIeR_88lA5NgqkiQ5BuIAeuzwB0MvE_bpiEKoxps5xVE6xRhO17fMl1YWdAhy9I8T0m7"+
"rv7R3OBPZqvdDhhosUwgBaCANXDd_nu27ZY2g779KT77AztQ_ACQlSjloLjB_MexgYQgbAkTFekSYjAjChg9hyTctKzeg0GLZxft9cjP_uh7ZEokzA1RmK6eJEsmg_yHUYGexR5N6RmXi3yZ7BQT-PbQ-3RJFiDx"+
"HURwPCmE03rDafNCj8MPA8t1Pa9v-swORIQNKdwcKtL9B8mEDVwwJYsAhJfyNE0CGv2n9wlR6CNycn1a6EceKv1w7hlBOE5NCmIhosFgQJqUtMrnQAZKKhZ5AaH4mgb_LH1IJFjmKUGjLaYo6GP0jgcM0G9Nlrj-"+
"8ifzaB7WhBBGOB7X3pK41ZjOkBjFkgGpnXVOXhYZH9KQ08D6JzCDVga7bEHobpuABL5hDx3xQZMqxMfHR3s0_lgN3TEm--NlPze86hMZ7fdxHM0nRAqnJScgAuMJ8WlYAWBITng6X-QwFP8MGoANttmCIO5Wqe1e"+
"z-n376eTZcEY74_HQ0REENGlPB_xSn8SxBccx_3-Ox63vltbTrNv2wYpB2hgokICvoNM_O2EABuQoiJGYBKYbBBJG3YbQSLC5XiJiRVkXB7Pl1gaTk2eMxFgvz9dLoe5fhe0aKCKAckWbgChyLdJAg20YgX5d7KB"+
"CTbI020B1qRJsT9kXxDSs6zub0AIytOJBmmEcXk6X75DPedMnu_5eDyJ4sOhlhIDcuFUesOCrR0MpXBJEa8IkRRkjIgZfOvvFAVmgyRPN2SypqFNKnw4sHqPo-YeEeFSni6xjzETEfZjPVxhzA-XiF-G0X5yJYIM"+
"Q1BPsUOPnIrBx-fQHYIMa_IvSRnvVtNwYNh_Cw0EaUSwAWmoLIck2I5jP0LEDZ1wOR4w9vnhEO8v9Zw7XnQkTgh9mvUwGlfi4Igw3kdjv2lOYSs8j1XDLiMQCdBA-tH8O9jA8qer9YJ0AbNBYHne628xEfbxvoyd"+
"qNxP4gt0pKKoH19OF2UffIJR9XiJQc77mAxKU1eS6YVqgGXeIO5CzOD_HTQQASmndJEtc7CBJHQoGs_odANiRYRxfNlH8SWm35dYaOQUfl9K6MWSZEXUwsCq40iq8jsK25f8HEoPxplsBClIosJ_3EoQ85EobDdZ"+
"vmArZZMuGPREAwqJZ0SYHMrDgSxDdIZ2gAXw-IN5SHpxH0nALL6OY8z3IBiZjEPbborP4dDzXDBDRuxIIjEL_7NUIBpMvtbw6FJmA9t2BkIM6oEHk7HniIdEmBDrn6EO5qwdFBFotDHjxfHYqfSg4xB4OEaOP472"+
"l3Pc5AVh24TLbRvMsCVmWJCVIFv5n1OPJtQBWYVNtsmJDW2P8L710bMqzg7iPZDAIyJg9PuyZOUIIjhMBNKLsedISYTwQ6mJAGNCZ0jDA0fMm0T4-BgIZ_BpmyGJRJZsl8vdFyG1_xwvBFCJBJIz2GhCcfAPrvEQ"+
"kmMaqOM8BEtz0oJkJgMa4lmZB4BmspdzZgUZRQEP1xF-fCxJSCRDqcO8rRtx9PrugCHrkozUmtXjf4gMpBIX2SLZEj4aSYdcPOvG3YlI4MddqpEIRESIiBZxPGa2uLB5APdcjrACc_It9rEmAp9wgcUgBKUl5-aw"+
"DPsTpjpZ5ItF_p-jQjBb51uEf1ezcOjZ5qDXxfORJ7rEAR4CqX8RhGRBxvF-P1dECOMzPIcD2YcjnwBiEnYoD_sDORTl5UR8cqdte70PqwcqEGQoyE7s1tNA_CdoEM7WWZLAW5oGAxLKPmLD7aFKEvAaC7ajBaQT"+
"j2QR-CNyKcdjX9kSn-AykeTApIjYOpDF-L6cYihFMMNYdlgcgqd98tmHENBNsc2S9Sz4z9Ag2SwShuyO_Bw6fYuJ0MCKCheSpRP3RJDkSdNwGia0irAYMhyTLIAWyn9iJE2viaT7yL-Lz_KfljFwbduTNhQDebIw"+
"lX89FUKyy0DsZJCk65i2QASRQK8avKiGGh-13r_XCg0fm8NI9UvtXvhhyCrBgYiQDRGCIYSQravw6fRlyzLhuruuJCokab5VgOGvPPqj2TolhymFUfZcU0-OsA1_PB9X-F5Bn05WYDQpHkabPc9pqxZSD9Aj5UXr"+
"yoZvOZ7UuIEew_v0Cbps82yTMi_8ZdrRhiyQLUrhsbhSumY1Lx6puMMVzMC2lQ9Y4aVfVnGHA3dyH5FqgDJtXYw-D-ff-6YFMglhwEjwDBEVzL9SHyySIt-uCSU6nsvhQ_LojCAiyE8GofZ7GO6SAnSc37qfHJPj"+
"5MF_KK9EEMQt_pxM5qWMw6vLLYAeiRcWBSTir7IRpkW2kdQBdM9o6H4ITQQ85IFsWxzPpVM_UvDLrNBmevhiLBaazQSUBwzGhfyq7yYRPO_TJSoslts0IypYfwUvmIQT1_muWEDzuJ7d-3QUEWi8pMTJghmCOMER"+
"GucAGcdS_B4ROGBNRN4fY1nxAbHB95HYLD6UZGudRpDBFqACctjbNeLQfwEN5HS1JagMfTBwaplTrs9-7ikrJ7XpYghIhu1PcKUQ4VyHWZgvwAbkU0aHS9TiNDLUzidRIS3oOVdT-cf1Qg802CXbdEk0cGRDRxEj"+
"IDQCMz8nG09CrNCeMYnnwROdAOTvXA_xJCbFaZrKuZ4Q3532UeDHl0YosoZp4IVlniS71V8QbDJHX7vNlpwUooHXBkbf5SEKx3PCe8C9yvkhoUCkqQs6M5d3O9qN7NPNN4SnaEAq-FJCBavAxF2SxnZsxPyyFD5l"+
"749H1r92CHEzPrAbQ2Cf8biPgfAPiJfvJw05vR8mZl9p_oAA4ngymc_nkwm9Cn2pzavzmCmggsvD4URqEq53cOtRCeEKd_KVF8uk2H2Ff5QVTDhNaZYRH0wIH3w2iEDDmoMDCN4THiZteIyaubZOw0dsA8mJ980j"+
"VtmnQD4L7SIgt58T08UR0NidtAmbHo8Ed42Srz8LoE3DJ8OQZnBVpe32P9ozRUYbAwjpicgwtr3-m0EIPxwrR-l0uT-OB9BiXmck7zhCyDEcC6CoE-fwnBvVIQRqGogK-QKQbir_IFxwR6t8Wyzhrtt2z7g1PjS0"+
"gBSAJO9o3w0OlNqDN7CH3OAoz-fT-Vyq44yjVB8cOA3nKFVwexkjJO_LM3CjlkoQVWKfHBnP4RhwsSXl-KfCbaYJXbMoCnJTQ9vtEDOpkAEmCMbyTumxc8R04CAJDZcG38EJJd7HB2qO6d9NxQJfiFSkB5N0in3R"+
"9DQq-TPJRMDVzVJo8T-jFkxWCMskh3G0PW_Q6RP5vh_OkUyJ_FtGgIfpjCEscCnOpxKjvXQf9EFJZyBCSTRD7sm5MTAwE0LqUGUDKRGLBCrMYoihx9CRHGuohT9jI_zpKiFFwwBhOBRdSMyDWiD_YR_dKmx4Q3Ic"+
"fUOTK2D1iAA1HcjiQn0IGcXR2Ls62U3dEB3KRtSG6EzKgqEZ8nTDoZRkIpI8yUgt_BmcNFptkesipeh5dufyA2GwhTjEE9niAy7H8en5jrCcRAQnRJ7pORHOSq2oIB3D8TvVQAoYMThd8cJIel_WOsIaDPufPHP5"+
"htTCHxAIEwhhWWyS1SxwXcskxdgD1GshPJrs6MC5smZxBckuqbAxMifl-Rh7AqUXNIXPWYEUBvkJnHc5kK487sENjnNTsEDqZ66hmMM-NykSzlHxmiqbHpNkeEve3m72-2iBrCO5z2larL_Cvmv2ENCyRC2dV7UU"+
"ov7EkC0-IFYmoH_kgV32IdIHmN7zU0bQcIvh-KnUZDCMtkyQ9z4O67uMY-Qr536zkEEO2YtIkj8iEJPVLl0mOyhFy1Ruo0FgB4niRq5BzUmrJM9jc0EkYFUIPSYh6HH5lBWIXKwWOYlP5DqjZuN7HugIXkM9qmwf"+
"seSEZOP8PWaLKrSd7Pc9d7LaZgng828zQkhweZtkhBD6nwOwGkfKgWoinguHR87OUPVgVSxAcuRDWz0kW-j5JBcoPJWH4xwXrahFP07sNN6oBs2HuAuh1OM5Ig-WVRCIZVnmwLb92WqT7hBb-BC_aRnWWJzEwjAY"+
"fPQ4Ok6wnYuL4mgCs9SZYBAsqOWpGvD5wpUXbOGfyYMKxagoZXkVEZb4e5SsPCoccSgAUMZzX6VkLNuDQGy2S5pA97f4wBp95ek2y79G0rMFx9Y5fqhSIkyHsbz3EmhGyGgSk5ZNhRdLLmGdH5-ywgmnsQZtassz"+
"mEEYN04mSjgOcFsUQCH48K1SeRZpr_5Qkign7E_-Ru0rB9TSNNmSMHifHx9Gz6rsIXsxRwa5MXsNNzRgfX26NIZbNizfY1Y4q6o-jK5tS8EMNMttZ8BDwg_JSk7gS3LljioOZ5q9nj1wYCG2GXlSv5WonQIiLHIS"+
"BvuzmgROpRGe8RHewOPtb1wmR-nr07lsD-_I5zkyhrF4iBjZP5Yg9KmtMImKCKyKFifwfNDc43fMhnJee1-O0yNGLrIk_40Ai8kZN_iO5D8PPxuWALec0J0PHEf4bsc2SEFO4hNoUN6qfYyvUvsPNIICw6QWT3dG"+
"BIFFQonNqJbjzL_nUkiPcMrleCyZBtqCi0_h2FPUuP2GU22qiFq2oEt8Dgc1ETiOcjrFY5RUwTNuM4LHvmSHGSw5paaij-fH0gAwLLtlpiQ0MPGchnNJTsuY4IGQIvwmJVwiaVub0p47BGRKi5zk-XeiScvlhrSi"+
"5YiqBKOunTiQsxBxRYXTqhow_OjBTJNqRGDOQ4qxfMQJEchEsn4sH0BqDPN6RwUNIIBkKBUf1J_17I9PY7TaZdti94vuJBhhvdym8Blct9ezmiP1-SHjgEOuTSJIAZt1Kh9Ps5CPVWOp0CLiDt1ngApR04NmbxNg"+
"4ftIdmXSpI9h2j23HyCHXhBudH9NK4AR0hSM4IqOCoQS3C1a-WU2C4fHEg8chJRV_IATlNpQ-asHFzndB_Idh23RjcLgELntDGDk04xYQfycCswI2SIF1Oh7tyECCZY-zNu6WiXkHtOAx0jM-xA1arUItHh-KDCK"+
"Cl6zXlBGxzPT4C5WLewhuZN5khS_xArKe0RNWPDhdVacnMvb2hGhaFA-BQHSUb7RI3l5CSVOiLg7LVU8B1gKb3wX5Uk5FhwpjZh-TAN3us4Xy2I17X12hMBFlSB07mjwDBITanRgJeeHskv5HyPMpXCiwzNQybzg"+
"NJMSMkIVh-hMcXy60xUBPlJtv4AViBEKlKcFRlfBsnDIMh8jv_kJG43jM0h8VoEPVcnSNTi4F4_V4hUwNJIb7MoGY7879yuEbXHKZIk0RP-HgUVzui5SeI-22Wso4mbcN25kxutQB6ShfBw6O0YGzGSn0LNadF7G"+
"4MrzbXUr26dHCT9LIIm6Lbarn2sFcqEXBXlOoWl_NFIpTdUTBjd31mGux0oBDnUdLCjvKMSaluxv_DTyRGbpLpL5pLbesompc5Q_f_2wdIMYYbVNN8jtuoMPjQ0mSLC07cFN6sNxlNfw0j_qQo1aLXqvPKwjRzKF"+
"YbwZJDBtxBvzJcKNhvUTtRjM0MBg-zUaulavAoIHFMh49ZKkVpBRcDGS9h_Lxxbuwg41Aog3HFOWZ06rsRP9JCTPRToqxPlicUU1n-4QyeRssZv9MFsPtJkBLA5sBBEUfrlwMRYM0S1wID4JnSt6O13OD2JopXIO"+
"HFSktXFlFVuEWuxGnCUsCvxpT8WyfE-8xQiu9GdrciY50Gb-DDGTC0pg8fPjw6yKVPcqGy59eSuFpMxiejpG8lokHowDqlHN97FtJcmzCIQu7u-WhjPX-wtOv3DUZvyWRIihhIFYkCf4E9WogBLXP9n2wEJ8mUAZ"+
"PQD5zuNgztnXJmTDuL_Z22crr2NeXbyAgCFHPVg1nlqyfpgjPG34DyKx5fnMMTbPY1GA1MWh4bwmgxh4nwiZKyv5g2gjoGaxI_to2wLBVTACEX6838_jw6k87ltrDxyH3H_WWB6HfmiaOAJ8fqgaCTrfoEbtRLdi"+
"izdsUO6Z2ZgVOMp-iLx31hwRnLemqyxNt6vJ-zVCnGtYgHAmWQPLIiYlRphDkPffR6XeGlhRKYwTZgqh8atIdNrKM5dbOYwayxZahLrBerBOFjoqUYD_JYVEHO10UjHZ1-MhSpHFX-bJ-ieqkaQhXSC977g2mRUP"+
"C5TikBdlqTp0FCE4V4UwjrG8jx6eUYyoMmOXLuE-adXIlrC86DAkO9EelwN2WdizCjfDUSbyMSaj754vD9aW3GrtvpCzdfKzHAS5DdscpU8Gr-gR8Bk5UxydDvF8Mp5EUYsRZJVbO5FIIOgB-2E4YxKJe_2oUSOS"+
"qic6zqo24aQWQ4m72KJmg-P3XLLP6jkOM9mZmYr0iHg6fI2r7R6ZuwT52TcdCAYJKae1BwOs93WwXK_E8L9Lmml2pZ1rQogVhh5sqeCco5iBIUN5j_x5_tjTuB5c4CKMrgRVzWEMkIjDTlrQytPTetEqDAcifARf"+
"Oyy0fzfuzLaBkBJhbShiC5kGTqeRGMAVltJrND9hEp3qJ68e2MMCTo2ib1TDWdVgwKHef8d87AmHhUy3SkaaBQsXlfEXdSy_PGvagquk6Kql91SiRheDGT3bnq4zQOd3HeoeQMKGzh94VfWgVIlVYodxcHu7G8N-"+
"Rgy-ggyiI_ZOjx4z3vNQsuZL6Qeo5JI8xrvYIo2WrQ6vFnMkW5077HUb7QCW4yYFcVXI4QL-LYv3I66QhiUyFgPlRDMOVFUG5QE5p6brzlXMrVEiQcARDuIF2SUSZ1WtLbzbsqYOJ_rKWTg_mDMbtEMQssOZchAF"+
"VwuJ1Kd9i-QhydO3S1fgf-cEmW231yq2mMRccXRoLOdWRcy36k_7utIxKhTdPKGs5MFoVbSqQpbDuZ13QhRd6RiPl0xd7mWrrRUwaSit1QuJOLSrwPN0nWYkD6H1JlLaJgvynXp2y2dXZDi1i9cVI5w73N25WuyL"+
"1RktFM34P6hK1j0c2j9XeKMJHmBtxqqalcznvC0KlVMZNWN8wmEKHDkzFseHY8QqAw1ioek278qDRJlWRt73wLypHBNMhiPWqolmNOke3AA4VSjaUyj6XDHwCRbGMdq1SFxbYEDmTzVJywocGBVO7qh6uzEQQvDS"+
"i4taZE74hcPXhjn4tNg-pOup_Y5tIHCVwqK67m2NlhKKaNxYw4R6tPKR349J5LSpA312UvqAI-NaeQVjVPWijtWo3GMCF0rFYMDsMoINvIdOWdlmBahWYkOsy0f1RHTUJOq5LslDtkl376yKYbZBInpkuaZ1b3qN"+
"ZuXM00RKWaWRBelHjAHmrkRZsmT7KVl3Hejgig-OUzg4U5V1MBVJXJQvMv8-P4jVcDcOp5kRIUQTTMjVw8X2R2Ufev1hH-GB9B3QSESarpNiAwXSQQTuktSsbEYh1vlJLJChLsC7QtFnyAL3zhFjJbkVVtpHY8gH"+
"Z7QvTAWIAkGSqjDr4W04WXHNkwZz0jhkZohBJKIWEZsLa_A5QNENegwYrxkBKLsoyEBaCmEKcbMUoRVfflqSR0CJTLxApsFhRr9ov4HVxJlrW3VRLwo-6OGlUH6kxskwIY5yGcsnhY9xy2YjWiHJzUFiEs6vWj_5"+
"-dkLZlgCsJ69DCowZl4iyux-fhimoYGa6G6dB6BUPomOn866zIaZAYvbOHOnVk217eZJ8Y0jeADsMqKfhuMwTi5PT9MQDcAkuN7PQ5HHPiK_v4z4wdGcCCk11PS9oRQ48QTnaWh9MCf4vlGtxhROu3gKTtDTKixV"+
"ZsNakMuyIxVTD6Enof5KLnM-natTQ65wC-IKbdU4uXxW-AiPrBV_59TG9-V4ONbFv_bH0JysdlsOstkvVcJqW2ScqUCfIJgmBJKAa6QUd9Lw_apK98yMrSGD4zuKD9SwrkNTTiGpwoDLmsZjBQMlavsPr2pgVb7i"+
"znnCN0FXhUx7YoggW5Zlq8mLCiaVhiUizALLRXxalyLAh3PmccQVmy1peEWEGkWzz62CIuQgoA7lxBVP8J8OCkacsdZelbezBWKcXHZHqO6DUjcanGZozkuy1CdEBJOQwiLZASmYLwtYN8lyPZXukIyDA_V_jscy"+
"8FmzHZr1SZwOfkWDErjvoPARB4Y8HTJgr2A-Dnw_GM_1dFexIqWEFE4uX92B7cOdK8m5WSzOqzo02X1XzvJFksCdtl9CpWVSrKZ9r29j_YSMEfMJYwST5636-jeShnWkXMGeqtaH65ngQdRsFXJlB96sljrSqBhi"+
"HS-XN-4QCdEdUqnf75mmS9Z_kyxeakYVZ0ZtuDUc2FaPH5kEFaBDYrluE6O-LlTW8n7GWp1IrRV06mIdlH6x38BqUy2kKus1PY4q-zmV7xGhu6VRkzS26xqT1XaDGJv1QjFyuRdDJdHTbeEiNDIABsd6z0asXz4p"+
"PuIUQ8kLfM5KpkmoPMAhdJE4AibOr9AT788JPB6Pp5JL3OkdFUTjZUHn84t6aN114kXQ0ENMAS3rRq-WEE9XRcK5S7ta7UsCR4oh4oXbl0aonRg27rJdWMRzPrW8fqzw2qOEgKNNEelXchhaISHh-HN8QB9xrBGA"+
"cn84tq7KS6YeEOGdoLNtwS1aJi8wIxsHIgLwoi105x_kCeLD3FEgVIrm0ouW9arBn8IwauRYKBeppY-hI5pp1Halch1iUXPqhJPJBFSJ4-89yHG85mDKW754jwjQ-kSEzfJFtBXGYZcVXOCj9T9aoASTPQdS5s0e"+
"gVVVjS5Fv3IsD_6bhh5h4GEgbxuHqCDKXW0NLxytcGn1kefzGlLVZeTKGwBYVy7sJIJK2PJi5PpOiBJsXmUfbIDmpCDQrM5i_Q_H9HyIAjmOL82gkq5HJC6teF-ta6R5p8EHzXoa58bveicDVAWcag1E1JhoYlSr"+
"KllCuokA0H1L5l6f-HyzgI185Ucv06xaOCQUyIeG38e6grfBCZF-iOvwJ-PQv8JXPfbbTqN6ftpH_f5t4JFJeL2IULSIryoDqvOWCCpg40gCIUEYVkVFtjVZ8TKQ4DknAFk2iCDg9H9X6zmPZdUcSMUdIz3-b6wQ"+
"HodS1HMortJ_HbMQbxQUaAa-p4jgZdbX7jNMioopbqOtdHKoNAqOqoEfDW-VLZavvAeLAw9ZHZ3HTWXILZBAdwIlnmhU8R14-qtlvcSBXqOuSc1hq7kMrxPmo1orrg9eMY7Db54OTrpnJbyp3yFSMFMcbjiBJg8r"+
"ESqtXYEbEGG3eFHNZzIRknRbrzdXKWC1xjvi9lhNIpDwa-5v6jQdPq-bLDgkzTToyVxPzff3_tHxzbaElQpplWo7KOHddVdQmlXUlBg7N5h5vu-IQio8nO7gQr2INOdp3lp0L3REVAbjcdCKXsgqAFurdNFsgeDU"+
"qozXxwMLnV8CzPJ4VLb1W9lWIoZfU_bKA7XgOKIO-zVoADyvnLOmOGgi1Hr_cWytQJOE27YsepnXfeK_EW9U0lBPjmoOcLgBPOdjdZzwvz6O1-PUzFcdD0rhQuQCr7qnvEEYd60nVNfHiJwzr16hplfyfG0VEewn"+
"RED1Ys7JJ_NeYzk3C3bbk6JaXUBhRRGb9Gt5xYmH_JYbUEMi-tIVdoI3Ku1r3LBfxwH_5BR7RlU4U9Gob_mzPE036-mrWt4CTdzkO2mauuWPuofSUiTwB50y5oltz6ti9O_4waHUBQLQ54Z4EDlaMEQrort1us04"+
"B8E6IR0GKOjipdfTWxxA3QAyPo-yFlkGIryXu3UkM4AXqPGrZ-fh1_OuWZpBFMyAsg6-jr5e0QCwobIbOC9SyWqySWXNT4oUJ22SFSVaWqLJCQi5XT90rkTINsVu9gQ3gwgIQK1n7nW_pWddb4RmAG1B8aj18Fm9"+
"0UjY_pF2k_d8JJrHDbqT3HNlMp838TKhZXX5M-cqKuMsupZjqEoKDxnvaKKJMHDfIQK5Dht0apI9s4G8hNeJaxEMUQQotVpvs-0EZk62DHwbHHYfCh3UA_Okzy0K4UlVGFFR4shdvtTmcTdJATRIpSfQlumgY_Km"+
"Sf7hJkt3M_slERBvtysi0EyHsrOKnvtIKv131hNUHrXUXjdqQNnU8y5KT6BjEzA7gUZGmhSa5IzXxsENWOKq2OPhqIVJBwAslGost-8SwdREQMyWJLCrahKojItcjye9ahiPA-dBXHNVCkGKTmjc6Trc9wziyFO1"+
"OwhQm4bLrB9OQIWkJaLbfpXa59F8qRdDDDjABiK4L4jAmRe9PQeCq6VaXeR0VMSgGoe1_1FJaCDv4UPr0TzU-niPrBtSkSQJstvhVOJUew5zVYQB2UC08oYISFfEGoES4Aqq7SEIAmTZu0QwK9SMZqv7rrZOapH-"+
"OD4yASZjv0L7DwbgtBLxEj1YWge90S6S7W6-dUUrIqgIcYjnfkfn0oA7WDXDEz8gQrYhIjg9Q3eZ388n8eG2pRG3yfAdVONEczZWPP33nrDTIAsmEAaw8u6-206D8hrgSgXXvo43QQVdjMP2n7EJtoMAKr6lWIXr"+
"6MtXF0y4IEL-hk5YJkQE1zEN3WU-lhxb9O8snJyrjheGChp3LBCqplYG2tbpSNnxQTIfmLpuvgUkUHtQnT1vNRyWBrdO6OhrdDstApyw2S5fEEGCEwoykbYOLCG1jagy78jRuqBnRFx_4Hie08H9dQRkPo_jdtAU"+
"oZhjx3E6N_yr476KUlVBKtEhIEhq6eZL7wQZ-zYyD8vX4pBuUKXCmlERwfG98X4_VnVxLVh2bHd2YE71HE2ToFLjVUTmqD2m5y1VSu1OKdt2VhUcgEU6JXMbp1P57vFbfVM-Bu47RCBOSAsgxgYRgIm-D8Bf0hc3"+
"sEylnEXDYqjogxq_HkkLRZ-PR-VBVJqgpR4OjTOBvs81WzD8YE-SdxJrrzOII--dGn7xSbAZvRqfEcGE74CYtPYdlE4gtD_ZHyLo4shveinjfXnCAtFWZ4cAcagqIMf-o0b8h2v8nbWfDiWFdaRpfOs11A6UYp6j"+
"7k7X0k5Ccg1M9ALbG7XvkGdp8TTmrrxIEMGviBCfedpYYR3QJqiddjiedX5N5f3C2npDyZ00R2tNBw8ieGNTEhVln2hFetBcoVzJEt4T0dDXlbZY-YD6hUd5ByWh9TZrH-RKL1-60giqJMmVCEF7dd6-WdyOQOuZ"+
"C5MmqgDdUCUB_MQnnXiqQtBOGzIwCnBuXAZ1XP0UyZgoqn2GsxaP4z4eK5-GO_igLu4hEYik8ooTjICIgE4zxjNO0ETQMWleAtdqHNnETOS1H0vV5kPrR0eVQJ-Vw9uKwaoxvqXDRRVXFlcLU1OCm0_Fk0AVtekO"+
"Puc7IlwDfgHXmNS1SF877Cn3Kry22qZ53diTGHzcPFodZBxd4l8xg3ITiAxMgGYMVogXvTq74jVCIeVGwI4zH0fuxqaqchQblHfJF11oqHqhzrk2X0ebQ6wN3L4gAqLN6ZsF8ao7q6rVQ0SP6-u509hc7VdgOD9N"+
"Oz3KRemyX9StowUZ6E1MNa6qme4zUL52YwhlBfG1bkmV9r6MNoMIxZaIIK5ppKar145dRKVev3NSFXiiCoI6wvN-6j0L46HDzblhp8aPqHtCJQ_WQZX3ROAmhldZxIZT1WZTyDssXsyxSsNttqvRO5yrlrmqRUzn"+
"UsmErtj-GQNcaaxTbp1OmPZEPO6FrFuaXesTDNGurjxrrTwex428A9IqixdtfFlosgxL5z7embrxdcESGozt0SFNeOJHvC494y5Z7z3RoLg--hs2it9uOMFTXVB1QJL0SFVU0SOV904uMuAgI2mOwTtqHAs524t4"+
"VfNE8S4FhA6UVL4lHMmxWlzzKOagluFcGutpCGpH7fZ_YZXt0cuzdcVrD2uAklcLoXR9ApwHYd-kQ73aK2hmu1qLH8uqh6SQL9lBqKvpRCceGI0Xzpx-iqNJqGT_Pt2uVyI1CzXKm-bFgs3qWKPP_fGsVhth7wP0"+
"r81ero5EPXySqUqVZtcc0S4naZZp3Cz90TbMe04GviJpe7L_x7qvWFnWvoJqbNcOUEEz-qrRZ3nfwbFb2_gBGn4oe2uLAKV5NMVPFwCZJi97WaqapVZhDQMGedsyQd4ue8EwTnpTP-cpnnfQ_f1QlbeVVQdn1cNZ"+
"wULZaBnEhgMNgcvbIl9CrZG46-mrApxoA3Ss9tvimiUOnL0qcp8QWgJQsK5xEsfweGkC8em4nYlzOgq8-RGJDKrPrtOl5VH5T0x90BUWD5oEQM8KVcSvVAeodrncLT5-sjiSW5fqtr5YMT1abZWFNF7WMXKVm1ET"+
"wUFdvnbpbiKuqmPg3WLOkyrYVR0r7_gBUA-LqS7PqxSJDse6bwiWMTDfdNTUny-xbzzCF6gH3VdFxTTD-YIt5IuKVojNgjim5wxEr1myc4B7WLZWy_PSrY5SRlWOfIJgByrO16jc8LAyDEx9epGmh9HleAWWFM81"+
"1bpuhh1pHxEBWJsD7j0xlL3pOllyrb_9srZ5iRo--dkfIA0lHD9Se3eSc8tlva0g28OiVpaK45UOGvqqlZLl5Vn3meY1yu8Jlkc7vCz_QRGjWnH2QB7IFUVmxurZQ1fOdnmevewqwsn5JME6acsbWINqd6-YnRbU"+
"3rZZj2u8H_ZPOWtFP68zZY5i0Ne1GteuCSgpJ-_sUaMV7HjhPIwrKbvGRBDuIPwi7zBbT183FYEfiZURlmvzggd0BYQJQlQrbNf1Vn2jzk-qDEqdmkFiQqiC5UslCMoSlGdtEB61Wpt7XA3c2VfhfnWoIe6D0uhp"+
"PZDQiyjWGb218oV7TgxkH83hyQpyy2WhegTcb6qA7m_n5zXuYIg4wMK-sLGwr13622js29F6w1GbQd2fcSpviraE4XQ0fzesj4FnEmjO3nGRdd8ARN2dmgj7ifYNnahV618DpuML0VZ7Bnq8Fux4VRkM7fW6-cPl"+
"8kCsVDeyByX15-ZeUNr2qIjvLRFcRFk5_RS8JoIu5pgFPd4MUzgR7-5JPrJUW4LecALaxZXnF4tfDhEWR4YxVnRxpbbKJ3Mtki99DpnsWVeUXZ1EvrGOsEv73K_3IJaZc_vgFkaxBmI4QFgJO8e902cIjVnROKDn"+
"WJbGQ7GKT6Hh5B0wQeL6xRogni4pgrhGxigtm49VVkVrduUWdVfNY8mF7FprBMTcmnQ22oeqq_aVRQZ97xMRlWX2zmJpDikkabGamLZ9LXjQm8Bf7tdcYXHU086BvJIX4DE6nI-6tgJ7RnK1j1QJNmSrDae7GQ2K"+
"x4mTjI5OXKrBY8tmY1FGqWyz3yjtM_sOFsO9gRdrpbBYwNXqmWbda0tta3rp2scVMemna_ZKtSEwO_lHDj8GQhNAFW5z7hhr7fx59_I_BPYn9_1vsWHCDVjkHk8HXb3RqPHs9V1CQNli8VZDkZ7hklJYJPCh-gO1"+
"JrwuDz3Ekw7N-6KTZkUEYlN2kj0181zvNFa5FhUQhqM8jk9dlyLZ3x_u1oR1eQ2OCMa6dwC2JZ_oREfP7sN7WhRvrZpXSiHFMqge7-9CowbUZ_9pHnZ2rxfy2dYVpe75gQAsS6piAVk1u1BdwJFgdzyne0mwMo63"+
"LMLNdTo2CILLqwuJTvu5-tz6tLBHA696feMwLd1zbOravbpwiVTCmIXsYdz5_Hg3G-gEXYmDOhTO1s4jHUlgqFQyl3kMJbpanJYdKwPLrkWhdc7B13TQSxj7n8Tgi2365jZhKrq04JhCr4pmVGUW4km08fxEHrD-"+
"V6ISx9Ab6SlccK56lXNUAj4jGVI_2r_jWZSn7g2Lq4y98r2rJnV9o-qp8m6PIYQjGV7arSrmOiJ-rxccWIhTV9M4xcnY0U4n7LGR3lkBxla7du6xh2YBvNPV446ObSQpuqps1QOz1alqgPocaH6rccBVHtJ8SfIw"+
"MB4VMN6QAXtXHM-tuN-ljjnxQtBoHKpqKxQ9lp0e4Ym7bKDTwOS7fOQ01s46dnS4bwvZivJqA4l2IqhgxMx-jd5Ng6ELfIL-rF1-N4Dj-G7PtVtsXypX-qAqvU8nto2KBU4PhwdiTTgIP77ZIaPLN-sILCJwIpxb"+
"NUk_2DZk-fIHHehcsg95Qk4UQZzBvYs-jr_vNmqsM5OtUGNUYawqiFa-2v9Idd50dI-5Z2Gn77FxW7LmoDWmvAsu0CiG7oTTLj_p7s-eJLppfHoDc3CjeoEaOtbqq85brMZ5q5q9hgQqdYz1oqfTy8Xf3KQ8gGLg"+
"jmWP2ntWDW9vxRTrmHlterO6CfGUoa-78IXv7q-rClZSdCe17b416HAauW_gXSJBtZ0qj2fAFA6ZS8YE8o0OA1f1wY1YpO7o-Kh1z35-l-IRHrdKVIVUjT7nVt-2vdFXvkjyN1qJtPESgcYVqcYmEbiYIjodO0tc"+
"OWKiGq0dv6NQXDMwHvYLq2Lqz_osqFWm6uqeo1KuXQABFREdm6WRQo2hdQ66XWzlNfQ_hTvlIPrqB1tCcbh1gVRNMHA_LKtOBqteJafOBvrsvERqKsYAxrwt3JzwOzmA4Xejd8qjSJzWAaVuyUucpPcTa-6cArGC"+
"Yehs3O4hMXG-qLbGegqsQd8eYJeHIsUWafb7RHDRZyhFs6WhqBu2CdTth3u9xK4jtinR0Z5I4AAYogUa1kBBeLHkmmufDqfOVkEQArIiuu9aqWtfPJVzO6jifn1wQiLyO1ASt_oF-5Cveqw7m6G23UOLpSV2Ev3Z"+
"HvTcoBQVXEPRU0QADo3nARzrSHRmjfEQ4RwJEzjy40gVMGkXEoYC1Vj7rrgs4whs1qHqHc5Vm27oE05Ulc0iT3oK0VFAyhVKsspIH-Kx7iPSsz1sjZ4nP9zdQO-Tif0xPh3D0g71sUQ_Ro61wu31Owih3YMrIx-P"+
"l8PEuHYJ0D3vy7uOpboASRsEXfvCClL7mtUyQYSuO3K1gns0EffwZkjoxFJ5mAKMsF3-ypYnrElgJe2PRgfvy-WbiBByd7DovvLdUD0Y1cZ45QmoGbtP8GI5OI_wnrz7fTDU7nnI9sEgqK1FkX9i_1rNuc-ljmEg"+
"DKNrF0324bAnGAfE5z4uVK-Ltck-5j9Ui414K6ykafd05ARBUd7Fd4xCkfP-vpuLKrgK52osmPDjN3TctXTHQRHRXf-D8hT78LCUQWD4rfJP8_HV927Ub3TtNxEduH1NdECghZTTt14_bQ2xL3iRJm91mbqrY8tz"+
"7I_hDz6VSQ6xkg0kPkTE7OfuFKBQTcKAjU-VoWABlqgXmIS8Xcx9iIj1OQeXcGmtPEsNubTml56UnvOwiIwuSqY52uvAthPqUg8xQEhpmf7CVh9YTLpbFrz3z9BpbCTgE6o_QN6P-y47pdryqQLlAxdscEYWhgKW"+
"Au3nBNnL033IAXtCqiKMuOqBfq7Bd-hL8awGENLAG7geSKVy4wRdjS4EB00XafFjRtD5ODKtxWoqh8Oh2TNNrAGXVTMZwNMuRvC07jgdVHbegVkNVE6d1_gjdh7ftFJjHKz3hJRotsZFWecqQXPURdFRNBbGQ1YI"+
"0Gjtcjwdo7opB_JOwoP_mBfPixcfHmpxNRkI0-1bqsIVFis-conWvDvMxBpBlTLrRKzu7YrNLzmNwsjp2IbKJyTk0PJ5rBpEsVZRKakKZZ55ITm6zjys8lO66AyMoUD9x2DQ503ylknyizvPm0hAJLyJsDOwWDv6"+
"an_Eg94y90GDJ9LkXJMvuJhVFZpxQRIQv-CuRXfZpjO7XWwQNMpQhUk6NFP5ENgVsju8hW_pHWsPcRSyJu0NBt5nwNX9v7b5D6lVNHHM0bHW8gZ93XRJKauwK7rUKknjmloPfMGJJa5YwBZi-CgYA9vWNYglGsry"+
"5ywTE1_JkEYaule3LuS53C_Gat1Yt7o86O2W-31PjNBQb_kLGqHSCqsUuyDNguFn3-zp4n61t-_zqizVJUgq6eaa05MG9CpXLsf1skXe3TDQze9LhfuhGkQ1r01ng6BX5DwplHWUXiW9wHNErtMQXkPGuzT8Uk0x"+
"tovMNwWCK649MHRHOCgn751CRcEVKWoj3VPl2qnKa4-djDqR5un-WqUqXznt-R4Nz6FUbbe4GGpiPCuLYx00jnXQqT_gnbDQo_fXGIGx1mSVJyn2i-zZJtcqCN8zhPPGV4X2hE-qecDhm0WInOqQk6XEJPFZb2wQ"+
"S5iEIOIgCucqj0q30btOOG-2ct3HE-dFjJC3ddc9lUknkEgXRfJjsHjjQSwS3iyx1zcNQ4i3Nx5yHMz1SS3s1iV9Eh0uv7lHolO3-eXlrQomxdp14IhElZIykFDiNVLfnKd6WSTK3cYVEUyHGGGTLJJf3zlUFb0T"+
"alysyf2qtwl474ue2rjgfKzqU1WEKT6q0jyD4B_aGJbY2YE7VMtKg3DmulQWSKlIsA8vmXIM463C6eohXQDmRb542Xfv-eFP15s83WIDVc9xfvBFbmuq8YKjWFuokmTU98WKCDpNr3ZLlrXjpcwpLN1YsOfgtCsw"+
"3nwCYcM8bvM8XU9_ZzdhE6RMiu0OYMH7CRGgmKSvKthRn6FLktExDbuckmj4MQ8fPeo1wEHbZoUPTpcqWKtqGKq-Cz95AKKB5Kj58lf3Tr2GXHnbnAIx158RgUWT68JhFYO6Kpv7UxJFecNJcrNDlW5SxoOI5o01"+
"N5S6uJeEKfhx8wXT6DmejaoMbNvyw4BSp27MMiyQCxzPNAc_ki3lwfDqTVWLwwE03gLDwdYtqDUFvjlig8U9QkGeXsygYFKpqnq-o8BwfvbYfdOWvH3sNs9-wzzWFd-jr22CcrapJMRk_VjBADdyPgmmnvHCWK30"+
"RiUWwjMq0YIQNssEVIMufAY0OAIrxT8lgtFDd4LpihxAaEXzt2igYq6rRZ6iiMm2-z3jF4ggI_IKVKXi4ZudAxqmz7uIRxIKw0d48XiuDCPCT-MrPjh-j40fricTluXacJy2ebL61X2EbwUi4b5D4Yfril-hgirn"+
"VniBzYAf8cbIMuatgjyFEc7HyjBylDLQlfXf8dgQP1xSRc4_waR1ssjz34MIrcjzpkiT1SyAP_nzBjGoqoO91HhBxZ7QDAqdT2IOpyqMcKo8VOVJci8MLGn7oV50nMGQrCOazQLiWH-ECDYWghBVSS0QjYVh9H5G"+
"BLYTvLUgz7qPTWCO5DIo2Iju_VJpBhII5WWEvCjCqQI1PxMG0_n0XLJqeZokv-w4dabqF9ycb-T2iQjWj0VM76RUO5C8Izq2w0P1Oq8rJRlxlIcNofiOeEm4ED9GB0bP6g-Hnpx8rbe8X4n_2wqhUgtAn2QjiLdc"+
"ObQ_rZ93Tar8Dg4FYp-HOUeNuYb_CIyAaKysN744vLXpW9dNyNEbuu7oa52T74e8m2n8qYN8iMUGaYhw6Nn2xy8QofIoDjo9pDNGAqlsjiFwHz8ut4KrNJa_cgtsYGZZnx_hbJ0vsDfByP5jNGDgmCfbIiflOBza"+
"w19dAS3UikUdnVNRMVXHyjXkcIO9YMxLzX_pDkSED-FAKW4XOSIp8g8ygtHjSN0WyjHwXPs3loFD4wdwhaxaSjg0O1Y6YDioFPyvEuHTCTBjBHNXf0wh1FPI8Dkn6vre0BMfnOr8-WHrMfZsm_8WPRuYgObeFj0h"+
"eqQJbfpn937psG3b8Xy0WN1mvw-X78Az0ALyEOjAIIfSG_ZfHXb3wQvK229h0afp2G8cL-7YJ7OKTaRzUorZ-iu0_yAbmBVmWpDRyfKvifyTTFZT-c8coMEyXyzXXM3-Y6DUMx8dcjQZjSbTr3VK8JmoMP0nH195"+
"lhUbgopTeuZR0DeNR8P6YS5qtsKxXmTFcplm-Xr1zz3oIZNluskW6s_pD3UfqxbTvNdJ3FRht93tEiJCkhOl-Sj-YUdCj7YlYIsQe5qRbtzRU0-NOyVr90zWoV3lS6PHHDYjMUsJiePqiyTP6A_6t8CfabKg_9NN"+
"gp9pSg58ijfxR7JYpPwHPiCdmqT1kaj_-Z2MFE2SFNdT-VxSP8lGnYS7LNSX8416m--kzl7wR0lSXS9Pi2IDoaWbL5bPRHcS3AvEaEZcfmX0NR_6xYKek9QBcQLdvShy_iNhbsAA-EeGZ6d_CT0G_Y2X9CWan4Q_"+
"oRNwIr3mL1YDLkCBhBmLB6_Ox9UydX6B62QJblvwPel7Bd8S10_Vp4TjeI7o7VxdjOmDGOvtseJB4te0w8c2yQYSQ6X5tuKv7VZxGTNXDnrzMy0xyAWmmd6mD5fLTYZzmPQ0MTmmp9hgNBghnZhVU5YnywW9nSab"+
"JTFSyqfwTG_w3BlRF_OJW2S4BcZJbEcnLRJmwnTBPIfzSPSJFTEdmsOSbcb8g2vibsyPRG09lmybVIPK890WAfQuzSiICvQEpPuux2ajfmMucnRbyegHKYXFjpA5UWaBF9mWuDCBCCY7UhyLYodjm9ENM7rnDl-h"+
"M3AC_b3FQHFKxoxBX6CLbkmZZZsCtM7x5bzAp7sUoGeX5BjCMtviE3A6vkCnQgPgFjg_Tfgl_ZfBcyroipoHl7dHsVhkj2MtNlGBqLvhQyk_fqHZVunbr9VqkW2V2GBnKbyiSeNPFbOlOU77-lpBg-bqRMKamhFX"+
"ayKi-joKbVmf4wyiPXECcTC--rXaJnwGX36hv6bENCdxr2-WZ0n1drJUV12DI_ByCy7YpHok2XVACSeZrUeYiKhAzF6kzYMejpQR8nmz0WQ2G42mK_SsGuHFNsnpjRk6kODTL7LN0xVOHI1CvEoKfj1F6PtrMprR"+
"18iOpzvY8BGCFPwG_9gpFUCAdBSG5LqvceEVzpxWl8WX6K81n0Tv4oK7hb7DliDiBK9mK3Tkx-W3UA_LtD0a1qLrxy62yXohVWpg0z4KbEFr-pMJ4kw7VIt_Ig6NJej2dF0s0JVIzojH6PlXI6PftyxEvPHasdCy"+
"J59JY0ooLpjl5JHbtmUwMUeGi3dRFUOuerJFNxdeqrOeSVSJ0I382VeIdSs417L8ydcWOzkFXzPe3AqZlQHvD6vWMvTh5NANUHi2qdi6HgUr03T9rLxXUYFkaZEWd0RAI-NgFPZHXxzKdySvo1hPXamJYAZEBJOf"+
"1pZhKD9HeMTQ9B2sPM5nPoZrBl9EhGlPSlRYEhHM_mg2MUeKCOjwZMpwxJwg6cI0RNedzEa2uqwfBljeSC_N8GvmE5XQJ64vUYWwQfltENJ1qy_nm-JmGFmaZ6BBYD4vzGAqLNJFJydIXyKyUOAmIa-2xHgqTvCZ"+
"E3jK_NnU_6Cnyb-CfuAT84AI5gSc8LXGuUEwoI_BCUN_ojmB1G-xGvVprler3Xoq-yBCiC2hKk4IZ1M5UC-JE9AehMYbuIGPtqNEhI_JLCS-I7Un3emquCdCknNvCPNVmgGTQvJwQ4TNElU_jgs6L4vV1A4nAdoR"+
"rafmDRG-FBFI86gp8WkIxLZEBMJj9IhfOVq7jSbgCeyw47lh2LsSYfrhIDaGrag0ET5lWF0W02_VL0GErL4Dr-mFaNHcYJPDLiIQDbhe46WLDV7IOohAnPDx6RERtku0sRvN1J2ndhcnyMmIp4xURjAbYQikEyxP"+
"ygENHYsNJ1MJRoKc21Kqlm-ktZDu-0SEcFsTwZR8QjX9AUqprkRAojGc4g5oDsVax5s-IgLpxeQlHyhegKVMlu0vpxssNx8MJbLdvKaMZtXgUUIcNousRQRLSkf6NAZ6F4-I5RMz-SH6vOU7mIKIMJgqeklXfjAR"+
"NkBTCOB9EqWJCKYmgvS8nhaHr1mTKZgII75DCK5jIuB5sCk2Gq3ecgIXGbwXPQAVijYNCJ6iubnn49ET7A7kh5IZc4rt5HZZRQT1tJbjDSVpULwkZdZnMfV7IRGOFb_vkgaz1BDolfzkvncEkAgGrWYhsgboHa3E"+
"IQjV_n6KE3yjIQ6KjHSHARmgNTQlEYHFwUWx0i0RONrUfzf9iDUSHUQw5Iim_yvnFTGG08eApn2X8AE9zGQAInxocQgkCp5Yrxmmg-fiiZuACNiR0zKkqWd3Eji8mBvwjiw82X8yCCtWjDCRpD58R58bzJjPQVvo"+
"yN4EJww-DQtdMvgOJKTMFFJ0iMPyrb4BdfZxVdwRgXSCTYrc5AFJEY4wwaD50Ae4ARFGpAgwvZNeMAlJdiH9NplVBxzKFg12lIbwKUcjX_CUmiMygA5rY0I2pFpG0xGmUSl4iAOdYPZry2sHbCItupn3gdPIOIxC"+
"cD9KDYmtiIDE9MRGq-yOCNm78WeiARHxXhzIOljudIoJZIT0NcEiIbz8IEFAjs52-zYrAp4y08YjEqD5mkKDrVmPTbCEgCHTF_BOzddMBGJXfCbZ7LNiVJzwNXW1OPR6CJ8BaErh9nkSZrI_wQm4mW-ZoCdsFpBW"+
"em8iOQr_Vnk7wYxic0eEDfApPTtwLr36Yly7xk86MOnTMAhCQrU58O0XTlwp7Msvc_6JT9YVVmaVArA9Aexdpku0w5wGQQCQXMFm-kxdoIbN22W-5pvhqo07EAH58xWSRHiXXLhbnZC-mYsIELFeZDdUICytA1Zf"+
"yuNZqR8Ju1SrFRk35fnAxVxVvlKuT_zSL9nFUa5U9fILL-kHO8SLfPGlrgK_iIbDP9f8gy779cU-07YgD-xrNqPT0kV9h0Wu3Da6UqHumxf3REgUFZ533Bogc5GS63GLEwh3k88K3xXl0uTK0o8dYVC8uaUXWFqy"+
"yxGMoBnd7ejsHK77ln1pRCYQfNhs8QneSFJ42wm5yxwG2RIjbOD1JvDQt6yD6AQiPf3KFzh1sdgiEJAgnLGhC-V8qSUeha9Nf_CdEM5abunE_H4My-WCHMwXVRs2-IBH0nGBhieGSAMHHjaZ8tHhui-XLd-TyFYk"+
"HHCBYwrgTf7opopRFPhTe-y4NP-m83DtzRJzwFfHZxzMWxZKLPnS6k4b_j6-RK5iwUPkkytn8VYhME8v81dUYJ1Ik0R8lN5_n-66TOrn0L8Wi6WOOC4Qj8dtFvhUjY4_pR-JikSlRA-ElhL9DfW7em79OwFN6fQF"+
"zl1U7y5VbJdvljBZU01gemOBiGNNAUQ98aTL5T03FwXiQMjPPdOJaLyWFPk9bN4Uih2W6W24Qc2MjkBtiprzwE18Bosj_a0GuqliVzxZ9djTZeNGmsZpTSEiapFpxxisUug3Mz49VROBsJw-f7O5pwCeJkeMsMgf"+
"a0fmAwSlEoRVOuRpqcamomfr9a55qD9zJgYeYMlRxTViZescx3qd039r6A16gT_VuzeH-oT-7XJ94E3Eehfq9jyYTcEXbt9cHzkTlIOj98KQ5Gm2TZFXfiARVqBKXJKsuAlG8MQRgyYIJWdrUswPjq819m1eckg2"+
"S0hZz_7UgYhbpmPVy83u6TOk2wIqKrshAsJMxDgcpl4zXjA7bWO-uI9LLmuxVC_JBssHh4_g1w5qCnF3sn-z6SgM_OB6-IGPI3hy6BP8699BiKDZOtnknGKgmf-ajvxHD4FA6bIhqfejwXyydrylAlZ4tBn8wYHQ"+
"1ONDMhnSbAGm3AIGzCYj37Do-PhA0-CPD3o5eJZbxnLavm1_DIYD64MMFmEiQgTrHWwfaTUSDZDgiYUjKrwzENKOwrwLuL_Hl-S2PshwcpcyTYZdQuJXEEzdgQ7TUSA_Bn1XutwB2zZ5tIMBEcOhfw794J-ua5pI"+
"1dNpttcfurasKABIQdcj0LAiEkjDeJhlhfv35kiC-xWNMgiCp3yqjr7xvAW4YbnMvESGIr_yAwTDd1WFnWfbKKfghCAXa4i6xAIFDA7HQKUPIQACzEnPbPK8WBY7FrAXoNc2em7wziHl7xQTvD4jGEFHbgsVvyds"+
"CWgMjiAVId0BCQT9G_Le2zaxABiE-EKw2FiuJCWgCUDKPkNaapnlUAWzEYeFzN98vmeFEm8dr7PbJs2kJRU7ELJdbGEsM6iTFduL6QS08KXbH_BGSxZDeWJjCRU4mkzZFqzWBMYL0gFbwMxcMYH_VkGHafyhofyB"+
"2pYAHh3xQ46aCeQpN0yJtcpPETE4NcxO6GTCye8ZO08rRheFwpbJBrhkDU0QYC3aX_7of7z-RgYTpgN5WgxlCUJky41CWypB3CqvUJhHexMq1cuYSGlWxWXGv-zgB3bDSr_vAHaXnHMHxt3wK2RW4QXqPCGcBfak"+
"NuQfKAliCvS0uBr_vsM0Va4rGNWEIJ8ZmZ2U6xVQ8KBcMOX_ZfCMaPxLJKRZl0KVBn-6tOtvYgfSk0E4qfQ9xwm2nOxmp3yh_0-56ENLCtuSQBlVw-wZ__pDzaJlkuWH6le6f30L63QdCfsbsKWuqr_7V7PAnf2t"+
"gDWDALYFM2UO-FAYborRh0GFYuz_IgrcU8IybHK3_FsEJ92Oc_8bj0pbvkOr__Ljb4Nx_zv-d_zveHH8H0WwGgq5RflDAAAAAElFTkSuQmCC"
).replace(/-/g,"+").replace(/_/g,"/");

export const LG = () => (S && S.logo) || LOGO;

export function setLogo(f) {
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 260 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(im.width * k));
      c.height = Math.max(1, Math.round(im.height * k));
      const g = c.getContext('2d');
      g.drawImage(im, 0, 0, c.width, c.height);
      let d = c.toDataURL('image/png');
      if (d.length > 120000) {
        g.globalCompositeOperation = 'destination-over';
        g.fillStyle = '#fff';
        g.fillRect(0, 0, c.width, c.height);
        d = c.toDataURL('image/jpeg', 0.85);
      }
      S.logo = d;
      if (window.save) window.save();
      const lgEl = $('#lg');
      if (lgEl) lgEl.src = LG();
      if (window.go) window.go();
    };
    im.onerror = () => alert('File gambar tidak dapat dibaca.');
    im.src = r.result;
  };
  r.readAsDataURL(f);
}

export function resetLogo() {
  if (!confirm('Kembalikan ke logo awal?')) return;
  delete S.logo;
  if (window.save) window.save();
  const lgEl = $('#lg');
  if (lgEl) lgEl.src = LG();
  if (window.go) window.go();
}

export const FLD = [['kop','Nama koperasi'],['alamat','Alamat'],['kota','Kab/Kota'],['pet','Petugas Akuntansi'],['ben','Bendahara'],['ket','Ketua Koperasi']];

export const fields = () => '<div class=bar style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' + FLD.map(([k,l]) => `<label>${l}<br><input style=width:95% value="${(S[k]||'').replace(/"/g,'&quot;')}" onchange="S.${k}=this.value;save()"></label>`).join('') + '</div><div style="margin-top:8px">Logo: <img src="' + LG() + '" style="height:44px;vertical-align:middle"> <input type=file accept="image/*" onchange="setLogo(this.files[0])"> <button onclick="resetLogo()">Logo awal</button></div>';

export const tgl = () => new Date(S.tahun, B(), 0).getDate() + ' ' + MON[B() - 1] + ' ' + S.tahun;

export const hd = t => `<div class=hd><img src="${LG()}" alt="Logo"><div class=ht><b>${(S.kop||'KDMP').toUpperCase()}</b><br>${S.alamat||''}<h3>${t}</h3><b>${CFG.name.toUpperCase()}</b><br>${/LABA RUGI|ARUS KAS/.test(t)?'Untuk periode yang berakhir sampai dengan ':'Per '}${tgl()}<br><i>(dalam rupiah)</i></div></div>`;

export const sig = () => {
  const c = (x, k) => `<td style="text-align:center;width:33%"><b>${x}</b><br><br><br><br><b><u>${S[k]||'\u2026\u2026\u2026\u2026\u2026\u2026'}</u></b></td>`;
  return `<table class=sg style="margin-top:20px"><tr><td></td><td></td><td style="text-align:center">${S.kota||''}, ${tgl()}</td></tr><tr>${c('Petugas Akuntansi','pet')}${c('Bendahara','ben')}${c('Ketua Koperasi','ket')}</tr></table>`;
};

export const CAT = {
  'Tanah':['1.3.1.01','',''],
  'Bangunan':['1.3.2.01','1.3.9.01','6.1.8.01'],
  'Peralatan dan Mesin':['1.3.3.01','1.3.9.02','6.1.8.02'],
  'Meubelair':['1.3.3.02','1.3.9.03','6.1.8.03'],
  'Rak':['1.3.3.03','1.3.9.03','6.1.8.03'],
  'Inventaris':['1.3.3.04','1.3.9.05','6.1.8.05'],
  'Kendaraan':['1.3.4.01','1.3.9.04','6.1.8.04'],
  'Tabung Gas':['1.3.5.01','1.3.9.02','6.1.8.02']
};
export const KAT = Object.keys(CAT);

export const aktif = (a, P) => !!a.tgl && ymOf(a.tgl) <= P && (!a.lepas || ymOf(a.lepas) >= P);

export const PD = {
  aset: () => ({ tgl: window.defDate ? window.defDate() : '', umur: 4, met: 'Garis Lurus' }),
  pb: () => ({ akun: '1.1.4.01' }),
  pm: () => ({ d: window.defDate ? window.defDate() : '', j: 'Masuk' })
};

export const OPT = (o, v) => o.map(x => {
  const a = Array.isArray(x) ? x : [x, x];
  return `<option value="${window.esc(a[0])}"${a[0] == v ? ' selected' : ''}>${window.esc(a[1])}</option>`;
}).join('');

export const LAKMAP = [
  ['1.1.4.','Pembelian Harga Pokok Barang'],['5.','Pembelian Harga Pokok Barang'],['2.1.3.','Pembelian Harga Pokok Barang'],
  ['6.1.9.09','Pembayaran Pajak'],['9.3.','Pembayaran Pajak'],['2.1.4.','Pembayaran Pajak'],
  ['6.1.4.','Pembayaran Beban Telepon'],['2.1.6.','Pembayaran Beban Telepon'],['6.2.','Pembayaran Beban Pemasaran'],
  ['6.1.8.',null],['6.1.7.',null],['6.1.','Pembayaran Beban Administrasi'],['2.1.5.','Pembayaran Beban Administrasi'],
  ['9.2.','Pengeluaran Beban Lain-lain'],['1.3.9.',null],['1.3.','Pembelian Aset Tetap'],
  ['1.2.','Pengeluaran Investasi'],['2.2.','Pembayaran Pinjaman Jangka Panjang'],['2.1.2.','Pembagian SHU']
];

export const cn = c => (COA.find(a => a[0] == c) || [])[1] || '';

// Bind globals for inline onclick
Object.assign(window, {
  CFG, NM, COA, COA0, MON, OLDC, LEG, MIG, RMK, LOGO, LG,
  setLogo, resetLogo, FLD, fields, tgl, hd, sig, CAT, KAT, aktif, PD, OPT, LAKMAP, cn
});
