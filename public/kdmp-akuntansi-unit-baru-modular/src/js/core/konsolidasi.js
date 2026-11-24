/*
 * Konsolidasi Neraca / Laba Rugi untuk sejumlah unit (KDMP.config.aplikasi.unit; bawaan USP + Sembako, bisa
 * ditambah) dengan kolom eliminasi.
 * Eliminasi otomatis (hanya neraca, hanya bila unit USP dan Sembako sama-sama terdaftar): RK Piutang Gerai
 * Sembako (1.1.9.08, di USP) melawan Utang ke USP (2.1.9.01, di Sembako) sebesar yang terkecil dari keduanya.
 * Selisih antar-unit lain diisi lewat `eliminasiManual` (negatif = mengurangi).
 */
(function (KDMP) {
  'use strict';
  const { hitungSaldo, labaRugiAkun, shu } = KDMP.core.saldo;
  const { susunLaporan, perluasSpesifikasi } = KDMP.core.laporan;

  /**
   * @param {Array} spec  LPK atau LR konsolidasi
   * @param {'nb'|'m'|'y'} mode  nb = neraca; m = laba rugi bulan ini; y = laba rugi s.d. bulan ini
   * @param {{unit:Object, tahun:number, bulan:number, eliminasiManual:Object, namaAkun:Function}} opsi
   *        unit: {USP:{rows}, Sembako:{rows}, ...} (unit tanpa data boleh tidak ada)
   * @returns {{rows:Array, cols:Array<Array<number>>, ds:Array}}
   *   cols = [unit1, ..., unitN, jumlah, eliminasi, konsolidasi]  (N = jumlah unit terdaftar)
   */
  function kolomKonsolidasi(spec, mode, opsi) {
    const { unit, tahun, bulan, eliminasiManual, namaAkun } = opsi;
    const daftarUnit = KDMP.config.aplikasi.unit;
    const ds = daftarUnit.map((k) => (unit[k] ? hitungSaldo(unit[k].rows, tahun, bulan) : null));
    const peta = ds.map((d) => (d ? (mode == 'nb' ? d.M : labaRugiAkun(mode == 'm' ? d.mon : d.cum)) : {}));
    const spekBaru = perluasSpesifikasi(spec, peta, namaAkun);
    const hasilUnit = ds.map((d, i) => susunLaporan(spekBaru, peta[i], { shu_final: d ? shu(d) : 0 }));

    const otomatis = {};
    const iUsp = daftarUnit.indexOf('USP');
    const iSem = daftarUnit.indexOf('Sembako');
    if (mode == 'nb' && iUsp >= 0 && iSem >= 0) {
      const a = (ds[iUsp] && ds[iUsp].M['1.1.9.08']) || 0;
      const b = (ds[iSem] && ds[iSem].M['2.1.9.01']) || 0;
      const x = Math.max(0, Math.min(a, b));
      otomatis['1.1.9.08'] = -x;
      otomatis['2.1.9.01'] = -x;
    }
    const eliminasi = {};
    Object.keys(Object.assign({}, otomatis, eliminasiManual)).forEach((c) => (eliminasi[c] = (otomatis[c] || 0) + (eliminasiManual[c] || 0)));
    const hasilElim = susunLaporan(spekBaru, eliminasi, {});

    const cols = hasilUnit.map((e) => e.rows.map((r) => r.v));
    const n = cols.length;
    const jumlah = cols[0].map((_, i) => cols.reduce((t, c) => t + c[i], 0));
    cols.push(jumlah);                                          // jumlah semua unit
    cols.push(hasilElim.rows.map((r) => r.v));                  // eliminasi
    cols.push(jumlah.map((v, i) => v + cols[n + 1][i]));        // konsolidasi
    return { rows: hasilUnit[0].rows, cols, ds };
  }

  KDMP.core.konsolidasi = { kolomKonsolidasi };
})(globalThis.KDMP);
