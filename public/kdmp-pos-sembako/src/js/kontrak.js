/*
 * Kontrak pertukaran dengan akuntansiApp (spesifikasi v1.1): baca template, bangun berkas data POS (JSON) beserta total kontrol.
 */
(function (POS) {
  'use strict';

  /** SHA-256 heksadesimal dari JSON.stringify([jurnal, mutasiStok, barangBaru]) dengan urutan kunci tetap. Harus sama dengan akuntansiApp. */
  async function hitungChecksum(jurnal, mutasi, barangBaru) {
    const J = jurnal.map((r) => ({ d: r.d, no: r.no, ak: r.ak, db: r.db, kr: r.kr, ket: r.ket, kom: r.kom }));
    const M = mutasi.map((r) => ({ d: r.d, no: r.no, k: r.k, j: r.j, q: r.q, h: r.h, nilai: r.nilai, ket: r.ket, lot: r.lot }));
    const B = barangBaru.map((r) => ({ k: r.k, n: r.n, akun: r.akun }));
    const h = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([J, M, B])));
    return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /** Memeriksa berkas template; mengembalikan teks galat atau null. */
  function periksaTemplat(t) {
    if (!t || typeof t !== 'object' || t.app !== 'kdmp-pos-template') return 'Bukan berkas template POS (app harus kdmp-pos-template).';
    if (t.versi !== 1) return 'Versi template ' + t.versi + ' tidak didukung.';
    if (!t.idTemplat || !t.unit || !t.periode || !Array.isArray(t.coa) || !t.pemetaan) return 'Template tidak lengkap.';
    return null;
  }

  /** Barang yang dibuat di POS dan belum ada di template. */
  const barangBaru = (S) => S.barang.filter((b) => b.k && !(S.tpl.barang || []).some((x) => x.k === b.k)).map((b) => ({ k: b.k, n: b.n, akun: b.akun }));

  /**
   * @param {object} S state, @param {object} H hasil POS.mesin.hitung(S)
   * @param {{dari:string, sampai:string, idBatch:string, now:string}} o
   */
  async function bangunData(S, H, o) {
    const dalam = (r) => r.d >= o.dari && r.d <= o.sampai;
    const jurnal = H.jurnal.filter(dalam).map((r) => { const x = { d: r.d, no: r.no, ak: r.ak, db: r.db, kr: r.kr, ket: r.ket }; if (r.kom) x.kom = r.kom; return x; });
    const mutasi = H.mutasi.filter(dalam).map((r) => { const x = { d: r.d, no: r.no, k: r.k, j: r.j, q: r.q, h: r.h, nilai: r.nilai, ket: r.ket }; if (r.lot) x.lot = r.lot; return x; });
    const baru = barangBaru(S);
    const saldo = H.saldoPada(o.sampai), saldoAkhir = {};
    Object.keys(saldo).sort().forEach((k) => { saldoAkhir[k] = Math.round(saldo[k]); });
    return {
      app: 'kdmp-pos-data', versi: 1, idBatch: o.idBatch, idTemplat: S.tpl.idTemplat, unit: S.tpl.unit, dibuat: o.now,
      periode: { dari: o.dari, sampai: o.sampai }, jurnal, mutasiStok: mutasi, barangBaru: baru,
      kontrol: {
        jumlahJurnal: jurnal.length, jumlahMutasi: mutasi.length,
        totalDebit: jurnal.reduce((s, r) => s + r.db, 0), totalKredit: jurnal.reduce((s, r) => s + r.kr, 0),
        saldoAkhir, checksum: await hitungChecksum(jurnal, mutasi, baru)
      }
    };
  }

  POS.kontrak = { hitungChecksum, periksaTemplat, barangBaru, bangunData };
})(globalThis.POS = globalThis.POS || {});
