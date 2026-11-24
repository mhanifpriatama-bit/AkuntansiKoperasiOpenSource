/*
 * State sesi aplikasi: SATU objek yang menggantikan variabel global kode lama (S, K, CFG.unit, tab, ...).
 * Modul lain membacanya lewat KDMP.app.state.
 */
(function (KDMP) {
  'use strict';

  const state = {
    data: null,        // data unit/konsolidasi yang sedang dibuka (dulu: S). Lihat docs/struktur-data.md
    konsol: false,     // true bila login sebagai Konsolidasi (dulu: K)
    unit: null,        // 'USP' | 'Sembako' | 'KONSOL' (dulu: CFG.unit)
    konfig: null,      // konfigurasi laporan unit aktif {name, color, LPK, LR} (dulu: CFG.name/LPK/LR)
    tab: null,         // nama tab aktif
    tabs: [],          // daftar tab untuk sesi ini
    akunBB: '1.1.1.01',// akun yang sedang dilihat di Buku Besar
    sv: {},            // sub-tab terpilih per tab (BP Aset, BP Persediaan)
    sel: {},           // pilihan dropdown di buku pembantu
    keep: new Set(),   // baris yang baru ditambah: tetap tampil walau di luar periode sampai tanggalnya diisi
    kunci: { DK: null, RAW: null, PIN: null, META: null, KEY: null } // kunci sesi (hanya di memori)
  };

  const bulan = () => +state.data.bulan;
  const periode = () => state.data.tahun * 12 + bulan();
  /** Daftar baris buku pembantu bernama k (dibuat bila belum ada). */
  const sub = (k) => state.data.sub[k] || (state.data.sub[k] = []);

  KDMP.app.state = state;
  KDMP.app.bulan = bulan;
  KDMP.app.periode = periode;
  KDMP.app.sub = sub;
  KDMP.app.tab = {}; // pendaftaran tab: KDMP.app.tab[nama] = { render() }
})(globalThis.KDMP);
