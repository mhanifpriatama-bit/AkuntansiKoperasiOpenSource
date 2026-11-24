/*
 * Mesin penyusun laporan keuangan dari spesifikasi deklaratif (config/laporan-*.js).
 * Format baris spesifikasi dijelaskan di docs/format-laporan.md. Tanpa DOM.
 */
(function (KDMP) {
  'use strict';
  const { hitungRumus } = KDMP.core.rumus;

  /**
   * Mengisi nilai tiap baris spesifikasi.
   * @param {Array}  spec    spesifikasi (LPK atau LR)
   * @param {Object} peta    kode akun -> nilai
   * @param {Object} [nilaiL] nilai untuk baris tipe "L" (mis. {shu_final})
   * @returns {{rows: Array<{it:Array, v:number}>, key: Object<string, number>}}
   *   rows: baris beserta nilainya (urut sama dengan spec, kecuali "B" yang tidak menghasilkan baris)
   *   key : nilai tiap baris bernama (untuk rumus & pengecekan balance)
   */
  function susunLaporan(spec, peta, nilaiL) {
    const rows = [];
    const key = {};
    let awalBlok = 0;
    let blok = [];
    const jumlahAwalan = (p) => Object.keys(peta).filter((c) => c.startsWith(p)).reduce((a, c) => a + peta[c], 0);

    spec.forEach(function (it) {
      const t = it[0];
      if (t == 'B') { awalBlok = rows.length; blok = []; return; }
      const r = { it, v: 0 };
      if (t == 'A') {
        r.v = peta[it[1]] || 0;
      } else if (t == 'O') { // akun lain berawalan tertentu yang belum tampil di blok ini
        r.v = it[2].reduce((a, p) => a + jumlahAwalan(p), 0);
        if (!it[5]) blok.forEach((x) => { if (x.it[0] == 'A' && it[2].some((p) => x.it[1].startsWith(p))) r.v -= x.v; });
        it[3].forEach((e) => (r.v -= peta[e] || 0));
      } else if (t == 'S') { // subtotal blok
        for (let j = awalBlok; j < rows.length; j++) r.v += rows[j].v;
      } else if (t == 'T') {
        r.v = hitungRumus(it[3], (k) => key[k] || 0);
      } else if (t == 'L') {
        r.v = (nilaiL || {})[it[3]] || 0;
      }
      const k = t == 'A' || t == 'S' || t == 'T' || t == 'L' ? it[1] : t == 'O' ? it[4] : null;
      if (k) key[k] = r.v;
      rows.push(r);
      if (t == 'A' || t == 'O' || t == 'L') blok.push(r);
    });
    return { rows, key };
  }

  /**
   * Menambah baris per-akun ke spesifikasi untuk akun yang bersaldo di salah satu peta (unit) tetapi belum
   * tercantum, supaya laporan konsolidasi menampilkan semua akun bersaldo dengan nama sesuai Master COA.
   * @param {Array} spec
   * @param {Array<Object>} petaUnit  satu peta kode->nilai per unit
   * @param {(kode:string)=>string} namaAkun
   */
  function perluasSpesifikasi(spec, petaUnit, namaAkun) {
    const sudahAda = new Set(spec.filter((x) => x[0] == 'A').map((x) => x[1]));
    const out = [];
    spec.forEach(function (it) {
      if (it[0] == 'O') {
        const kecuali = new Set(it[3]);
        const calon = new Set();
        petaUnit.forEach((m) => Object.keys(m).forEach((c) => {
          if (!sudahAda.has(c) && !kecuali.has(c) && Math.abs(m[c]) >= 0.5 && it[2].some((p) => c.startsWith(p))) calon.add(c);
        }));
        if (calon.size) {
          const A = [...calon].sort().map((c) => { sudahAda.add(c); return ['A', c, namaAkun(c) || c]; });
          if (it[5] === true) {
            out.push(['H', 2, 'Aset Lain-lain'], ['B'], ...A, ['O', 'Aset lain-lain lainnya', it[2], it[3], null, false], ['S', it[4], 'Total Aset Lain-lain']);
            return;
          }
          out.push(...A);
        }
      }
      out.push(it);
    });
    return out;
  }

  KDMP.core.laporan = { susunLaporan, perluasSpesifikasi };
})(globalThis.KDMP);
