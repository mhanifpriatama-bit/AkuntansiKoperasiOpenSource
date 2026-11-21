/*
 * Menggambar tabel laporan (Kode | Uraian | kolom angka...) dari hasil KDMP.core.laporan.
 */
(function (KDMP) {
  'use strict';
  const { rupiah, NAMA_BULAN } = KDMP.core.format;
  const { ubah } = KDMP.ui.aksi;

  /** Uraian baris spesifikasi: nama akun dari Master COA, atau teks tetap; "=" berarti label laba berjalan. */
  function uraian(it) {
    const d = KDMP.app.state.data;
    const l = it[0] == 'O' ? it[1] : (it[0] == 'A' && KDMP.core.coa.nama(it[1])) || it[2];
    return l[0] == '=' ? 'Laba s/d ' + NAMA_BULAN[KDMP.app.bulan() - 1].toUpperCase() + ' ' + d.tahun : l;
  }

  /**
   * @param {Array} rows   baris hasil susunLaporan
   * @param {Array<Array<number>>} cols  nilai per kolom (sejajar rows)
   * @param {string[]} heads  judul kolom angka
   * @param {{j:number,k:string}} [inp]  kolom ke-j berupa isian eliminasi manual yang disimpan di state.data[k]
   */
  function tabelLaporan(rows, cols, heads, inp) {
    const d = KDMP.app.state.data;
    let h = '<table><tr><th>Kode</th><th>Uraian</th>' + heads.map((x) => '<th>' + x + '</th>').join('') + '</tr>';
    rows.forEach(function (r, i) {
      const it = r.it;
      const t = it[0];
      if (t == 'O' && cols.every((c) => Math.abs(c[i]) < 0.5)) return;
      const cl = t == 'H' ? 'h' + it[1] : t == 'S' || t == 'T' ? (uraian(it) == uraian(it).toUpperCase() ? 'g' : 't') : '';
      h += `<tr class="${cl}"><td class=c>${t == 'A' ? it[1] : ''}</td><td>${uraian(it)}</td>` +
        cols.map((c, j) => t == 'H' ? '<td></td>'
          : inp && j == inp.j && t == 'A' ? `<td class=n><input class="i n" data-k="${it[1]}" value="${d[inp.k][it[1]] || ''}" ${ubah('eliminasi.set', { ek: inp.k })}></td>`
          : `<td class=n>${rupiah(c[i])}</td>`).join('') + '</tr>';
    });
    return h + '</table>';
  }

  KDMP.ui.aksi.daftar({
    'eliminasi.set': (el) => {
      KDMP.app.state.data[KDMP.ui.aksi.arg(el, 'ek')][el.dataset.k] = +el.value || 0;
      KDMP.app.simpan.jadwalkan();
      KDMP.app.navigasi.pergi();
    }
  });

  KDMP.ui.tabelLaporan = { uraian, tabelLaporan };
})(globalThis.KDMP);
