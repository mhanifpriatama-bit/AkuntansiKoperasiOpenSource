/*
 * Mesin POS: mengubah daftar transaksi menjadi mutasi stok (FIFO) dan jurnal harian sesuai kontrak v1.1.
 * Murni logika, tanpa DOM. Masukan: state {tpl, barang, pelanggan, pemasok, tx}. Keluaran: hitung(state).
 *
 * Transaksi (semua punya id, tgl ISO, jenis):
 *   JUAL      {pelanggan?, item:[{k,q,harga}], tunai, bank, kredit}
 *   PELUNASAN {pelanggan, tunai, bank}
 *   BELI      {pemasok, faktur, item:[{k,q,h}], cara:'tunai'|'bank'|'kredit'}
 *   BAYAR     {pemasok, jumlah, dari:'tunai'|'bank'}
 *   RJUAL     {ref (id JUAL), pelanggan?, item:[{k,q}], cara:'tunai'|'bank'|'piutang'}
 *   RBELI     {ref (id BELI), item:[{k,q}], cara:'tunai'|'bank'|'utang'}
 *   OPNAME    {item:[{k,fisik}]}
 *   SETOR     {jumlah}
 */
(function (POS) {
  'use strict';
  const EPS = 1e-9;
  const bulat = (x) => Math.round(x + (x < 0 ? -1e-9 : 1e-9));
  const KOM = {
    anggota: 'Penerimaan Kas dari Pelayanan kepada Anggota',
    non: 'Penerimaan Kas dari Non Anggota',
    beli: 'Pembelian Harga Pokok Barang'
  };
  const PERINGKAT = { 'Saldo Awal': 0, Masuk: 1, Keluar: 2 };
  const tglNo = (d) => d.replace(/-/g, '');

  /** FIFO murni (sama dengan akuntansiApp). m: [{d,no,k,j,q,h,lot}], batas: ISO inklusif (opsional). */
  function fifo(m, batas) {
    const urut = m.map((t, i) => ({ t, i })).filter((x) => !batas || x.t.d <= batas)
      .sort((a, b) => (a.t.d < b.t.d ? -1 : a.t.d > b.t.d ? 1 : PERINGKAT[a.t.j] - PERINGKAT[b.t.j] || a.i - b.i));
    const per = {}; // k -> {q, lapisan:[{id,q,h}]}
    const biaya = new Map();
    const minus = new Set();
    urut.forEach(({ t }) => {
      const r = per[t.k] || (per[t.k] = { q: 0, lapisan: [] });
      if (t.j === 'Keluar') {
        let sisa = t.q, nilai = 0;
        const ambil = (l) => { const x = Math.min(sisa, l.q); if (x > 0) { nilai += x * l.h; l.q -= x; sisa -= x; } };
        if (t.lot) r.lapisan.filter((l) => l.id === t.lot).forEach(ambil);
        r.lapisan.forEach(ambil);
        r.lapisan = r.lapisan.filter((l) => l.q > EPS);
        if (sisa > EPS) minus.add(t.k);
        r.q -= t.q;
        biaya.set(t, bulat(nilai));
      } else {
        r.q += t.q;
        if (t.q > 0) r.lapisan.push({ id: t.no || '', q: t.q, h: t.h });
      }
    });
    return { per, biaya, minus };
  }

  const urutTx = (tx) => tx.slice().sort((a, b) => (a.tgl < b.tgl ? -1 : a.tgl > b.tgl ? 1 : a.urut - b.urut));
  const jumlahItem = (items, f) => items.reduce((s, x) => s + f(x), 0);
  const totalJual = (t) => jumlahItem(t.item, (x) => bulat(x.q * x.harga));

  /** Status anggota pelanggan; transaksi tanpa pelanggan = non-anggota. */
  const anggota = (S, id) => { const p = S.pelanggan.find((x) => x.id === id); return !!(p && p.anggota); };
  const akunBarang = (S, k) => { const b = S.barang.find((x) => x.k === k); return (b && b.akun) || ''; };

  /**
   * @returns {{mutasi:Array, jurnal:Array, galat:Array, stok:Object, nomorBeli:Object, hppJual:Object, saldo:Object, piutang:Object, utang:Object}}
   */
  function hitung(S) {
    const pem = S.tpl.pemetaan;
    const galat = [];
    const tx = urutTx(S.tx);
    const kasAkun = (cara) => (cara === 'bank' ? pem.bank : pem.kasTunai);
    const utangAkun = (id) => { const p = S.pemasok.find((x) => x.id === id); return (p && p.akun) || pem.utangUsaha; };

    // Nomor dokumen BELI/RBELI: -nnn per hari per jenis menurut urutan input
    const nomorBeli = {}, nomorRbeli = {};
    const cacah = {};
    tx.forEach((t) => {
      if (t.jenis !== 'BELI' && t.jenis !== 'RBELI') return;
      const kunci = t.jenis + t.tgl;
      cacah[kunci] = (cacah[kunci] || 0) + 1;
      const no = 'POS-' + tglNo(t.tgl) + '-' + t.jenis + '-' + String(cacah[kunci]).padStart(3, '0');
      (t.jenis === 'BELI' ? nomorBeli : nomorRbeli)[t.id] = no;
    });

    // Mutasi dasar: stok awal, pembelian, penjualan, retur pembelian
    const M = [];
    (S.tpl.stokAwal || []).forEach((s, i) => M.push({ d: s.tgl, no: s.lot || 'SA-' + (i + 1), k: s.k, j: 'Saldo Awal', q: +s.q, h: +s.h, ket: '' }));
    const baris = (d, no, k, j, q, h, ket, lot, ref) => { const r = { d, no, k, j, q, h, ket: ket || '' }; if (lot) r.lot = lot; r._ref = ref; return r; };
    tx.forEach((t) => {
      if (t.jenis === 'BELI') t.item.forEach((x) => M.push(baris(t.tgl, nomorBeli[t.id], x.k, 'Masuk', x.q, x.h, 'Faktur ' + (t.faktur || ''), null, t)));
    });
    const perHari = (jenis, f) => {
      const grup = {};
      tx.filter((t) => t.jenis === jenis).forEach((t) => t.item.forEach((x) => { const g = (grup[t.tgl + '|' + x.k] = grup[t.tgl + '|' + x.k] || { d: t.tgl, k: x.k, q: 0, h: 0, n: 0 }); f(g, x, t); }));
      return Object.values(grup);
    };
    perHari('JUAL', (g, x) => { g.q += x.q; }).forEach((g) => M.push(baris(g.d, 'POS-' + tglNo(g.d) + '-JUAL', g.k, 'Keluar', g.q, 0, 'Penjualan harian')));
    tx.forEach((t) => {
      if (t.jenis !== 'RBELI') return;
      const asal = tx.find((x) => x.id === t.ref);
      t.item.forEach((x) => M.push(baris(t.tgl, nomorRbeli[t.id], x.k, 'Keluar', x.q, 0, 'Retur pembelian', asal ? nomorBeli[asal.id] : '', t)));
    });
    const F1 = fifo(M);
    const hppJual = {}; // 'tgl|k' -> HPP per satuan penjualan hari itu
    M.forEach((r) => { if (r.j === 'Keluar' && r.no.endsWith('-JUAL')) hppJual[r.d + '|' + r.k] = F1.biaya.get(r) / r.q; });

    // Retur penjualan: Masuk pada HPP per satuan penjualan asal
    const rj = {};
    tx.filter((t) => t.jenis === 'RJUAL').forEach((t) => {
      const asal = tx.find((x) => x.id === t.ref);
      t.item.forEach((x) => {
        const h = asal ? hppJual[asal.tgl + '|' + x.k] : undefined;
        if (h === undefined) { galat.push('Retur penjualan ' + t.tgl + ': barang ' + x.k + ' tidak ada pada penjualan asal.'); return; }
        const g = (rj[t.tgl + '|' + x.k] = rj[t.tgl + '|' + x.k] || { d: t.tgl, k: x.k, q: 0, nilai: 0 });
        g.q += x.q; g.nilai += x.q * h; x._hpp = h;
      });
    });
    Object.values(rj).forEach((g) => M.push(baris(g.d, 'POS-' + tglNo(g.d) + '-RJUAL', g.k, 'Masuk', g.q, g.nilai / g.q, 'Retur penjualan')));
    const F2 = fifo(M);

    // Opname: selisih terhadap stok sistem akhir hari itu
    const opname = [];
    tx.filter((t) => t.jenis === 'OPNAME').forEach((t) => t.item.forEach((x) => {
      const f = fifo(M.concat(opname), t.tgl).per[x.k] || { q: 0, lapisan: [] };
      const sel = Math.round((x.fisik - f.q) * 1e6) / 1e6;
      x._sistem = f.q; x._selisih = sel;
      if (Math.abs(sel) < EPS) return;
      if (sel < 0) opname.push(baris(t.tgl, 'POS-' + tglNo(t.tgl) + '-OPNAME', x.k, 'Keluar', -sel, 0, 'Selisih opname'));
      else {
        const akhir = f.lapisan.length ? f.lapisan[f.lapisan.length - 1].h : (S.barang.find((b) => b.k === x.k) || {}).hargaBeli;
        if (!(akhir > 0)) { galat.push('Opname ' + t.tgl + ': harga beli barang ' + x.k + ' belum ada, tidak bisa menilai selisih lebih.'); return; }
        opname.push(baris(t.tgl, 'POS-' + tglNo(t.tgl) + '-OPNAME', x.k, 'Masuk', sel, akhir, 'Selisih opname'));
      }
    }));
    // Gabungkan baris opname per hari per barang
    const gabung = {};
    opname.forEach((r) => { const kk = r.d + '|' + r.k + '|' + r.j; if (gabung[kk]) { gabung[kk].h = (gabung[kk].h * gabung[kk].q + r.h * r.q) / (gabung[kk].q + r.q); gabung[kk].q += r.q; } else gabung[kk] = r; });
    Object.values(gabung).forEach((r) => M.push(r));
    const F = fifo(M);
    F.minus.forEach((k) => galat.push('Stok minus pada barang ' + k + ': penjualan/retur/opname melebihi stok.'));

    // Nilai akhir tiap mutasi dan keluaran mutasiStok
    const mutasi = M.filter((r) => r.j !== 'Saldo Awal').map((r) => {
      const nilai = r.j === 'Keluar' ? F.biaya.get(r) : bulat(r.q * r.h);
      const o = { d: r.d, no: r.no, k: r.k, j: r.j, q: r.q, h: r.j === 'Keluar' ? Math.round((nilai / r.q) * 100) / 100 : Math.round(r.h * 100) / 100, nilai, ket: r.ket };
      if (r.lot) o.lot = r.lot;
      return o;
    });
    // Peta nilai Keluar/Masuk per (hari, jenis, barang) untuk jurnal
    const nilaiPer = {};
    mutasi.forEach((r) => { const jenis = r.no.replace(/^POS-\d{8}-/, '').replace(/-\d+$/, ''); const kk = r.d + '|' + jenis + '|' + r.k + '|' + r.j; nilaiPer[kk] = (nilaiPer[kk] || 0) + r.nilai; });
    const nilaiHari = (d, jenis, j) => Object.keys(nilaiPer).filter((kk) => kk.startsWith(d + '|' + jenis + '|') && kk.endsWith('|' + j)).map((kk) => ({ k: kk.split('|')[2], nilai: nilaiPer[kk] }));

    // Jurnal
    const jurnal = [];
    const J = (d, no, akun, db, kr, ket, kom) => {
      if (!db && !kr) return;
      const r = { d, no, ak: akun + ' ' + namaAkun(S, akun), db: db || 0, kr: kr || 0, ket };
      if (kom) r.kom = kom;
      jurnal.push(r);
    };
    const perAkunPersediaan = (daftar) => { const a = {}; daftar.forEach((x) => { const ak = akunBarang(S, x.k) || '(akun belum diisi)'; a[ak] = (a[ak] || 0) + x.nilai; }); return Object.keys(a).sort().map((ak) => [ak, a[ak]]); };
    const hari = (jenis) => [...new Set(tx.filter((t) => t.jenis === jenis).map((t) => t.tgl))];

    hari('JUAL').forEach((d) => {
      const no = 'POS-' + tglNo(d) + '-JUAL';
      const ts = tx.filter((t) => t.jenis === 'JUAL' && t.tgl === d);
      const kas = {}; let piutang = 0, total = 0;
      ts.forEach((t) => {
        const tot = totalJual(t); total += tot;
        const ang = anggota(S, t.pelanggan);
        const dibayar = (t.tunai || 0) + (t.bank || 0) + (t.kredit || 0);
        if (dibayar !== tot) galat.push('Penjualan ' + d + ': pembayaran ' + dibayar + ' tidak sama dengan total ' + tot + '.');
        [['tunai', t.tunai], ['bank', t.bank]].forEach(([c, v]) => { if (v) { const kk = c + '|' + (ang ? 'a' : 'n'); kas[kk] = (kas[kk] || 0) + v; } });
        piutang += t.kredit || 0;
      });
      ['tunai|a', 'tunai|n', 'bank|a', 'bank|n'].forEach((kk) => { if (kas[kk]) { const [c, a] = kk.split('|'); J(d, no, kasAkun(c), kas[kk], 0, 'Penjualan ' + (c === 'bank' ? 'non-tunai' : 'tunai') + (a === 'a' ? ' anggota' : ' non-anggota'), a === 'a' ? KOM.anggota : KOM.non); } });
      J(d, no, pem.piutang, piutang, 0, 'Penjualan kredit');
      J(d, no, pem.penjualan, 0, total, 'Penjualan harian');
      const per = perAkunPersediaan(nilaiHari(d, 'JUAL', 'Keluar'));
      J(d, no, pem.hpp, per.reduce((s, x) => s + x[1], 0), 0, 'HPP penjualan harian');
      per.forEach(([ak, v]) => J(d, no, ak, 0, v, 'HPP penjualan harian'));
    });

    hari('PELUNASAN').forEach((d) => {
      const no = 'POS-' + tglNo(d) + '-PELUNASAN';
      const kas = {}; let total = 0;
      tx.filter((t) => t.jenis === 'PELUNASAN' && t.tgl === d).forEach((t) => {
        const ang = anggota(S, t.pelanggan);
        [['tunai', t.tunai], ['bank', t.bank]].forEach(([c, v]) => { if (v) { const kk = c + '|' + (ang ? 'a' : 'n'); kas[kk] = (kas[kk] || 0) + v; total += v; } });
      });
      ['tunai|a', 'tunai|n', 'bank|a', 'bank|n'].forEach((kk) => { if (kas[kk]) { const [c, a] = kk.split('|'); J(d, no, kasAkun(c), kas[kk], 0, 'Pelunasan piutang' + (a === 'a' ? ' anggota' : ' non-anggota'), a === 'a' ? KOM.anggota : KOM.non); } });
      J(d, no, pem.piutang, 0, total, 'Pelunasan piutang');
    });

    tx.filter((t) => t.jenis === 'BELI').forEach((t) => {
      const no = nomorBeli[t.id];
      const tot = jumlahItem(t.item, (x) => bulat(x.q * x.h));
      const per = perAkunPersediaan(t.item.map((x) => ({ k: x.k, nilai: bulat(x.q * x.h) })));
      per.forEach(([ak, v]) => J(t.tgl, no, ak, v, 0, 'Pembelian faktur ' + (t.faktur || '')));
      if (t.cara === 'kredit') J(t.tgl, no, utangAkun(t.pemasok), 0, tot, 'Pembelian faktur ' + (t.faktur || ''));
      else J(t.tgl, no, kasAkun(t.cara), 0, tot, 'Pembelian faktur ' + (t.faktur || ''));
    });

    hari('BAYAR').forEach((d) => {
      const no = 'POS-' + tglNo(d) + '-BAYAR';
      const utang = {}, kas = {};
      tx.filter((t) => t.jenis === 'BAYAR' && t.tgl === d).forEach((t) => { const a = utangAkun(t.pemasok); utang[a] = (utang[a] || 0) + t.jumlah; kas[t.dari] = (kas[t.dari] || 0) + t.jumlah; });
      Object.keys(utang).sort().forEach((a) => J(d, no, a, utang[a], 0, 'Pembayaran utang pemasok'));
      Object.keys(kas).sort().forEach((c) => J(d, no, kasAkun(c), 0, kas[c], 'Pembayaran utang pemasok'));
    });

    hari('RJUAL').forEach((d) => {
      const no = 'POS-' + tglNo(d) + '-RJUAL';
      const kas = {}; let piutang = 0, total = 0;
      tx.filter((t) => t.jenis === 'RJUAL' && t.tgl === d).forEach((t) => {
        const asal = tx.find((x) => x.id === t.ref);
        const nilai = jumlahItem(t.item, (x) => { const j = asal && asal.item.find((y) => y.k === x.k); return bulat(x.q * (j ? j.harga : 0)); });
        total += nilai;
        if (t.cara === 'piutang') piutang += nilai;
        else { const kk = t.cara + '|' + (anggota(S, asal && asal.pelanggan) ? 'a' : 'n'); kas[kk] = (kas[kk] || 0) + nilai; }
      });
      J(d, no, pem.penjualan, total, 0, 'Retur penjualan');
      const per = perAkunPersediaan(nilaiHari(d, 'RJUAL', 'Masuk'));
      per.forEach(([ak, v]) => J(d, no, ak, v, 0, 'Barang retur kembali ke stok'));
      ['tunai|a', 'tunai|n', 'bank|a', 'bank|n'].forEach((kk) => { if (kas[kk]) { const [c, a] = kk.split('|'); J(d, no, kasAkun(c), 0, kas[kk], 'Pengembalian dana retur', a === 'a' ? KOM.anggota : KOM.non); } });
      J(d, no, pem.piutang, 0, piutang, 'Retur penjualan kredit');
      J(d, no, pem.hpp, 0, per.reduce((s, x) => s + x[1], 0), 'HPP retur penjualan');
    });

    tx.filter((t) => t.jenis === 'RBELI').forEach((t) => {
      const no = nomorRbeli[t.id];
      const per = perAkunPersediaan(nilaiHari(t.tgl, 'RBELI', 'Keluar').filter((x) => t.item.some((y) => y.k === x.k)).map((x) => ({ k: x.k, nilai: mutasi.filter((m) => m.no === no && m.k === x.k).reduce((s, m) => s + m.nilai, 0) })));
      const tot = per.reduce((s, x) => s + x[1], 0);
      if (t.cara === 'utang') { const asal = tx.find((x) => x.id === t.ref); J(t.tgl, no, utangAkun(asal && asal.pemasok), tot, 0, 'Retur pembelian'); }
      else J(t.tgl, no, kasAkun(t.cara), tot, 0, 'Retur pembelian', KOM.beli);
      per.forEach(([ak, v]) => J(t.tgl, no, ak, 0, v, 'Retur pembelian'));
    });

    hari('OPNAME').forEach((d) => {
      const no = 'POS-' + tglNo(d) + '-OPNAME';
      const kurang = perAkunPersediaan(nilaiHari(d, 'OPNAME', 'Keluar')), lebih = perAkunPersediaan(nilaiHari(d, 'OPNAME', 'Masuk'));
      const tk = kurang.reduce((s, x) => s + x[1], 0), tl = lebih.reduce((s, x) => s + x[1], 0);
      J(d, no, pem.selisihOpnameKurang, tk, 0, 'Selisih stok kurang');
      lebih.forEach(([ak, v]) => J(d, no, ak, v, 0, 'Selisih stok lebih'));
      kurang.forEach(([ak, v]) => J(d, no, ak, 0, v, 'Selisih stok kurang'));
      J(d, no, pem.selisihOpnameLebih, 0, tl, 'Selisih stok lebih');
    });

    hari('SETOR').forEach((d) => {
      const no = 'POS-' + tglNo(d) + '-SETOR';
      const tot = tx.filter((t) => t.jenis === 'SETOR' && t.tgl === d).reduce((s, t) => s + t.jumlah, 0);
      J(d, no, pem.bank, tot, 0, 'Setoran kas ke bank');
      J(d, no, pem.kasTunai, 0, tot, 'Setoran kas ke bank');
    });

    // Pemeriksaan keseimbangan tiap No Bukti
    const per = {};
    jurnal.forEach((r) => { const s = (per[r.no] = per[r.no] || { db: 0, kr: 0 }); s.db += r.db; s.kr += r.kr; });
    Object.keys(per).forEach((no) => { if (per[no].db !== per[no].kr) galat.push('Jurnal ' + no + ' tidak seimbang (' + per[no].db + ' vs ' + per[no].kr + ').'); });

    // Saldo akun (menurut sifat normal) dari saldo referensi template + jurnal; piutang/utang per pihak
    const coaNormal = {};
    (S.tpl.coa || []).forEach((a) => { coaNormal[a[0]] = a[2]; });
    const saldoPada = (sampai) => {
      const s = Object.assign({}, S.tpl.saldoReferensi || {});
      jurnal.forEach((r) => {
        if (sampai && r.d > sampai) return;
        const kode = r.ak.split(' ')[0];
        if (!/^(1\.1\.1\.|1\.1\.2\.|1\.1\.4\.|2\.1\.3\.)/.test(kode)) return;
        s[kode] = (s[kode] || 0) + (coaNormal[kode] === 'Kredit' ? r.kr - r.db : r.db - r.kr);
      });
      return s;
    };
    const piutang = {}, utang = {};
    S.pelanggan.forEach((p) => { piutang[p.id] = p.saldoAwal || 0; });
    S.pemasok.forEach((p) => { utang[p.id] = p.saldoAwal || 0; });
    tx.forEach((t) => {
      if (t.jenis === 'JUAL' && t.pelanggan) piutang[t.pelanggan] = (piutang[t.pelanggan] || 0) + (t.kredit || 0);
      if (t.jenis === 'PELUNASAN') piutang[t.pelanggan] = (piutang[t.pelanggan] || 0) - (t.tunai || 0) - (t.bank || 0);
      if (t.jenis === 'BELI' && t.cara === 'kredit') utang[t.pemasok] = (utang[t.pemasok] || 0) + jumlahItem(t.item, (x) => bulat(x.q * x.h));
      if (t.jenis === 'BAYAR') utang[t.pemasok] = (utang[t.pemasok] || 0) - t.jumlah;
    });
    return { mutasi, jurnal, galat, stok: F.per, nomorBeli, nomorRbeli, hppJual, saldoPada, piutang, utang, tx };
  }

  function namaAkun(S, kode) { const a = (S.tpl.coa || []).find((x) => x[0] === kode); return a ? a[1] : ''; }

  POS.mesin = { hitung, fifo, KOM, bulat, totalJual };
})(globalThis.POS = globalThis.POS || {});
