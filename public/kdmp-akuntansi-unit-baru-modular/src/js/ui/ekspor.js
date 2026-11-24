/*
 * Ekspor tampilan ke CSV dan Excel (.xls berbasis HTML). Ekspor membaca tabel yang sedang tampil di layar
 * (matriks()), sehingga isi berkas selalu sama dengan yang dilihat pengguna.
 */
(function (KDMP) {
  'use strict';
  const { esc, bacaAngka, NAMA_BULAN } = KDMP.core.format;
  const { simpanSebagai } = KDMP.ui.berkas;

  /**
   * Membaca semua tabel (selain tabel tanda tangan .sg) di area utama menjadi matriks
   * [{c: kelas baris, v: [nilai sel...]}]. Sel angka dikembalikan sebagai number.
   */
  function matriks() {
    const out = [];
    document.querySelectorAll('#m table:not(.sg)').forEach(function (t, ti) {
      if (ti) out.push({ c: '', v: [] });
      [...t.rows].forEach(function (r) {
        const th = r.cells[0] && r.cells[0].tagName == 'TH';
        out.push({
          c: (r.className || '') + (th ? ' th' : ''),
          v: [...r.cells].map(function (c) {
            const s = c.querySelector('select');
            const i = c.querySelector('input');
            let x;
            if (c.dataset.v !== undefined) return +c.dataset.v;
            if (i) x = c.classList.contains('n') ? (i.dataset.f ? bacaAngka(i.value) : +i.value || 0) : i.value.trim();
            else if (s) x = s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '';
            else {
              x = c.textContent.trim();
              if (c.classList.contains('n')) {
                if (x === '-' || x === '') x = 0;
                else if (/^-?\(?[\d.]+\)?$/.test(x)) {
                  const v = +x.replace(/[().]/g, '');
                  x = /^\(/.test(x) ? -v : v;
                }
              }
            }
            return x;
          })
        });
      });
    });
    return out;
  }

  function namaBerkas(nama, ekstensi) {
    const app = KDMP.app.state;
    return (app.unit + '_' + nama).replace(/[^\w]+/g, '_') + '_' + NAMA_BULAN[KDMP.app.bulan() - 1] + app.data.tahun + '.' + ekstensi;
  }

  const judulKop = () => (KDMP.app.state.data.kop || '') + ' — ' + KDMP.app.state.konfig.name;

  function csv() {
    const app = KDMP.app.state;
    const m = matriks();
    if (!m.length) return alert('Tidak ada tabel untuk diekspor.');
    const q = (x) => (/[;"\n]/.test(x + '') ? '"' + (x + '').replace(/"/g, '""') + '"' : x);
    const r = [judulKop(), app.tab + ' — per ' + KDMP.ui.kop.tanggalLaporan(), ''].map(q).concat(m.map((r) => r.v.map(q).join(';')));
    simpanSebagai(namaBerkas(app.tab, 'csv'), new Blob(['﻿' + r.join('\r\n')], { type: 'text/csv' }));
  }

  /** @param {Array<[string, Array]>} bagian  pasangan [judul, matriks] */
  function tulisExcel(bagian, nama) {
    let h = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>';
    bagian.forEach(function ([t, m]) {
      const w = Math.max(1, ...m.map((r) => r.v.length));
      h += `<table border=1 style="border-collapse:collapse"><tr><td colspan=${w} style="font-size:14pt;font-weight:bold">${esc(judulKop())}</td></tr><tr><td colspan=${w} style="font-weight:bold">${esc(t)} — per ${KDMP.ui.kop.tanggalLaporan()}</td></tr><tr><td colspan=${w}></td></tr>`;
      m.forEach(function (r) {
        const k = ' ' + r.c + ' ';
        const st = k.includes(' th ') ? 'background:#7F1018;color:#fff;font-weight:bold'
          : k.includes(' g ') ? 'background:#A4161F;color:#fff;font-weight:bold'
          : k.includes(' h1 ') ? 'background:#F0D9DA;font-weight:bold'
          : k.includes(' h2 ') ? 'background:#F9ECEC;font-weight:bold'
          : k.includes(' t ') ? 'background:#eee;font-weight:bold' : '';
        h += `<tr style="${st}">` + r.v.map((x) => (typeof x == 'number' ? `<td${Number.isInteger(x) ? ` style="mso-number-format:'#,##0;(#,##0)'"` : ''}>${x}</td>` : `<td>${esc(x)}</td>`)).join('') + '</tr>';
      });
      h += '</table><br>';
    });
    simpanSebagai(namaBerkas(nama, 'xls'), new Blob(['﻿' + h + '</body></html>'], { type: 'application/vnd.ms-excel' }));
  }

  function excel() {
    const m = matriks();
    if (!m.length) return alert('Tidak ada tabel untuk diekspor.');
    tulisExcel([[KDMP.app.state.tab, m]], KDMP.app.state.tab);
  }

  /** Semua laporan utama sekaligus dalam satu berkas Excel (tiap laporan satu blok). */
  function excelSemua() {
    const app = KDMP.app.state;
    const daftar = app.konsol ? ['Neraca Konsolidasi', 'Laba Rugi Konsolidasi'] : ['Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas'];
    const semula = app.tab;
    const bagian = [];
    daftar.forEach((t) => { app.tab = t; KDMP.app.tab[t].render(); bagian.push([t, matriks()]); });
    app.tab = semula;
    KDMP.app.navigasi.pergi();
    tulisExcel(bagian, 'Semua_Laporan');
  }

  KDMP.ui.aksi.daftar({
    'ekspor.excel': (el) => { excel(); KDMP.ui.dom.tutupMenu(el); },
    'ekspor.csv': (el) => { csv(); KDMP.ui.dom.tutupMenu(el); },
    'ekspor.excelSemua': (el) => { excelSemua(); KDMP.ui.dom.tutupMenu(el); },
    'ekspor.cetak': (el) => { KDMP.ui.berkas.cetak(); KDMP.ui.dom.tutupMenu(el); }
  });

  KDMP.ui.ekspor = { matriks, csv, excel, excelSemua };
})(globalThis.KDMP);
