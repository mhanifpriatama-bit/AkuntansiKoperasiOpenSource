/*
 * Master COA (Chart of Accounts) yang sedang dipakai, beserta aturan validasi & migrasi data lama.
 *
 * Satu-satunya tempat yang memegang daftar akun. Modul lain membaca lewat KDMP.core.coa.*;
 * perubahan daftar akun selalu lewat fungsi di sini supaya peta saldo normal tetap sinkron.
 * Tidak menyentuh DOM: tampilan yang perlu diperbarui (mis. daftar pilihan akun) mendaftar lewat
 * KDMP.core.coa.saatBerubah(fungsi).
 */
(function (KDMP) {
  'use strict';
  const { kodeAkun } = KDMP.core.format;
  const legacy = KDMP.config.coaLegacy;

  const salin = (a) => JSON.parse(JSON.stringify(a));
  const bawaan = salin(KDMP.config.coa);          // daftar bawaan (tidak pernah diubah)
  let daftar = salin(KDMP.config.coa);            // daftar aktif: [[kode, nama, 'Debit'|'Kredit'], ...]
  const saldoNormal = {};                         // kode -> 'Debit'|'Kredit'
  const pendengar = [];

  /** 4 digit pertama kode yang dikenal laporan (golongan.kelompok.jenis). */
  const KELOMPOK_VALID = new Set(bawaan.map((a) => a[0].slice(0, 4)));
  const POLA_KODE = /^[1-9]\.\d\.\d\.\d{2}$/;

  const urutKode = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);

  function segarkan() {
    Object.keys(saldoNormal).forEach((k) => delete saldoNormal[k]);
    daftar.forEach((x) => (saldoNormal[x[0]] = x[2]));
    pendengar.forEach((f) => f());
  }

  /** Mengganti seluruh daftar akun (mis. hasil impor / muat dari database). */
  function ganti(daftarBaru) {
    daftar = daftarBaru;
    segarkan();
  }

  function urutkan() {
    daftar.sort(urutKode);
  }

  /** Nama akun dari kode; kosong bila tidak ada. */
  const nama = (kode) => (daftar.find((a) => a[0] == kode) || [])[1] || '';

  /** Saldo normal bawaan menurut golongan: aset, HPP, beban (dan 9.x non-pendapatan) = Debit. */
  function saldoNormalBawaan(kode) {
    const d = kode[0];
    return d == '1' || d == '5' || d == '6' || d == '8' || (d == '9' && kode[2] != '1') ? 'Debit' : 'Kredit';
  }

  /** Pesan kesalahan bila kode akun tidak boleh dipakai ("" bila boleh). `indeksSendiri` = baris yang sedang diedit. */
  function galatKode(kode, indeksSendiri) {
    if (!POLA_KODE.test(kode)) return 'Format kode harus x.x.x.xx, misalnya 6.1.9.24 atau 7.1.1.01 / 8.1.1.01 (awalan 1-9).';
    if (!KELOMPOK_VALID.has(kode.slice(0, 4)) && !/^[78]/.test(kode)) return 'Kelompok akun ' + kode.slice(0, 4) + ' tidak ada dalam struktur laporan.';
    if (daftar.some((a, i) => a[0] == kode && i !== indeksSendiri)) return 'Kode akun sudah ada.';
    return '';
  }

  /** Apakah baris impor COA berbentuk valid? */
  const barisImporValid = (a) =>
    Array.isArray(a) && POLA_KODE.test(a[0]) && (KELOMPOK_VALID.has(a[0].slice(0, 4)) || /^[78]/.test(a[0])) && a[1] && (a[2] == 'Debit' || a[2] == 'Kredit');

  const tambah = (kode, namaAkun, saldo) => { daftar.push([kode, namaAkun, saldo]); urutkan(); segarkan(); };
  const ubahNama = (i, v) => { daftar[i][1] = v; segarkan(); };
  const ubahKode = (i, v) => { daftar[i][0] = v; urutkan(); segarkan(); };
  const ubahSaldoNormal = (i, v) => { daftar[i][2] = v; segarkan(); };
  const hapus = (i) => { daftar.splice(i, 1); segarkan(); };
  const kembalikanBawaan = () => ganti(salin(bawaan));

  /**
   * Menyiapkan daftar akun dari nilai yang tersimpan di database ('coa').
   * Versi 3 (ada penanda '#v'): dipakai apa adanya. Versi lama: daftar bawaan + akun tambahan pengguna
   * (akun yang bukan bawaan baru dan bukan bawaan lama).
   * @returns {Array|null} daftar baru, atau null bila tidak ada yang perlu diganti
   */
  function dariTersimpan(c) {
    if (!(Array.isArray(c) && c.length)) return null;
    if (c.some((a) => a[0] == '#v' && a[1] == '3')) return c.filter((a) => a[0] != '#v');
    const bs = new Set(bawaan.map((a) => a[0]));
    const lama = new Set(legacy.kodeLama);
    const tambahan = c.filter((a) => a && !bs.has(a[0]) && !lama.has(a[0])).map((a) => a.slice());
    return salin(bawaan).concat(tambahan).sort(urutKode);
  }

  /** Bentuk yang disimpan ke database: daftar + penanda versi 3. */
  const untukDisimpan = () => daftar.map((a) => a.slice()).concat([['#v', '3', '']]);

  /**
   * Migrasi data jurnal versi lama ke COA versi 3 (kode aset tetap bergeser). Mengubah `d` langsung.
   * Dipanggil tiap membuka data tersimpan/impor; aman dipanggil berulang karena ditandai d.cv = 3.
   */
  function migrasiData(d) {
    if (!d || typeof d != 'object' || !Array.isArray(d.rows) || d.cv == 3) return d;
    const peta = legacy.migrasiKode;
    d.rows.forEach((r) => {
      const p = kodeAkun(r.ak);
      if (peta[p]) r.ak = peta[p] + ' ' + ((bawaan.find((a) => a[0] == peta[p]) || [])[1] || '');
    });
    Object.keys(d).forEach((k) => {
      if (/^el/.test(k) && d[k] && typeof d[k] == 'object' && !Array.isArray(d[k])) {
        const o = {};
        Object.keys(d[k]).forEach((c) => {
          const n = peta[c] || c;
          o[n] = (o[n] || 0) + d[k][c];
        });
        d[k] = o;
      }
    });
    if (d.imp && typeof d.imp == 'object') Object.values(d.imp).forEach(migrasiData);
    d.cv = 3;
    return d;
  }

  /**
   * Menyesuaikan baris jurnal lama: kode kas lama digabung (alihKode), dan kode lama yang tak ada di COA
   * ditambahkan ke daftar akun agar saldonya tetap terhitung. MENGUBAH `rows` dan daftar akun.
   * @returns {boolean} true bila ada perubahan
   */
  function terapkanAkunLama(rows) {
    let berubah = false;
    rows.forEach((r) => {
      const p = kodeAkun(r.ak);
      if (legacy.alihKode[p]) {
        const n = legacy.alihKode[p];
        r.ak = n + ' ' + nama(n);
        berubah = true;
      } else if (!saldoNormal[p] && legacy.akunLama[p]) {
        daftar.push([p, legacy.akunLama[p][0], legacy.akunLama[p][1]]);
        saldoNormal[p] = legacy.akunLama[p][1];
        berubah = true;
      }
    });
    if (berubah) {
      urutkan();
      pendengar.forEach((f) => f());
    }
    return berubah;
  }

  segarkan();

  KDMP.core.coa = {
    POLA_KODE, KELOMPOK_VALID,
    get daftar() { return daftar; },
    saldoNormal, bawaan,
    nama, saldoNormalBawaan, galatKode, barisImporValid,
    ganti, urutkan, tambah, ubahNama, ubahKode, ubahSaldoNormal, hapus, kembalikanBawaan,
    dariTersimpan, untukDisimpan, migrasiData, terapkanAkunLama,
    saatBerubah: (f) => pendengar.push(f)
  };
})(globalThis.KDMP);
