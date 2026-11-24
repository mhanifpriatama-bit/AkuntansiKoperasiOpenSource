/*
 * Laporan Arus Kas (metode langsung) dan pemetaan otomatis Komponen Arus Kas.
 *
 * Aturan:
 *  - Setiap baris kas/bank (akun 1.1.1.*) dapat diberi "Komponen Arus Kas" manual (r.kom).
 *  - Untuk kas KELUAR yang komponennya kosong, komponen diturunkan dari akun lawan pada jurnal
 *    yang sama (No Bukti sama; bila No Bukti kosong: tanggal + keterangan), lewat tabel pemetaan
 *    di config/pemetaan-arus-kas.js. Bila akun lawan lebih dari satu, nilainya dibagi proporsional.
 *  - Baris "Saldo Awal" pada akun kas tidak dihitung sebagai arus.
 */
(function (KDMP) {
  'use strict';
  const { kodeAkun } = KDMP.core.format;
  const { hitungRumus, bukaSum } = KDMP.core.rumus;

  /** Komponen arus kas untuk satu kode akun lawan (null bila tidak dipetakan). */
  function komponenDariAkun(kode) {
    for (const [awalan, komponen] of KDMP.config.pemetaanArusKas) if (kode.startsWith(awalan)) return komponen;
    return null;
  }

  /**
   * Komponen otomatis per baris kas keluar.
   * @param {Array} rows    jurnal
   * @param {number} tahun  tahun laporan
   * @param {number} periode  tahun*12+bulan (batas akhir)
   * @param {(kode:string)=>boolean} akunDikenal  true bila kode ada di COA
   * @returns {Map<object, Object<string, number>>} baris jurnal -> {komponen: jumlah (positif)}
   */
  function komponenOtomatis(rows, tahun, periode, akunDikenal) {
    const grup = {};
    const hasil = new Map();
    rows.forEach(function (r) {
      if (!r.d || r.kom) return;
      const y = +r.d.slice(0, 4);
      const q = y * 12 + +r.d.slice(5, 7);
      if (y != tahun || q > periode) return;
      const kode = kodeAkun(r.ak);
      if (!akunDikenal(kode)) return;
      const kunci = String(r.no || '').trim() || (r.ket ? r.d + '|' + String(r.ket).trim().toLowerCase() : '');
      if (!kunci) return;
      const g = (grup[kunci] = grup[kunci] || { kas: [], lawan: [] });
      const d = +r.db || 0;
      const k = +r.kr || 0;
      if (kode.startsWith('1.1.1.')) {
        if (/saldo awal/i.test(r.ket || '')) return;
        if (d - k < 0) g.kas.push({ r, jumlah: k - d });
      } else if (d - k > 0) g.lawan.push({ komponen: komponenDariAkun(kode), bobot: d - k });
    });
    for (const kunci in grup) {
      const g = grup[kunci];
      const total = g.lawan.reduce((s, x) => s + x.bobot, 0);
      if (!g.kas.length || !total) continue;
      g.kas.forEach(function (x) {
        const m = {};
        g.lawan.forEach((z) => { if (z.komponen) m[z.komponen] = (m[z.komponen] || 0) + (x.jumlah * z.bobot) / total; });
        if (Object.keys(m).length) hasil.set(x.r, m);
      });
    }
    return hasil;
  }

  /**
   * Menyusun baris Laporan Arus Kas.
   * @param {object} saldo  hasil KDMP.core.saldo.hitungSaldo (memakai .kom dan .open)
   * @returns {Array<{lv:number,l:string,tp:string,x:number}>}
   */
  function susunArusKas(saldo, spesifikasi) {
    const nilai = {}; // nomor baris -> nilai
    return spesifikasi.map(function (a, i) {
      const nomor = 13 + i;
      const [lv, l, tp, g] = a;
      let x = 0;
      if (tp == 'c') x = saldo.kom[l] || 0;
      else if (tp == 's') for (let j = g[0]; j <= g[1]; j++) x += nilai[j] || 0;
      else if (tp == 'x' || tp == 'x1') x = hitungRumus(bukaSum(g.slice(1)), (n) => nilai[n]);
      else if (tp == 'open') x = saldo.open;
      nilai[nomor] = x;
      return { lv, l, tp, x };
    });
  }

  KDMP.core.arusKas = { komponenDariAkun, komponenOtomatis, susunArusKas };
})(globalThis.KDMP);
