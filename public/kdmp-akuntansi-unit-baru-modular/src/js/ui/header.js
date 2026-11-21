/*
 * Indikator di header: status keseimbangan jurnal, status simpan, dan pesan sinkronisasi.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { rupiah } = KDMP.core.format;

  /** "Jurnal balance" / "Selisih ..." (hanya pada mode unit). */
  function status() {
    const app = KDMP.app.state;
    if (app.konsol) { $('#st').innerHTML = ''; return; }
    const o = KDMP.core.saldo.hitungSaldo(app.data.rows, app.data.tahun, KDMP.app.bulan());
    const b = Math.round(o.td - o.tk) == 0;
    $('#st').innerHTML = `<span class="${b ? 'ok' : 'no'}" style="background:#fff;padding:3px 8px;border-radius:4px">${b ? 'Jurnal balance' : 'Selisih ' + rupiah(o.td - o.tk)}</span>`;
  }

  /** "Menyimpan…" / "Tersimpan 14:03" / "Siap". */
  function statusSimpan(kotor, terakhir) {
    const e = $('#sv');
    if (!e) return;
    e.textContent = kotor ? 'Menyimpan…' : terakhir ? 'Tersimpan ' + terakhir : 'Siap';
    e.className = 'sv ' + (kotor ? 'w' : 'k');
  }

  KDMP.ui.header = { status, statusSimpan };
})(globalThis.KDMP);
