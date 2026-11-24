/*
 * Tab Buku Besar: mutasi satu akun pada periode terpilih, dengan saldo berjalan.
 * Akun laba rugi (4-9) hanya menghitung tahun berjalan.
 */
(function (KDMP) {
  'use strict';
  const { esc, rupiah, tanggalId, periodeDari, NAMA_BULAN } = KDMP.core.format;
  const { ubah } = KDMP.ui.aksi;
  const app = KDMP.app.state;

  function render() {
    const d = app.data;
    const bb = app.akunBB;
    const Y = +d.tahun;
    const P = Y * 12 + KDMP.app.bulan();
    const labaRugi = '45678'.includes(bb[0]) || bb[0] == '9';
    const tanda = KDMP.core.coa.saldoNormal[bb] == 'Debit' ? 1 : -1;
    const baris = [];
    let s = 0, s0 = 0;
    d.rows.filter((r) => (r.ak || '').startsWith(bb + ' ') && r.d).sort((a, b) => (a.d < b.d ? -1 : 1)).forEach(function (r) {
      const q = periodeDari(r.d);
      const y = +r.d.slice(0, 4);
      if (q > P || (labaRugi && y != Y)) return;
      s += tanda * ((+r.db || 0) - (+r.kr || 0));
      if (q < P) { s0 = s; return; }
      baris.push(`<tr><td>${tanggalId(r.d)}</td><td>${esc(r.no)}</td><td>${esc(r.ket)}</td><td class=n>${rupiah(+r.db || 0)}</td><td class=n>${rupiah(+r.kr || 0)}</td><td class=n>${rupiah(s)}</td></tr>`);
    });
    KDMP.ui.dom.isi(`<div class=bar>Akun: <input list=dl id=bbs style=width:380px value="${bb} ${KDMP.core.coa.nama(bb)}" ${ubah('bukuBesar.pilihAkun')}><span class=c>Periode ${NAMA_BULAN[KDMP.app.bulan() - 1]} ${d.tahun}</span></div><table><tr><th>Tanggal</th><th>No Bukti</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Saldo</th></tr><tr class=t><td></td><td></td><td>Saldo awal periode</td><td></td><td></td><td class=n>${rupiah(s0)}</td></tr>${baris.join('')}</table>`);
  }

  KDMP.ui.aksi.daftar({
    'bukuBesar.pilihAkun': (el) => { app.akunBB = el.value.split(' ')[0]; KDMP.app.navigasi.pergi(); }
  });
  KDMP.app.tab['Buku Besar'] = { render };
})(globalThis.KDMP);
