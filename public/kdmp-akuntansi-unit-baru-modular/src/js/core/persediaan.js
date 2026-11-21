/*
 * Buku pembantu persediaan: kartu stok, tanpa DOM. Dua metode biaya:
 *   'RATA' (bawaan) = rata-rata bergerak; 'FIFO' = lapisan masuk pertama keluar pertama.
 * Barang: {k (kode), n (nama), akun}. Mutasi: {d, no, k, j: 'Saldo Awal'|'Masuk'|'Keluar', q, h (harga satuan), ket, lot?}.
 * Mutasi "Keluar" dinilai otomatis (kolom harga tidak dipakai). Pada FIFO, `lot` (opsional, = No Bukti mutasi Masuk asal)
 * membuat Keluar mengambil dari lapisan itu lebih dulu (retur pembelian), sisanya FIFO biasa.
 */
(function (KDMP) {
  'use strict';
  const { periodeDari, angkaAman, urutTanggal } = KDMP.core.format;

  /**
   * @param {Array} barang
   * @param {Array} mutasi
   * @param {string} batas  tanggal ISO akhir (inklusif)
   * @param {string} [metode]  'RATA' (bawaan) atau 'FIFO'
   * @returns {{m:Object, tidakDikenal:Array}}  m[kode] = {it, q, v, h:[riwayat], in, out, vin, vout, minus, lapisan}
   */
  function hitungStok(barang, mutasi, batas, metode) {
    if (metode === 'FIFO') return hitungStokFifo(barang, mutasi, batas);
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

  const URUT_JENIS = { 'Saldo Awal': 0, 'Masuk': 1, 'Keluar': 2 };

  /** Urutan FIFO: tanggal, lalu Saldo Awal < Masuk < Keluar, lalu urutan input. */
  const urutFifo = (a, b) => (a.t.d < b.t.d ? -1 : a.t.d > b.t.d ? 1 : (URUT_JENIS[a.t.j] ?? 1) - (URUT_JENIS[b.t.j] ?? 1) || a.i - b.i);

  /** Sama dengan hitungStok tetapi berlapis (FIFO). r.lapisan = sisa lapisan [{id, q, h}]; r.minus = true bila ada Keluar melebihi stok. */
  function hitungStokFifo(barang, mutasi, batas) {
    const m = {};
    barang.forEach((x) => { if (x.k) m[x.k] = { it: x, q: 0, v: 0, h: [], in: 0, out: 0, vin: 0, vout: 0, minus: false, lapisan: [] }; });
    const bulanBatas = periodeDari(batas);
    const tidakDikenal = [];
    mutasi
      .map((t, i) => ({ t, i }))
      .filter((x) => x.t.d && x.t.d <= batas && x.t.k)
      .sort(urutFifo)
      .forEach(function ({ t }) {
        const r = m[t.k];
        if (!r) { tidakDikenal.push(t); return; }
        const q = angkaAman(t.q);
        let nilai = 0, masuk = 0, keluar = 0;
        if (t.j == 'Keluar') {
          let sisa = q;
          const ambil = (l) => {
            const x = Math.min(sisa, l.q);
            if (x <= 0) return;
            nilai += x * l.h; l.q -= x; sisa -= x;
          };
          if (t.lot) r.lapisan.filter((l) => l.id === t.lot).forEach(ambil);
          r.lapisan.forEach(ambil);
          r.lapisan = r.lapisan.filter((l) => l.q > 1e-9);
          if (sisa > 1e-9) r.minus = true;
          r.q -= q; r.v -= nilai; keluar = q;
        } else {
          nilai = q * angkaAman(t.h);
          if (q > 0) r.lapisan.push({ id: t.no || '', q, h: angkaAman(t.h) });
          r.q += q; r.v += nilai; masuk = q;
        }
        r.h.push({ t, iq: masuk, oq: keluar, cost: nilai, q: r.q, v: r.v });
        if (periodeDari(t.d) == bulanBatas) {
          if (keluar) { r.out += keluar; r.vout += nilai; } else { r.in += masuk; r.vin += nilai; }
        }
      });
    return { m, tidakDikenal };
  }

  /** Metode biaya unit aktif ('RATA' bila belum diatur). Disimpan di data.sub.hpp. */
  const metodeUnit = (data) => ((data && data.sub && data.sub.hpp) === 'FIFO' ? 'FIFO' : 'RATA');

  KDMP.core.persediaan = { hitungStok, hitungStokFifo, metodeUnit };
})(globalThis.KDMP);
