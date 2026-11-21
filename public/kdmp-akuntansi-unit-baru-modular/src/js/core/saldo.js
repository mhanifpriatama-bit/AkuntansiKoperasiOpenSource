/*
 * Inti perhitungan saldo akun dari jurnal. Tanpa DOM dan tanpa state global: semua masukan lewat parameter.
 *
 * Aturan periode (P = tahun*12 + bulan yang dilihat):
 *  - baris tanpa tanggal diabaikan; baris setelah P diabaikan;
 *  - akun neraca (golongan 1-3) kumulatif sepanjang waktu; akun laba rugi (4-9) hanya tahun berjalan,
 *    sedangkan `kumulatifSemuaTahun` (cumA) menyimpan semua tahun agar laba tahun lalu bisa dihitung;
 *  - saldo akun = debit - kredit bila saldo normal Debit; kredit - debit bila Kredit.
 */
(function (KDMP) {
  'use strict';
  const { kodeAkun } = KDMP.core.format;
  const coa = KDMP.core.coa;

  /**
   * @param {Array}  rows   baris jurnal {d, no, ak, db, kr, ket, kom}
   * @param {number} tahun
   * @param {number} bulan  1..12
   * @returns {{
   *   cum:Object, cumA:Object, mon:Object, dr:Object, kr:Object, kom:Object, M:Object,
   *   open:number, td:number, tk:number
   * }}
   *   cum   saldo kumulatif (neraca: semua tahun; laba rugi: tahun berjalan)
   *   cumA  saldo kumulatif semua tahun untuk semua akun
   *   mon   mutasi bersih bulan ini
   *   dr/kr total debit/kredit tahun berjalan (neraca saldo)
   *   kom   total per Komponen Arus Kas tahun berjalan (manual + otomatis)
   *   M     saldo neraca bertanda positif menurut sifatnya (aset=debit, kewajiban/ekuitas=kredit)
   *   open  kas awal tahun;  td/tk total debit/kredit seluruh jurnal s.d. periode
   */
  function hitungSaldo(rows, tahun, bulan) {
    coa.terapkanAkunLama(rows);
    const NM = coa.saldoNormal;
    const Y = +tahun;
    const P = Y * 12 + bulan;
    const o = { cum: {}, cumA: {}, mon: {}, dr: {}, kr: {}, kom: {}, open: 0, M: {}, td: 0, tk: 0 };

    rows.forEach(function (r) {
      const c = kodeAkun(r.ak);
      const d = +r.db || 0;
      const k = +r.kr || 0;
      if (!r.d) return;
      const y = +r.d.slice(0, 4);
      const q = y * 12 + +r.d.slice(5, 7);
      if (q > P) return;
      o.td += d;
      o.tk += k;
      if (!NM[c]) return;
      const p = NM[c] == 'Debit' ? d - k : k - d;
      o.cumA[c] = (o.cumA[c] || 0) + p;
      if (c[0] < '4' || y == Y) {
        o.cum[c] = (o.cum[c] || 0) + p;
        o.dr[c] = (o.dr[c] || 0) + d;
        o.kr[c] = (o.kr[c] || 0) + k;
      }
      if (q == P) o.mon[c] = (o.mon[c] || 0) + p;
      if (r.kom && y == Y) o.kom[r.kom] = (o.kom[r.kom] || 0) + p;
      if (c.startsWith('1.1.1.') && (y < Y || /saldo awal/i.test(r.ket || ''))) o.open += p;
    });

    KDMP.core.arusKas.komponenOtomatis(rows, Y, P, (kode) => !!NM[kode]).forEach(function (m) {
      for (const l in m) o.kom[l] = (o.kom[l] || 0) - m[l];
    });

    for (const c in o.cum) {
      const n = NM[c];
      const x = c[0];
      o.M[c] = x == '1' ? (n == 'Debit' ? o.cum[c] : -o.cum[c]) : x == '2' || x == '3' ? (n == 'Kredit' ? o.cum[c] : -o.cum[c]) : 0;
    }
    return o;
  }

  /** Hanya akun laba rugi (golongan 4-9) dari sebuah peta kode -> nilai. */
  function labaRugiAkun(peta) {
    const r = {};
    for (const c in peta) if ('45678'.includes(c[0]) || c[0] == '9') r[c] = peta[c];
    return r;
  }

  /** Pengaruh akun laba rugi terhadap SHU: pendapatan (+), beban (-). */
  function pengaruhSHU(kode, v) {
    const x = kode[0];
    if (x == '4' || x == '7' || kode.startsWith('9.1')) return v;
    if ('568'.includes(x) || kode.startsWith('9.2') || kode.startsWith('9.3')) return -v;
    return 0;
  }

  /** SHU (laba bersih) kumulatif semua tahun s.d. periode. */
  function shu(o) {
    let s = 0;
    for (const c in o.cumA) s += pengaruhSHU(c, o.cumA[c]);
    return s;
  }

  /** SHU tahun-tahun sebelumnya saja (belum ditutup ke ekuitas). */
  function shuTahunSebelumnya(o) {
    let s = 0;
    for (const c in o.cumA) s += pengaruhSHU(c, o.cumA[c] - (o.cum[c] || 0));
    return s;
  }

  KDMP.core.saldo = { hitungSaldo, labaRugiAkun, shu, shuTahunSebelumnya };
})(globalThis.KDMP);
