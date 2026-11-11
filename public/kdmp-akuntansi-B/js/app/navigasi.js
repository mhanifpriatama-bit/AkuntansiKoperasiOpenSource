/*
 * Navigasi antar tab. Setiap tab didaftarkan di KDMP.app.tab[nama] = { render() } oleh berkas di js/fitur/.
 */
(function (KDMP) {
  'use strict';
  const { $, tambahDiAwal, tambahDiAkhir } = KDMP.ui.dom;
  const { klik, arg } = KDMP.ui.aksi;
  const app = KDMP.app.state;

  /** Tab yang diberi kolom tanda tangan di bawahnya. */
  const TAB_LAPORAN = ['Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas', 'Neraca Konsolidasi', 'Laba Rugi Konsolidasi'];

  /** Tab yang tersedia untuk sesi `unit` (USP/Sembako/KONSOL). */
  function daftarTab(unit) {
    if (unit == 'KONSOL') return ['Neraca Konsolidasi', 'Laba Rugi Konsolidasi', 'Master COA', 'Data Unit'];
    return ['Jurnal', 'Buku Besar', 'Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas'].concat(unit == 'Sembako' ? ['BP Aset', 'BP Persediaan'] : ['BP Aset'], ['Data']);
  }

  /** Membuka tab `nama` (atau menggambar ulang tab aktif bila nama kosong). */
  function pergi(nama) {
    if (nama) app.tab = nama;
    $('#nav').innerHTML = app.tabs.map((x) => `<button class="${x == app.tab ? 'on' : ''}" ${klik('nav.tab', { tab: x })}>${x}</button>`).join('');
    KDMP.ui.header.status();
    KDMP.ui.header.statusSimpan(KDMP.app.simpan.adaPerubahan(), KDMP.app.simpan.waktuTerakhir());
    KDMP.app.tab[app.tab].render();
    if (app.konsol && app.tab != 'Data Unit') tambahDiAwal(KDMP.fitur.spandukKonsolidasi());
    if (TAB_LAPORAN.includes(app.tab)) tambahDiAkhir(KDMP.ui.kop.tandaTangan());
  }

  KDMP.ui.aksi.daftar({ 'nav.tab': (el) => pergi(arg(el, 'tab')) });
  KDMP.app.navigasi = { daftarTab, pergi, TAB_LAPORAN };
})(globalThis.KDMP);
