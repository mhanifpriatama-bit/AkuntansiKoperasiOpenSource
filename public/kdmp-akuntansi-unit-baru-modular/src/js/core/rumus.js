/*
 * Evaluator rumus penjumlahan/pengurangan sederhana, pengganti eval() pada kode lama.
 * Contoh: "[tot_pend]-[tot_hpp]" atau "E26+E18" (E<n> = nilai baris bernomor n).
 * Hanya mendukung operator + dan -, nama dalam [kurung siku] atau berbentuk E<angka>, dan angka literal.
 */
(function (KDMP) {
  'use strict';

  /**
   * @param {string} rumus
   * @param {(nama:string)=>number} nilaiDari  dipanggil dengan nama tanpa kurung siku / tanpa awalan E
   */
  function hitungRumus(rumus, nilaiDari) {
    const suku = String(rumus).replace(/\s+/g, '').match(/[+-]?[^+-]+/g) || [];
    let total = 0;
    suku.forEach(function (s) {
      let tanda = 1;
      if (s[0] == '+' || s[0] == '-') {
        if (s[0] == '-') tanda = -1;
        s = s.slice(1);
      }
      let nilai;
      if (/^\[.+\]$/.test(s)) nilai = nilaiDari(s.slice(1, -1));
      else if (/^E\d+$/.test(s)) nilai = nilaiDari(s.slice(1));
      else if (/^\d+(\.\d+)?$/.test(s)) nilai = +s;
      else throw new Error('Rumus tidak dikenali: ' + rumus);
      total += tanda * (+nilai || 0);
    });
    return total;
  }

  /** Mengubah SUM(E55:E57) menjadi E55+E56+E57. */
  function bukaSum(rumus) {
    return String(rumus).replace(/SUM\(E(\d+):E(\d+)\)/g, function (_, a, b) {
      const h = [];
      for (let n = +a; n <= +b; n++) h.push('E' + n);
      return h.join('+');
    });
  }

  KDMP.core.rumus = { hitungRumus, bukaSum };
})(globalThis.KDMP);
