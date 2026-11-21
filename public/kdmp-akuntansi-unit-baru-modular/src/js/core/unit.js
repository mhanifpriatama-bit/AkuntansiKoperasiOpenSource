/*
 * Definisi & pendaftaran unit usaha (tanpa DOM, tanpa penyimpanan) -> bisa dites di Node.
 *
 * Unit bawaan (USP, Sembako) ada di config/laporan-*.js. Unit tambahan dibuat pengguna dan hanya disimpan sebagai
 * definisi kecil {kode, nama, warna, templat, persediaan}; susunan laporannya (LPK & LR) disalin dari unit bawaan
 * yang dipilih sebagai templat. Semua akun tetap muncul karena laporan memakai baris "akun lain" (["O", ...]).
 *
 * `daftarkan` mengisi KDMP.config.unit[kode] dan menambahkan kode ke KDMP.config.aplikasi.unit (array yang sama
 * dipakai semua modul, sehingga unit baru langsung ikut di login, konsolidasi, sinkronisasi, dsb).
 */
(function (KDMP) {
  'use strict';
  const apl = KDMP.config.aplikasi;
  const BAWAAN = apl.unit.slice(); // dicatat sebelum ada unit tambahan: ['USP', 'Sembako']
  const RESERVED = ['admin', 'konsol'];
  const POLA_KODE = /^[A-Za-z][A-Za-z0-9]{1,15}$/;
  const POLA_WARNA = /^#[0-9a-fA-F]{6}$/;
  const POLA_NAMA_TERLARANG = /[<>&"'`]/;

  /** Pilihan templat susunan laporan untuk unit baru. */
  const TEMPLAT = {
    USP: 'Jasa / simpan pinjam (susunan laporan seperti USP)',
    Sembako: 'Dagang / barang (susunan laporan seperti Sembako)'
  };

  const salin = (x) => JSON.parse(JSON.stringify(x));

  /** Merapikan masukan menjadi definisi baku. */
  function normal(def) {
    return {
      kode: String(def.kode || '').trim(),
      nama: String(def.nama || '').trim(),
      warna: String(def.warna || '').trim(),
      templat: String(def.templat || ''),
      persediaan: !!def.persediaan
    };
  }

  /** @returns {string} pesan galat (bahasa Indonesia), atau '' bila definisi sah dan belum dipakai. */
  function validasi(def) {
    const d = normal(def || {});
    if (!POLA_KODE.test(d.kode)) return 'Kode unit 2–16 karakter: diawali huruf, selanjutnya huruf/angka (tanpa spasi).';
    if (RESERVED.includes(d.kode.toLowerCase())) return 'Kode "' + d.kode + '" dipakai sistem; pilih kode lain.';
    if (apl.unit.some((u) => u.toLowerCase() == d.kode.toLowerCase())) return 'Unit dengan kode "' + d.kode + '" sudah ada.';
    if (d.nama.length < 3 || d.nama.length > 60) return 'Nama unit 3–60 karakter.';
    if (POLA_NAMA_TERLARANG.test(d.nama)) return 'Nama unit tidak boleh memuat karakter < > & " \' `.';
    if (!POLA_WARNA.test(d.warna)) return 'Warna harus berformat #RRGGBB.';
    if (!BAWAAN.includes(d.templat)) return 'Templat laporan tidak dikenal.';
    return '';
  }

  /** Teks "USP, Sembako dan Klinik" untuk judul konsolidasi. */
  function namaGabungan() {
    const u = apl.unit;
    return u.length < 2 ? u.join('') : u.slice(0, -1).join(', ') + ' dan ' + u[u.length - 1];
  }

  /** Menyelaraskan judul konsolidasi dengan daftar unit saat ini. */
  function segarkanKonsolidasi() {
    if (KDMP.config.konsolidasi) KDMP.config.konsolidasi.name = 'Konsolidasi Unit Usaha (' + namaGabungan() + ')';
  }

  /**
   * Mendaftarkan unit tambahan ke konfigurasi (dalam memori). Melempar galat bila definisi tidak sah/duplikat.
   * @returns {object} konfigurasi unit {kode, name, color, LPK, LR, persediaan, kustom, def}
   */
  function daftarkan(def) {
    const galat = validasi(def);
    if (galat) throw new Error(galat);
    const d = normal(def);
    const t = KDMP.config.unit[d.templat];
    const c = { kode: d.kode, name: d.nama, color: d.warna, LPK: salin(t.LPK), LR: salin(t.LR), persediaan: d.persediaan, kustom: true, def: d };
    KDMP.config.unit[d.kode] = c;
    apl.unit.push(d.kode);
    segarkanKonsolidasi();
    return c;
  }

  /** Membatalkan pendaftaran unit tambahan (hanya dalam memori). Unit bawaan tidak bisa dibatalkan. */
  function batalDaftar(kode) {
    const c = KDMP.config.unit[kode];
    if (!c || !c.kustom) return;
    delete KDMP.config.unit[kode];
    const i = apl.unit.indexOf(kode);
    if (i >= 0) apl.unit.splice(i, 1);
    segarkanKonsolidasi();
  }

  /** Definisi semua unit tambahan sesuai urutan unit (untuk disimpan). */
  const daftarKustom = () => apl.unit.filter((k) => KDMP.config.unit[k] && KDMP.config.unit[k].kustom).map((k) => Object.assign({}, KDMP.config.unit[k].def));

  /** Definisi sebuah unit tambahan, atau null untuk unit bawaan/tidak dikenal. */
  const defUntuk = (kode) => (KDMP.config.unit[kode] && KDMP.config.unit[kode].kustom ? Object.assign({}, KDMP.config.unit[kode].def) : null);

  /** Apakah unit `kode` memakai tab BP Persediaan. */
  const punyaPersediaan = (kode) => !!(KDMP.config.unit[kode] && KDMP.config.unit[kode].persediaan);

  KDMP.core.unit = { BAWAAN, TEMPLAT, normal, validasi, daftarkan, batalDaftar, daftarKustom, defUntuk, punyaPersediaan, namaGabungan };
})(globalThis.KDMP);
