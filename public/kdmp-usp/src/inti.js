/*
 * Inti hitung aplikasi USP: logika murni tanpa tampilan dan tanpa penyimpanan, dapat diuji di Node.
 * Rupiah = bilangan bulat. Tanggal = 'YYYY-MM-DD'. Kontrak ke akuntansiApp: Spesifikasi Kontrak USP v1.
 *
 *   jadwal(p)                    jadwal angsuran flat | efektif | anuitas
 *   alokasi(jadwal, bayar, jml)  pembagian satu pembayaran: denda -> jasa -> pokok, angsuran tertua dulu
 *   ringkasPinjaman(pinj, trx, tgl, dendaParam)   sisa pokok, tagihan, tunggakan, umur
 *   saldoSimpanan(trx, anggotaId, sub)
 *   bangunDataUsp(o)             jurnal harian ringkas + kontrol + checksum (async)
 */
(function (root, buat) {
  if (typeof module === 'object' && module.exports) module.exports = buat(); else root.USP = buat();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KOM = { PEL: 'Penerimaan Kas dari Pelayanan kepada Anggota', SIM: 'Simpanan Anggota', LAIN: 'Penerimaan Pendapatan Lain-lain' };
  const bulat = Math.round;

  function tambahBulan(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1 + n, 1));
    const akhir = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
    t.setUTCDate(Math.min(d, akhir));
    return t.toISOString().slice(0, 10);
  }
  const selisihHari = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

  /** p: {pokok, tenor, metode:'flat'|'efektif'|'anuitas', suku (per bulan, mis. 0.015), tglCair} -> [{ke, jatuhTempo, pokok, jasa}] */
  function jadwal(p) {
    const { pokok: P, tenor: n, metode, suku: r, tglCair } = p;
    if (!(P > 0) || !(n >= 1) || !(r >= 0)) throw new Error('Pokok, tenor, dan suku jasa tidak valid.');
    if (!['flat', 'efektif', 'anuitas'].includes(metode)) throw new Error('Metode tidak dikenal: ' + metode);
    const A = metode === 'anuitas' ? (r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n))) : 0;
    const out = [];
    let sisa = P;
    for (let ke = 1; ke <= n; ke++) {
      let jasa, pok;
      if (metode === 'flat') { jasa = bulat(P * r); pok = bulat(P / n); }
      else if (metode === 'efektif') { jasa = bulat(sisa * r); pok = bulat(P / n); }
      else { jasa = bulat(sisa * r); pok = bulat(A) - jasa; }
      if (ke === n) pok = sisa; // selisih pembulatan ke angsuran terakhir
      pok = Math.min(pok, sisa);
      out.push({ ke, jatuhTempo: tambahBulan(tglCair, ke), pokok: pok, jasa });
      sisa -= pok;
    }
    return out;
  }

  /** Menyebar total yang sudah dibayar ke angsuran, tertua dulu. Hasil: [{jasaSisa, pokokSisa}] per angsuran. */
  function sisaPerAngsuran(jd, bayarJasa, bayarPokok) {
    let j = bayarJasa, k = bayarPokok;
    return jd.map((a) => {
      const pj = Math.min(a.jasa, j); j -= pj;
      const pk = Math.min(a.pokok, k); k -= pk;
      return { ke: a.ke, jatuhTempo: a.jatuhTempo, jasaSisa: a.jasa - pj, pokokSisa: a.pokok - pk };
    });
  }

  /** bayar: {pokok, jasa} yang sudah dibayar. Mengembalikan {denda, jasa, pokok, lebih}; lebih > 0 berarti melebihi tagihan. */
  function alokasi(jd, bayar, jumlah, denda) {
    let sisa = jumlah;
    const d = Math.min(sisa, denda || 0); sisa -= d;
    let jasa = 0, pokok = 0;
    for (const a of sisaPerAngsuran(jd, bayar.jasa, bayar.pokok)) {
      const j = Math.min(sisa, a.jasaSisa); jasa += j; sisa -= j;
      const k = Math.min(sisa, a.pokokSisa); pokok += k; sisa -= k;
      if (sisa <= 0) break;
    }
    return { denda: d, jasa, pokok, lebih: sisa };
  }

  const efektif = (trx) => (trx || []).filter((t) => !t.dibatalkan);
  const tanda = (t) => (t.pembalik ? -1 : 1);

  /** dendaParam: {mode:'tetap'|'persen', nilai}; bawaan nol sampai kebijakan ditetapkan. */
  function hitungDenda(tunggakan, hari, prm) {
    if (!prm || !(tunggakan > 0) || !(hari > 0)) return 0;
    if (prm.mode === 'tetap') return bulat(prm.nilai || 0);
    if (prm.mode === 'persen') return bulat(tunggakan * (prm.nilai || 0) * hari);
    return 0;
  }

  function ringkasPinjaman(pinj, trx, tgl, dendaParam) {
    const jd = pinj.jadwal;
    const mine = efektif(trx).filter((t) => t.pinjamanId === pinj.id && t.jenis === 'angsur' && t.tgl <= tgl);
    const bayar = mine.reduce((s, t) => ({ pokok: s.pokok + tanda(t) * t.pokok, jasa: s.jasa + tanda(t) * t.jasa }), { pokok: 0, jasa: 0 });
    const sisa = sisaPerAngsuran(jd, bayar.jasa, bayar.pokok);
    const jatuh = sisa.filter((a) => a.jatuhTempo <= tgl && (a.jasaSisa > 0 || a.pokokSisa > 0));
    const tunggakan = jatuh.reduce((s, a) => s + a.jasaSisa + a.pokokSisa, 0);
    const umur = jatuh.length ? selisihHari(jatuh[0].jatuhTempo, tgl) : 0;
    return {
      sisaPokok: pinj.pokok - bayar.pokok, sisaJasa: jd.reduce((s, a) => s + a.jasa, 0) - bayar.jasa,
      tunggakan, umur, angsuranTunggak: jatuh.length, bayar,
      lunas: pinj.pokok - bayar.pokok <= 0, dendaDisarankan: hitungDenda(tunggakan, umur, dendaParam)
    };
  }

  function saldoSimpanan(trx, anggotaId, sub) {
    return efektif(trx).filter((t) => t.anggotaId === anggotaId && t.sub === sub && (t.jenis === 'simpan' || t.jenis === 'tarik'))
      .reduce((s, t) => s + tanda(t) * (t.jenis === 'simpan' ? t.jumlah : -t.jumlah), 0);
  }

  // ---------- Ekspor jurnal ke akuntansiApp ----------
  const URUT = ['SIMPAN', 'TARIK', 'CAIR', 'ANGSUR', 'ADMIN', 'SETOR'];
  const JENIS_TRX = { simpan: 'SIMPAN', tarik: 'TARIK', cair: 'CAIR', angsur: 'ANGSUR', adm: 'ADMIN', setorBank: 'SETOR' };

  async function sha256(teks) {
    const h = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(teks));
    return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  async function checksum(jurnal) {
    const J = jurnal.map((r) => ({ d: r.d, no: r.no, ak: r.ak, db: r.db, kr: r.kr, ket: r.ket, kom: r.kom || undefined }));
    return sha256(JSON.stringify([J]));
  }

  /**
   * o: {template, trx, dari, sampai, idBatch, dibuat, crkPersen?}
   * Transaksi pembalik (pembalik:true) memuat angka asli dan diekspor sebagai baris berlawanan.
   */
  async function bangunDataUsp(o) {
    const T = o.template, P = T.pemetaan;
    const nama = {}, normal = {};
    T.coa.forEach((a) => { nama[a[0]] = a[0] + ' ' + a[1]; normal[a[0]] = a[2]; });
    const akun = (kode) => { if (!nama[kode]) throw new Error('Akun ' + kode + ' tidak ada di template.'); return nama[kode]; };
    const kas = (cara) => (cara === 'bank' ? P.bank : P.kasTunai);
    const aktif = efektif(o.trx).filter((t) => t.tgl >= o.dari && t.tgl <= o.sampai && JENIS_TRX[t.jenis]);
    const hari = [...new Set(aktif.map((t) => t.tgl))].sort();
    const jurnal = [];
    for (const tgl of hari) {
      const ymd = tgl.replace(/-/g, '');
      for (const J of URUT) {
        const grup = aktif.filter((t) => t.tgl === tgl && JENIS_TRX[t.jenis] === J);
        if (!grup.length) continue;
        const no = 'USP-' + ymd + '-' + J;
        const jml = (f, saring) => grup.filter(saring || (() => true)).reduce((s, t) => s + tanda(t) * (f(t) || 0), 0);
        const baris = (kode, debit, ket, kom) => {
          if (!debit) return;
          const r = { d: tgl, no, ak: akun(kode), db: debit > 0 ? debit : 0, kr: debit < 0 ? -debit : 0, ket };
          if (kom) r.kom = kom;
          jurnal.push(r);
        };
        const perCara = (f, c) => jml(f, (t) => (t.cara || 'tunai') === c);
        if (J === 'SIMPAN') {
          baris(P.kasTunai, perCara((t) => t.jumlah, 'tunai'), 'Setoran simpanan tunai', KOM.SIM);
          baris(P.bank, perCara((t) => t.jumlah, 'bank'), 'Setoran simpanan transfer', KOM.SIM);
          for (const [sub, peran] of [['pokok', 'simpananPokok'], ['wajib', 'simpananWajib'], ['sukarela', 'simpananSukarela']]) {
            baris(P[peran], -jml((t) => t.jumlah, (t) => t.sub === sub), 'Setoran simpanan ' + sub);
          }
        } else if (J === 'TARIK') {
          baris(P.simpananSukarela, jml((t) => t.jumlah), 'Penarikan simpanan sukarela');
          baris(P.kasTunai, -perCara((t) => t.jumlah, 'tunai'), 'Penarikan simpanan sukarela', KOM.SIM);
          baris(P.bank, -perCara((t) => t.jumlah, 'bank'), 'Penarikan simpanan sukarela', KOM.SIM);
        } else if (J === 'CAIR') {
          const neto = (t) => t.pokok - (t.provisi || 0) - (t.crk || 0);
          baris(P.kredit, jml((t) => t.pokok), 'Pencairan pinjaman');
          baris(P.kasTunai, -perCara(neto, 'tunai'), 'Pencairan pinjaman (neto provisi dan Dana CRK)', KOM.PEL);
          baris(P.bank, -perCara(neto, 'bank'), 'Pencairan pinjaman (neto provisi dan Dana CRK)', KOM.PEL);
          baris(P.provisi, -jml((t) => t.provisi), 'Provisi pinjaman');
          baris(P.crk, -jml((t) => t.crk), 'Dana CRK' + (o.crkPersen ? ' ' + o.crkPersen + '%' : ''));
        } else if (J === 'ANGSUR') {
          const pj = (t) => t.pokok + t.jasa;
          baris(P.kasTunai, perCara(pj, 'tunai'), 'Angsuran pokok dan jasa tunai', KOM.PEL);
          baris(P.bank, perCara(pj, 'bank'), 'Angsuran pokok dan jasa transfer', KOM.PEL);
          baris(P.kasTunai, perCara((t) => t.denda, 'tunai'), 'Denda keterlambatan tunai', KOM.LAIN);
          baris(P.bank, perCara((t) => t.denda, 'bank'), 'Denda keterlambatan transfer', KOM.LAIN);
          baris(P.kredit, -jml((t) => t.pokok), 'Angsuran pokok');
          baris(P.jasaPinjaman, -jml((t) => t.jasa), 'Jasa pinjaman');
          baris(P.denda, -jml((t) => t.denda), 'Denda keterlambatan');
        } else if (J === 'ADMIN') {
          baris(P.kasTunai, perCara((t) => t.jumlah, 'tunai'), 'Biaya administrasi anggota', KOM.LAIN);
          baris(P.bank, perCara((t) => t.jumlah, 'bank'), 'Biaya administrasi anggota', KOM.LAIN);
          baris(P.provisi, -jml((t) => t.jumlah), 'Biaya administrasi anggota');
        } else if (J === 'SETOR') {
          baris(P.bank, jml((t) => t.jumlah), 'Setoran kas ke bank');
          baris(P.kasTunai, -jml((t) => t.jumlah), 'Setoran kas ke bank');
        }
      }
    }
    const totalDebit = jurnal.reduce((s, r) => s + r.db, 0), totalKredit = jurnal.reduce((s, r) => s + r.kr, 0);
    const saldo = Object.assign({}, T.saldoReferensi);
    jurnal.forEach((r) => {
      const kode = r.ak.split(' ')[0];
      if (!'123'.includes(kode[0])) return;
      saldo[kode] = (saldo[kode] || 0) + (normal[kode] === 'Debit' ? r.db - r.kr : r.kr - r.db);
    });
    const saldoAkhir = {};
    Object.keys(saldo).sort().forEach((k) => { saldoAkhir[k] = saldo[k]; });
    return {
      app: 'kdmp-usp-data', versi: 1, idBatch: o.idBatch, idTemplat: T.idTemplat, unit: 'USP', dibuat: o.dibuat,
      periode: { dari: o.dari, sampai: o.sampai }, jurnal,
      kontrol: { jumlahJurnal: jurnal.length, totalDebit, totalKredit, saldoAkhir, checksum: await checksum(jurnal) }
    };
  }

  return { KOM, tambahBulan, selisihHari, jadwal, alokasi, hitungDenda, ringkasPinjaman, saldoSimpanan, bangunDataUsp, checksum, sisaPerAngsuran };
});
