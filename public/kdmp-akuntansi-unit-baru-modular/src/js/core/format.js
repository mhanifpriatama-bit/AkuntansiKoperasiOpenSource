/*
 * Format angka, tanggal, dan teks. Fungsi murni (tanpa DOM, tanpa state).
 * Tanggal disimpan sebagai teks ISO "yyyy-mm-dd"; "periode" = tahun*12 + bulan (angka bulat) supaya mudah dibandingkan.
 */
(function (KDMP) {
  'use strict';
  const NAMA_BULAN = KDMP.config.aplikasi.namaBulan;

  const pad2 = (n) => String(n).padStart(2, '0');

  /** Kode akun dari teks "1.1.1.01 Kas Tunai" -> "1.1.1.01". */
  const kodeAkun = (ak) => (ak || '').split(' ')[0];

  /** Rupiah bulat: negatif dalam kurung, nol menjadi "-". */
  function rupiah(n) {
    if (Math.abs(n) < 0.5) return '-';
    return n < 0 ? '(' + Math.round(-n).toLocaleString('id-ID') + ')' : Math.round(n).toLocaleString('id-ID');
  }

  /** Angka dengan maksimal 2 desimal (untuk jumlah barang); nol menjadi "-". */
  const angka = (v) => (Math.abs(v) < 1e-9 ? '-' : (+v).toLocaleString('id-ID', { maximumFractionDigits: 2 }));

  /** Angka untuk kolom isian; nol/kosong menjadi teks kosong. */
  function angkaInput(v) {
    v = +v;
    return v ? v.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '';
  }

  /** Mengubah teks Indonesia ("1.250.000,50") menjadi angka. */
  function bacaAngka(s) {
    s = String(s == null ? '' : s).replace(/\./g, '').replace(',', '.');
    return +s.replace(/[^0-9.\-]/g, '') || 0;
  }

  /** Escape HTML untuk nilai yang disisipkan ke template. */
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const angkaAman = (x) => +x || 0;

  /** "2026-03-15" -> 2026*12+3. Tanggal kosong/ salah -> 0. */
  function periodeDari(tgl) {
    const p = String(tgl || '').split('-');
    return p.length > 2 ? +p[0] * 12 + +p[1] : 0;
  }

  /** "2026-03-15" -> "15/03/2026". */
  function tanggalId(v) {
    const p = String(v || '').split('-');
    return p.length == 3 && p[0].length == 4 ? p[2] + '/' + p[1] + '/' + p[0] : String(v || '');
  }

  /** [tahun, bulan, hari] -> "yyyy-mm-dd" bila tanggal valid, selain itu "". */
  function susunTanggal(a) {
    const d = new Date(a[0], a[1] - 1, a[2]);
    return d.getFullYear() == a[0] && d.getMonth() == a[1] - 1 && d.getDate() == a[2] ? a[0] + '-' + pad2(a[1]) + '-' + pad2(a[2]) : '';
  }

  /** Membaca ketikan pengguna (yyyy-mm-dd, dd/mm/yyyy, dd-mm-yy, ddmmyyyy) menjadi "yyyy-mm-dd"; salah -> "". */
  function bacaTanggal(s) {
    s = String(s || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return susunTanggal(s.split('-').map(Number));
    const m = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/) || s.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (!m) return '';
    let y = +m[3];
    if (m[3].length == 2) y += 2000;
    return susunTanggal([y, +m[2], +m[1]]);
  }

  function hariIni() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** Hari terakhir bulan, mis. (2026, 2) -> "2026-02-28". */
  const akhirBulan = (tahun, bulan) => tahun + '-' + pad2(bulan) + '-' + pad2(new Date(tahun, bulan, 0).getDate());

  /** Hari terakhir bulan sebelumnya. */
  function akhirBulanSebelumnya(tahun, bulan) {
    const d = new Date(tahun, bulan - 1, 0);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** "31 Oktober 2026" */
  const tanggalPanjang = (tahun, bulan) => new Date(tahun, bulan, 0).getDate() + ' ' + NAMA_BULAN[bulan - 1] + ' ' + tahun;

  /** Pembanding untuk sort kronologis yang stabil: [{t:{d}, i}] */
  const urutTanggal = (a, b) => (a.t.d < b.t.d ? -1 : a.t.d > b.t.d ? 1 : a.i - b.i);

  KDMP.core.format = {
    NAMA_BULAN, pad2, kodeAkun, rupiah, angka, angkaInput, bacaAngka, esc, angkaAman, periodeDari, tanggalId,
    susunTanggal, bacaTanggal, hariIni, akhirBulan, akhirBulanSebelumnya, tanggalPanjang, urutTanggal
  };
})(globalThis.KDMP);
