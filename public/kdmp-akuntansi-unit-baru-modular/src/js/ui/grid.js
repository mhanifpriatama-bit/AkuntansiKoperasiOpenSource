/*
 * Komponen tabel isian untuk buku pembantu (BP Aset, BP Persediaan): grid() menggambar daftar baris yang
 * tersimpan di state.data.sub[nama], dengan kolom yang dijelaskan oleh pemanggil.
 *
 * Deskripsi kolom: {k: nama field, l: judul, t: 'date'|'number'|'text', m: true (angka berformat), o: opsi dropdown, w: lebar min, list: id datalist}
 */
(function (KDMP) {
  'use strict';
  const { esc, rupiah, angka, angkaInput, bacaAngka, periodeDari, NAMA_BULAN } = KDMP.core.format;
  const { klik, ubah, input, arg } = KDMP.ui.aksi;
  const { kolomTanggal } = KDMP.ui.tanggalAngka;
  const app = KDMP.app.state;
  const simpan = () => KDMP.app.simpan.jadwalkan();

  /** Isi awal baris baru per buku pembantu. */
  const BARIS_BARU = {
    aset: () => ({ tgl: KDMP.core.format.hariIni(), umur: 4, met: 'Garis Lurus' }),
    pb: () => ({ akun: '1.1.4.01' }),
    pm: () => ({ d: KDMP.core.format.hariIni(), j: 'Masuk' })
  };

  /** <option> dari daftar nilai atau pasangan [nilai, teks]; `terpilih` ditandai selected. */
  const opsi = (o, terpilih) => o.map((x) => {
    const a = Array.isArray(x) ? x : [x, x];
    return `<option value="${esc(a[0])}"${a[0] == terpilih ? ' selected' : ''}>${esc(a[1])}</option>`;
  }).join('');

  /**
   * @param {string} p     nama buku pembantu (kunci di state.data.sub)
   * @param {Array} cols   deskripsi kolom
   * @param {string} note  catatan di samping tombol tambah
   * @param {string} [dk]  kolom tanggal yang menentukan periode; bila ada, hanya baris periode terpilih yang tampil
   */
  function grid(p, cols, note, dk) {
    const a = KDMP.app.sub(p);
    const PP = KDMP.app.periode();
    const tampil = [];
    a.forEach((r, i) => { if (!dk || !r[dk] || periodeDari(r[dk]) == PP || app.keep.has(r)) tampil.push(i); });
    let h = `<div class=bar><button class=p ${klik('grid.tambah', { p, n: 1 })}>+ Baris</button><button ${klik('grid.tambah', { p, n: 10 })}>+10 Baris</button><span class=c>${dk ? '<b>Periode ' + NAMA_BULAN[KDMP.app.bulan() - 1] + ' ' + app.data.tahun + '</b> (' + tampil.length + ' baris). Ganti bulan/tahun di kanan atas untuk periode lain; data periode sebelumnya tetap tersimpan. ' : ''}${note || ''}</span></div><table><tr><th>#</th>${cols.map((c) => `<th>${c.l}</th>`).join('')}<th></th></tr>`;
    tampil.forEach(function (i, ix) {
      const r = a[i];
      h += `<tr><td class=c>${ix + 1}</td>` + cols.map(function (c) {
        const v = r[c.k];
        if (c.t == 'date') return `<td>${kolomTanggal(v, p + ':' + i + ':' + c.k, dk == c.k)}</td>`;
        if (c.o) return `<td><select ${ubah('grid.isi', { p, i, k: c.k })}><option></option>${opsi(c.o, v)}</select></td>`;
        if (c.m) return `<td class="n"${c.w ? ` style="min-width:${c.w}px"` : ''}><input class="i n" inputmode=numeric value="${angkaInput(v)}" ${input('angka.ketik')} ${ubah('grid.angka', { p, i, k: c.k })}></td>`;
        const n = c.t == 'number';
        return `<td class="${n ? 'n' : ''}"${c.w ? ` style="min-width:${c.w}px"` : ''}><input class="i ${n ? 'n' : ''}" type="${c.t || 'text'}"${c.list ? ' list=' + c.list : ''} value="${esc(v)}" ${ubah('grid.isi', { p, i, k: c.k, n: n ? 1 : 0 })}></td>`;
      }).join('') + `<td><button ${klik('grid.hapus', { p, i })}>×</button></td></tr>`;
    });
    return h + '</table>';
  }

  /** Sub-tab (mis. Daftar Aset | Jadwal Penyusutan). @returns {[string, string]} [sub-tab aktif, HTML tombol] */
  function subTab(tab, daftar) {
    const cur = daftar.includes(app.sv[tab]) ? app.sv[tab] : daftar[0];
    app.sv[tab] = cur;
    return [cur, `<div class="bar sbar">${daftar.map((x) => `<button class="${x == cur ? 'on' : ''}" ${klik('grid.subTab', { tab, x })}>${x}</button>`).join('')}</div>`];
  }

  const sel = (n) => `<td class=n>${rupiah(n)}</td>`;
  /** Tabel rekonsiliasi buku pembantu vs buku besar. rows: [[label, buku pembantu, buku besar]] */
  function rekonsiliasi(rows, judul) {
    let h = `<h4>${judul || 'Rekonsiliasi dengan Buku Besar'}</h4><table><tr><th>Akun</th><th>Buku Pembantu</th><th>Buku Besar</th><th>Selisih</th><th>Status</th></tr>`;
    rows.forEach(([l, s, g]) => {
      const d = s - g;
      const ok = Math.round(d) == 0;
      h += `<tr><td>${l}</td>${sel(s)}${sel(g)}${sel(d)}<td class="${ok ? 'ok' : 'no'}">${ok ? 'Sesuai' : 'Selisih'}</td></tr>`;
    });
    return h + '</table>';
  }

  /** Kolom pilihan satu nilai (mis. barang untuk Kartu Stok): menyimpan ke state.sel[key]. */
  const pilih = (key, listId, label) => `<div class=bar><label>${label}: <input list=${listId} style=width:220px value="${esc(app.sel[key] || '')}" ${ubah('grid.pilih', { key })}></label></div>`;
  const barisTotal = (sel_, cls) => `<tr class="${cls || 'g'}">${sel_}</tr>`;
  const selAngka = (v) => `<td class=n data-v="${v}">${angka(v)}</td>`;

  KDMP.ui.aksi.daftar({
    'grid.tambah': (el) => {
      const p = arg(el, 'p');
      const a = KDMP.app.sub(p);
      for (let i = 0; i < +arg(el, 'n'); i++) { const o = BARIS_BARU[p] ? BARIS_BARU[p]() : {}; a.push(o); app.keep.add(o); }
      simpan();
      KDMP.app.navigasi.pergi();
    },
    'grid.isi': (el) => { KDMP.app.sub(arg(el, 'p'))[+arg(el, 'i')][arg(el, 'k')] = arg(el, 'n') == '1' ? +el.value || 0 : el.value; simpan(); },
    'grid.angka': (el) => {
      const v = bacaAngka(el.value);
      KDMP.app.sub(arg(el, 'p'))[+arg(el, 'i')][arg(el, 'k')] = v;
      el.value = angkaInput(v);
      simpan();
    },
    'grid.hapus': (el) => { if (confirm('Hapus baris ini?')) { KDMP.app.sub(arg(el, 'p')).splice(+arg(el, 'i'), 1); simpan(); KDMP.app.navigasi.pergi(); } },
    'grid.subTab': (el) => { app.sv[arg(el, 'tab')] = arg(el, 'x'); KDMP.app.navigasi.pergi(); },
    'grid.pilih': (el) => { app.sel[arg(el, 'key')] = el.value.trim(); KDMP.app.navigasi.pergi(); }
  });

  KDMP.ui.grid = { grid, subTab, rekonsiliasi, pilih, barisTotal, opsi, selAngka, selRupiah: sel };
})(globalThis.KDMP);
