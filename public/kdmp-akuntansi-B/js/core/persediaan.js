/*
 * Buku pembantu persediaan: kartu stok dengan biaya rata-rata bergerak (moving average), tanpa DOM.
 * Barang: {k (kode), n (nama), akun}. Mutasi: {d, no, k, j: 'Saldo Awal'|'Masuk'|'Keluar', q, h (harga satuan), ket}.
 * Mutasi "Keluar" dinilai dari harga rata-rata saat itu (kolom harga tidak dipakai).
 */
(function (KDMP) {
  'use strict';
  const { periodeDari, angkaAman, urutTanggal } = KDMP.core.format;

  /**
   * @param {Array} barang
   * @param {Array} mutasi
   * @param {string} batas  tanggal ISO akhir (inklusif)
   * @returns {{m:Object, tidakDikenal:Array}}  m[kode] = {it, q, v, h:[riwayat], in, out, vin, vout}
   */
  function hitungStok(barang, mutasi, batas) {
    const m = {};
    barang.forEach((x) => { if (x.k) m[x.k] = { it: x, q: 0, v: 0, h: [], in: 0, out: 0, vin: 0, vout: 0 }; });
    const bulanBatas = periodeDari(batas);
    const tidakDikenal = [];
    mutasi
      .map((t, i) => ({ t, i }))
      .filter((x) => x.t.d && x.t.d <= batas && x.t.k)
      .sort(urutTanggal)
      .forEach(function ({ t }) {
        const r = m[t.k];
        if (!r) { tidakDikenal.push(t); return; }
        const q = angkaAman(t.q);
        let nilai, masuk = 0, keluar = 0;
        if (t.j == 'Keluar') {
          const rata = r.q > 0 ? r.v / r.q : 0;
          nilai = q * rata;
          r.q -= q; r.v -= nilai; keluar = q;
        } else {
          nilai = q * angkaAman(t.h);
          r.q += q; r.v += nilai; masuk = q;
        }
        r.h.push({ t, iq: masuk, oq: keluar, cost: nilai, q: r.q, v: r.v });
        if (periodeDari(t.d) == bulanBatas) {
          if (keluar) { r.out += keluar; r.vout += nilai; } else { r.in += masuk; r.vin += nilai; }
        }
      });
    return { m, tidakDikenal };
  }

  KDMP.core.persediaan = { hitungStok };
})(globalThis.KDMP);
