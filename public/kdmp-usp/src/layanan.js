/*
 * Aturan transaksi aplikasi USP: logika murni di atas objek data (tanpa tampilan, tanpa penyimpanan).
 * Setiap fungsi mengubah `data` hanya bila sah, dan mengembalikan {ok:true, ...} atau {ok:false, galat:'...'}.
 * Tidak ada penghapusan: kesalahan dikoreksi dengan transaksi pembalik.
 */
(function (root, buat) {
  if (typeof module === 'object' && module.exports) module.exports = buat(require('./inti.js')); else root.USPL = buat(root.USP);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (U) {
  'use strict';
  const uuid = () => globalThis.crypto.randomUUID();
  const gagal = (galat) => ({ ok: false, galat });
  const bulat = Math.round;
  const TGL = /^\d{4}-\d{2}-\d{2}$/;

  function dataBaru() {
    return {
      versi: 1, anggota: [], pinjaman: [], trx: [], tutup: {}, batch: [], audit: [], seq: { anggota: 0, pinjaman: 0 }, template: null,
      param: { provisiPersen: 1, crkPersen: 1, sukuBawaan: 0.015, denda: null, izinkanTidakAktif: false }
    };
  }
  const catat = (data, oleh, aksi, detail) => data.audit.push({ ts: new Date().toISOString(), oleh: oleh || '', aksi, detail: detail || '' });
  const efektif = (data) => data.trx.filter((t) => !t.dibatalkan);

  function cekUmum(data, t, hariIni) {
    if (!TGL.test(t.tgl || '')) return 'Tanggal tidak valid.';
    if (hariIni && t.tgl > hariIni) return 'Tanggal depan tidak diizinkan.';
    if (data.tutup[t.tgl]) return 'Kas tanggal ' + t.tgl + ' sudah ditutup. Koreksi lewat transaksi pembalik pada tanggal yang masih terbuka.';
    if (!t.kasir || !String(t.kasir).trim()) return 'Nama kasir wajib diisi.';
    return '';
  }
  function cekAnggota(data, id) {
    const a = data.anggota.find((x) => x.id === id);
    if (!a) return { galat: 'Anggota tidak ditemukan.' };
    if (a.status === 'keluar') return { galat: 'Anggota sudah keluar.' };
    if (a.status === 'tidak aktif' && !data.param.izinkanTidakAktif) return { galat: 'Anggota tidak aktif.' };
    return { a };
  }
  const bilangan = (x) => Number.isInteger(x) && x > 0;

  function tambahAnggota(data, f, oleh) {
    const nama = String(f.nama || '').trim();
    if (nama.length < 2) return gagal('Nama anggota minimal 2 karakter.');
    data.seq.anggota += 1;
    const a = { id: uuid(), no: String(f.no || 'A' + String(data.seq.anggota).padStart(4, '0')), nama, alamat: f.alamat || '', telepon: f.telepon || '', tglMasuk: f.tglMasuk || '', status: 'aktif' };
    if (data.anggota.some((x) => x.no === a.no)) return gagal('Nomor anggota sudah dipakai: ' + a.no);
    data.anggota.push(a);
    catat(data, oleh, 'anggota.tambah', a.no + ' ' + a.nama);
    return { ok: true, anggota: a };
  }
  function ubahStatus(data, id, status, oleh) {
    const a = data.anggota.find((x) => x.id === id);
    if (!a || !['aktif', 'tidak aktif', 'keluar'].includes(status)) return gagal('Anggota atau status tidak valid.');
    const lama = a.status; a.status = status;
    catat(data, oleh, 'anggota.status', a.no + ' ' + lama + ' -> ' + status);
    return { ok: true };
  }

  function dasarTrx(data, t, hariIni) {
    const g = cekUmum(data, t, hariIni); if (g) return g;
    if (!['tunai', 'bank'].includes(t.cara || 'tunai')) return 'Cara bayar harus tunai atau bank.';
    return '';
  }
  const dorong = (data, t) => { const x = Object.assign({ id: uuid(), cara: 'tunai', ts: new Date().toISOString() }, t); data.trx.push(x); catat(data, t.kasir, 'trx.' + t.jenis, JSON.stringify({ id: x.id, tgl: x.tgl })); return x; };

  function setor(data, f, hariIni) {
    let g = dasarTrx(data, f, hariIni) || cekAnggota(data, f.anggotaId).galat;
    if (g) return gagal(g);
    if (!['pokok', 'wajib', 'sukarela'].includes(f.sub)) return gagal('Jenis simpanan tidak dikenal.');
    if (!bilangan(f.jumlah)) return gagal('Jumlah harus bilangan bulat lebih dari 0.');
    return { ok: true, trx: dorong(data, { jenis: 'simpan', tgl: f.tgl, anggotaId: f.anggotaId, sub: f.sub, jumlah: f.jumlah, cara: f.cara, kasir: f.kasir }) };
  }
  function tarik(data, f, hariIni) {
    let g = dasarTrx(data, f, hariIni) || cekAnggota(data, f.anggotaId).galat;
    if (g) return gagal(g);
    if (f.sub !== 'sukarela') return gagal('Hanya simpanan sukarela yang bisa ditarik. Simpanan pokok dan wajib dikembalikan saat anggota keluar, di luar v1.');
    if (!bilangan(f.jumlah)) return gagal('Jumlah harus bilangan bulat lebih dari 0.');
    const saldo = U.saldoSimpanan(efektif(data), f.anggotaId, 'sukarela');
    if (f.jumlah > saldo) return gagal('Penarikan melebihi saldo simpanan sukarela (' + saldo + ').');
    return { ok: true, trx: dorong(data, { jenis: 'tarik', tgl: f.tgl, anggotaId: f.anggotaId, sub: 'sukarela', jumlah: f.jumlah, cara: f.cara, kasir: f.kasir }) };
  }

  // ---- Pinjaman: pengajuan -> persetujuan (orang lain) -> pencairan (kasir lain) ----
  function ajukan(data, f) {
    const c = cekAnggota(data, f.anggotaId); if (c.galat) return gagal(c.galat);
    if (!bilangan(f.pokok) || !bilangan(f.tenor)) return gagal('Pokok dan tenor harus bilangan bulat lebih dari 0.');
    if (!(f.suku >= 0)) return gagal('Suku jasa tidak valid.');
    if (!f.pengaju || !String(f.pengaju).trim()) return gagal('Nama pengaju wajib diisi.');
    try { U.jadwal({ pokok: f.pokok, tenor: f.tenor, metode: f.metode, suku: f.suku, tglCair: f.tgl }); } catch (e) { return gagal(e.message); }
    data.seq.pinjaman += 1;
    const p = { id: uuid(), no: 'P' + String(data.seq.pinjaman).padStart(4, '0'), anggotaId: f.anggotaId, pokok: f.pokok, tenor: f.tenor, metode: f.metode, suku: f.suku, status: 'diajukan', pengaju: String(f.pengaju).trim(), tglAjuan: f.tgl, penyetuju: '', tglCair: '', jadwal: null };
    data.pinjaman.push(p);
    catat(data, p.pengaju, 'pinjaman.ajukan', p.no);
    return { ok: true, pinjaman: p };
  }
  function putuskan(data, id, penyetuju, setuju) {
    const p = data.pinjaman.find((x) => x.id === id);
    if (!p || p.status !== 'diajukan') return gagal('Pengajuan tidak ditemukan atau sudah diputuskan.');
    const nama = String(penyetuju || '').trim();
    if (!nama) return gagal('Nama penyetuju wajib diisi.');
    if (nama.toLowerCase() === p.pengaju.toLowerCase()) return gagal('Pengajuan tidak boleh disetujui oleh pengaju sendiri.');
    p.status = setuju ? 'disetujui' : 'ditolak'; p.penyetuju = nama;
    catat(data, nama, setuju ? 'pinjaman.setuju' : 'pinjaman.tolak', p.no);
    return { ok: true };
  }
  function cairkan(data, f, hariIni) {
    const p = data.pinjaman.find((x) => x.id === f.pinjamanId);
    if (!p || p.status !== 'disetujui') return gagal('Pinjaman belum disetujui.');
    const g = dasarTrx(data, f, hariIni) || cekAnggota(data, p.anggotaId).galat; if (g) return gagal(g);
    const k = String(f.kasir).trim().toLowerCase();
    if (k === p.pengaju.toLowerCase() || k === p.penyetuju.toLowerCase()) return gagal('Kasir yang mencairkan harus berbeda dari pengaju dan penyetuju.');
    const provisi = bulat((p.pokok * data.param.provisiPersen) / 100), crk = bulat((p.pokok * data.param.crkPersen) / 100);
    p.jadwal = U.jadwal({ pokok: p.pokok, tenor: p.tenor, metode: p.metode, suku: p.suku, tglCair: f.tgl });
    p.status = 'aktif'; p.tglCair = f.tgl;
    return { ok: true, trx: dorong(data, { jenis: 'cair', tgl: f.tgl, anggotaId: p.anggotaId, pinjamanId: p.id, pokok: p.pokok, provisi, crk, cara: f.cara, kasir: f.kasir }) };
  }
  function tagihan(data, pinjamanId, tgl) {
    const p = data.pinjaman.find((x) => x.id === pinjamanId);
    if (!p || !p.jadwal) return null;
    return U.ringkasPinjaman(p, efektif(data), tgl, data.param.denda);
  }
  /** f: {pinjamanId, tgl, jumlah, denda, kasir, cara, lunas?, jasaLunas?} -> alokasi; lunas = pelunasan dipercepat (jasa diisi petugas). */
  function angsur(data, f, hariIni) {
    const p = data.pinjaman.find((x) => x.id === f.pinjamanId);
    if (!p || p.status !== 'aktif') return gagal('Pinjaman tidak aktif.');
    const g = dasarTrx(data, f, hariIni) || cekAnggota(data, p.anggotaId).galat; if (g) return gagal(g);
    const denda = f.denda || 0;
    if (!Number.isInteger(denda) || denda < 0) return gagal('Denda tidak valid.');
    const r = tagihan(data, p.id, f.tgl);
    let pokok, jasa;
    if (f.lunas) {
      if (!Number.isInteger(f.jasaLunas) || f.jasaLunas < 0) return gagal('Jasa pelunasan harus diisi (0 atau lebih).');
      pokok = r.sisaPokok; jasa = f.jasaLunas;
      if (pokok <= 0) return gagal('Pinjaman sudah lunas.');
    } else {
      if (!bilangan(f.jumlah)) return gagal('Jumlah harus bilangan bulat lebih dari 0.');
      const a = U.alokasi(p.jadwal, r.bayar, f.jumlah, denda);
      if (a.lebih > 0) return gagal('Pembayaran melebihi total tagihan sebesar ' + a.lebih + '. Gunakan pelunasan dipercepat bila ingin melunasi.');
      pokok = a.pokok; jasa = a.jasa;
      if (a.denda !== denda) return gagal('Jumlah kurang dari denda yang diisi.');
    }
    const t = dorong(data, { jenis: 'angsur', tgl: f.tgl, anggotaId: p.anggotaId, pinjamanId: p.id, pokok, jasa, denda, cara: f.cara, kasir: f.kasir, lunas: !!f.lunas });
    if (tagihan(data, p.id, f.tgl).lunas) p.status = 'lunas';
    return { ok: true, trx: t };
  }
  function adm(data, f, hariIni) {
    const g = dasarTrx(data, f, hariIni) || cekAnggota(data, f.anggotaId).galat; if (g) return gagal(g);
    if (!bilangan(f.jumlah)) return gagal('Jumlah harus bilangan bulat lebih dari 0.');
    return { ok: true, trx: dorong(data, { jenis: 'adm', tgl: f.tgl, anggotaId: f.anggotaId, jumlah: f.jumlah, cara: f.cara, kasir: f.kasir }) };
  }

  // ---- Kas ----
  function kasTunaiSampai(data, tgl) {
    const ref = (data.template && data.template.saldoReferensi && data.template.pemetaan && data.template.saldoReferensi[data.template.pemetaan.kasTunai]) || 0;
    return ref + efektif(data).filter((t) => t.tgl <= tgl && (t.cara || 'tunai') === 'tunai').reduce((s, t) => {
      const x = t.pembalik ? -1 : 1;
      if (t.jenis === 'simpan' || t.jenis === 'adm') return s + x * t.jumlah;
      if (t.jenis === 'tarik') return s - x * t.jumlah;
      if (t.jenis === 'cair') return s - x * (t.pokok - t.provisi - t.crk);
      if (t.jenis === 'angsur') return s + x * (t.pokok + t.jasa + (t.denda || 0));
      return s;
    }, 0) - efektif(data).filter((t) => t.tgl <= tgl && t.jenis === 'setorBank').reduce((s, t) => s + (t.pembalik ? -1 : 1) * t.jumlah, 0);
  }
  function setorBank(data, f, hariIni) {
    const g = cekUmum(data, f, hariIni); if (g) return gagal(g);
    if (!bilangan(f.jumlah)) return gagal('Jumlah harus bilangan bulat lebih dari 0.');
    if (f.jumlah > kasTunaiSampai(data, f.tgl)) return gagal('Setoran melebihi saldo kas tunai sistem.');
    return { ok: true, trx: dorong(data, { jenis: 'setorBank', tgl: f.tgl, jumlah: f.jumlah, kasir: f.kasir }) };
  }
  /** Tutup kas satu hari: mengunci semua transaksi pada tanggal itu. */
  function tutupKas(data, f, hariIni) {
    if (!TGL.test(f.tgl || '')) return gagal('Tanggal tidak valid.');
    if (hariIni && f.tgl > hariIni) return gagal('Tanggal depan tidak bisa ditutup.');
    if (data.tutup[f.tgl]) return gagal('Kas tanggal ini sudah ditutup.');
    if (!f.kasir || !String(f.kasir).trim()) return gagal('Nama kasir wajib diisi.');
    if (!Number.isInteger(f.saldoFisik) || f.saldoFisik < 0) return gagal('Saldo fisik harus bilangan bulat 0 atau lebih.');
    const sistem = kasTunaiSampai(data, f.tgl), selisih = f.saldoFisik - sistem;
    if (selisih !== 0 && !String(f.alasan || '').trim()) return gagal('Ada selisih ' + selisih + ' antara uang fisik dan sistem; alasan wajib diisi.');
    data.tutup[f.tgl] = { kasir: f.kasir, saldoSistem: sistem, saldoFisik: f.saldoFisik, selisih, alasan: f.alasan || '', ts: new Date().toISOString() };
    catat(data, f.kasir, 'kas.tutup', f.tgl + ' selisih ' + selisih);
    return { ok: true, tutup: data.tutup[f.tgl] };
  }

  /** Pembalik: transaksi baru dengan angka asli dan tanda pembalik, pada tanggal yang masih terbuka. */
  function balik(data, f, hariIni) {
    const asal = data.trx.find((t) => t.id === f.trxId);
    if (!asal || asal.pembalik) return gagal('Transaksi asal tidak ditemukan atau sudah berupa pembalik.');
    if (data.trx.some((t) => t.pembalikDari === asal.id)) return gagal('Transaksi ini sudah dibalik.');
    if (!String(f.alasan || '').trim()) return gagal('Alasan pembalikan wajib diisi.');
    const g = cekUmum(data, f, hariIni); if (g) return gagal(g);
    if (f.tgl < asal.tgl) return gagal('Tanggal pembalik tidak boleh sebelum transaksi asal.');
    if (asal.jenis === 'simpan' && asal.sub === 'sukarela' && U.saldoSimpanan(efektif(data), asal.anggotaId, 'sukarela') < asal.jumlah) return gagal('Pembalikan membuat saldo sukarela negatif.');
    if (asal.jenis === 'cair') {
      if (data.trx.some((t) => t.pinjamanId === asal.pinjamanId && t.jenis === 'angsur' && !t.pembalik && !data.trx.some((b) => b.pembalikDari === t.id))) return gagal('Pencairan tidak bisa dibalik selama masih ada angsuran yang belum dibalik.');
    }
    const t = Object.assign({}, asal, { id: uuid(), tgl: f.tgl, pembalik: true, pembalikDari: asal.id, alasan: f.alasan, kasir: f.kasir, ts: new Date().toISOString() });
    data.trx.push(t);
    const p = asal.pinjamanId && data.pinjaman.find((x) => x.id === asal.pinjamanId);
    if (p) {
      if (asal.jenis === 'cair') { p.status = 'disetujui'; p.jadwal = null; p.tglCair = ''; }
      else if (asal.jenis === 'angsur' && p.status === 'lunas') p.status = 'aktif';
    }
    catat(data, f.kasir, 'trx.balik', asal.id + ': ' + f.alasan);
    return { ok: true, trx: t };
  }

  /** Daftar hari yang punya transaksi tetapi belum ditutup, dalam rentang. */
  function hariBelumTutup(data, dari, sampai) {
    return [...new Set(data.trx.filter((t) => !t.dibatalkan && t.tgl >= dari && t.tgl <= sampai).map((t) => t.tgl))].filter((d) => !data.tutup[d]).sort();
  }

  /** Periksa dan buat berkas data USP untuk akuntansiApp. */
  async function ekspor(data, f) {
    const T = data.template;
    if (!T) return gagal('Muat template dari akuntansiApp dulu.');
    if (!f.dari || !f.sampai || f.dari > f.sampai) return gagal('Rentang tanggal tidak valid.');
    const per = T.periode, awal = per.tahun + '-' + String(per.bulan).padStart(2, '0');
    if (f.dari.slice(0, 7) !== awal || f.sampai.slice(0, 7) !== awal) return gagal('Rentang harus berada dalam bulan template (' + awal + ').');
    const buka = hariBelumTutup(data, f.dari, f.sampai);
    if (buka.length) return gagal('Kas belum ditutup pada: ' + buka.join(', '));
    const o = await U.bangunDataUsp({ template: T, trx: data.trx, dari: f.dari, sampai: f.sampai, idBatch: f.idBatch || uuid(), dibuat: f.dibuat || new Date().toISOString(), crkPersen: data.param.crkPersen });
    if (o.kontrol.totalDebit !== o.kontrol.totalKredit) return gagal('Total debit dan kredit tidak sama.');
    if (!o.jurnal.length) return gagal('Tidak ada transaksi pada rentang itu.');
    data.batch.push({ idBatch: o.idBatch, idTemplat: T.idTemplat, dari: f.dari, sampai: f.sampai, dibuat: o.dibuat, checksum: o.kontrol.checksum });
    catat(data, f.oleh, 'ekspor', o.idBatch + ' ' + f.dari + '..' + f.sampai);
    return { ok: true, data: o };
  }

  return { dataBaru, tambahAnggota, ubahStatus, setor, tarik, ajukan, putuskan, cairkan, tagihan, angsur, adm, setorBank, tutupKas, balik, kasTunaiSampai, hariBelumTutup, ekspor };
});
