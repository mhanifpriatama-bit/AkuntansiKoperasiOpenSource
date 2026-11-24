/*
 * Buku pembantu aset tetap: penyusutan per bulan (garis lurus / saldo menurun), tanpa DOM.
 * Satu aset: {kode, nama, kat, tgl, hp (harga perolehan), res (residu), umur (tahun), met, lepas (tgl lepas, opsional)}
 */
(function (KDMP) {
  'use strict';
  const { periodeDari, angkaAman } = KDMP.core.format;
  const KATEGORI = KDMP.config.kategoriAset;

  /** Aset tercatat pada periode P (sudah diperoleh dan belum dilepas sebelum P). */
  const aktif = (a, P) => !!a.tgl && periodeDari(a.tgl) <= P && (!a.lepas || periodeDari(a.lepas) >= P);

  /** Akumulasi penyusutan sampai akhir periode P (angka desimal; pembulatan dilakukan pemanggil). */
  function akumulasiPada(a, P) {
    const biaya = angkaAman(a.hp);
    const residu = Math.min(angkaAman(a.res), biaya);
    const umurBulan = Math.round(angkaAman(a.umur) * 12);
    const kat = KATEGORI[a.kat];
    if (!a.tgl || !biaya || umurBulan <= 0 || !kat || !kat[1]) return 0;
    const Q = a.lepas ? Math.min(P, periodeDari(a.lepas)) : P;
    const n = Math.max(0, Math.min(Q - periodeDari(a.tgl) + 1, umurBulan));
    if (a.met == 'Saldo Menurun') {
      const tarif = 2 / (umurBulan / 12) / 12;
      return biaya - Math.max(residu, biaya * Math.pow(1 - tarif, n));
    }
    return ((biaya - residu) * n) / umurBulan;
  }

  /** Jadwal penyusutan semua aset untuk (tahun, bulan). */
  function hitungAset(daftarAset, tahun, bulan) {
    const P = tahun * 12 + bulan;
    const Pawal = tahun * 12;
    return daftarAset.map(function (a) {
      const ak = aktif(a, P);
      const sebelum = ak ? Math.round(akumulasiPada(a, P - 1)) : 0;
      const kini = ak ? Math.round(akumulasiPada(a, P)) : 0;
      const bln = kini - sebelum;
      return {
        a, ak,
        cost: ak ? angkaAman(a.hp) : 0,
        akum: sebelum + bln,
        bln,
        ytd: ak ? sebelum - Math.round(akumulasiPada(a, Pawal)) : 0,
        nb: ak ? angkaAman(a.hp) - kini : 0,
        st: !a.tgl ? '-' : periodeDari(a.tgl) > P ? 'Belum diperoleh' : a.lepas && periodeDari(a.lepas) < P ? 'Dilepas' : 'Aktif'
      };
    });
  }

  /** Beban penyusutan bulan ini dikelompokkan per pasangan akun: {"beban|akumulasi": jumlah}. */
  function kelompokBeban(hasil) {
    const g = {};
    hasil.forEach(function (r) {
      const c = KATEGORI[r.a.kat];
      if (!c || !c[1] || Math.abs(r.bln) < 0.5) return;
      const k = c[2] + '|' + c[1];
      g[k] = (g[k] || 0) + r.bln;
    });
    return g;
  }

  KDMP.core.asetTetap = { KATEGORI, aktif, akumulasiPada, hitungAset, kelompokBeban };
})(globalThis.KDMP);
