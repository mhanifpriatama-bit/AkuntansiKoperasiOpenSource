/*
 * Tab BP Persediaan (khusus Sembako): Master Barang, Mutasi Stok, Kartu Stok, Rekap & Rekonsiliasi.
 * Hitungan stok (rata-rata bergerak) ada di KDMP.core.persediaan.
 */
(function (KDMP) {
  'use strict';
  const { esc, tanggalId, akhirBulan, akhirBulanSebelumnya, angkaAman } = KDMP.core.format;
  const { grid, subTab, rekonsiliasi, pilih, barisTotal, selAngka: nq, selRupiah: nc } = KDMP.ui.grid;
  const { kop, tandaTangan } = KDMP.ui.kop;
  const app = KDMP.app.state;

  function hitungStok(batas) {
    return KDMP.core.persediaan.hitungStok(KDMP.app.sub('pb'), KDMP.app.sub('pm'), batas);
  }
  const akhirPeriode = () => akhirBulan(app.data.tahun, KDMP.app.bulan());

  function renderMaster() {
    const akun = KDMP.core.coa.daftar.filter((a) => a[0].startsWith('1.1.4.')).map((a) => [a[0], a[0] + ' ' + a[1]]);
    return grid('pb', [{ k: 'k', l: 'Kode Barang', w: 100 }, { k: 'n', l: 'Nama Barang', w: 260 }, { k: 'akun', l: 'Akun Persediaan (Buku Besar)', o: akun }], 'Tiap barang dikaitkan ke akun persediaan agar bisa direkonsiliasi dengan Buku Besar.');
  }

  const daftarBarang = () => '<datalist id=dlb>' + KDMP.app.sub('pb').filter((x) => x.k).map((x) => `<option value="${esc(x.k)}" label="${esc(x.n)}">`).join('') + '</datalist>';

  function renderMutasi() {
    return grid('pm', [
      { k: 'd', l: 'Tanggal', t: 'date' }, { k: 'no', l: 'No Bukti', w: 110 }, { k: 'k', l: 'Kode Barang', list: 'dlb', w: 110 },
      { k: 'j', l: 'Jenis', o: ['Saldo Awal', 'Masuk', 'Keluar'] }, { k: 'q', l: 'Jumlah', t: 'number', w: 90 },
      { k: 'h', l: 'Harga Satuan (Saldo Awal/Masuk)', t: 'number', w: 130 }, { k: 'ket', l: 'Keterangan', w: 220 }
    ], 'Metode biaya: rata-rata bergerak. Mutasi Keluar dinilai otomatis dari harga rata-rata saat itu; kolom harga tidak dipakai.', 'd');
  }

  function renderKartu() {
    const c = hitungStok(akhirPeriode());
    const r = c.m[app.sel.pk];
    let h = pilih('pk', 'dlb', 'Kode barang') + kop('KARTU STOK');
    if (!r) return h + '<p class=c>Pilih kode barang yang sudah ada di Master Barang.</p>';
    h += `<p><b>${esc(r.it.k)}</b> — ${esc(r.it.n)} · Akun ${esc(r.it.akun || '-')}</p><table><tr><th>Tanggal</th><th>No Bukti</th><th>Keterangan</th><th>Masuk</th><th>Harga Masuk</th><th>Keluar</th><th>HPP Keluar</th><th>Saldo (qty)</th><th>Harga Rata-rata</th><th>Nilai Saldo</th></tr>`;
    r.h.forEach((x) => {
      h += `<tr><td>${tanggalId(x.t.d)}</td><td>${esc(x.t.no)}</td><td>${esc(x.t.j)}${x.t.ket ? ' — ' + esc(x.t.ket) : ''}</td>${x.iq ? nq(x.iq) : '<td class=n>-</td>'}${x.iq ? nc(angkaAman(x.t.h)) : '<td class=n>-</td>'}${x.oq ? nq(x.oq) : '<td class=n>-</td>'}${x.oq ? nc(x.cost) : '<td class=n>-</td>'}${nq(x.q)}${nc(x.q > 0 ? x.v / x.q : 0)}${nc(x.v)}</tr>`;
    });
    return h + '</table>' + tandaTangan();
  }

  function renderRekap() {
    const c = hitungStok(akhirPeriode());
    const p = hitungStok(akhirBulanSebelumnya(+app.data.tahun, KDMP.app.bulan()));
    const { o } = KDMP.fitur.dataUnit();
    const L = Object.values(c.m).sort((a, b) => ((a.it.akun || '') + a.it.k < (b.it.akun || '') + b.it.k ? -1 : 1));
    const A = {};
    let h = kop('REKAP PERSEDIAAN BARANG') + '<table><tr><th>Kode</th><th>Nama Barang</th><th>Saldo Awal Bulan</th><th>Masuk</th><th>Keluar</th><th>Saldo Akhir</th><th>Harga Rata-rata</th><th>Nilai Persediaan</th><th>HPP Keluar Bulan Ini</th></tr>';
    let tv = 0, to = 0;
    const minus = [];
    L.forEach((r) => {
      const a = p.m[r.it.k] || { q: 0 };
      tv += r.v;
      to += r.vout;
      const ak = r.it.akun || '(belum diisi)';
      A[ak] = (A[ak] || 0) + r.v;
      if (r.q < -1e-9) minus.push(r.it.k);
      h += `<tr><td>${esc(r.it.k)}</td><td>${esc(r.it.n)}</td>${nq(a.q)}${nq(r.in)}${nq(r.out)}${nq(r.q)}${nc(r.q > 0 ? r.v / r.q : 0)}${nc(r.v)}${nc(r.vout)}</tr>`;
    });
    h += barisTotal(`<td colspan=7>JUMLAH</td>${nc(tv)}${nc(to)}`) + '</table>';
    if (minus.length) h += `<p class=no>Stok minus pada: ${minus.map(esc).join(', ')} — periksa mutasi Keluar yang melebihi stok.</p>`;
    if (c.tidakDikenal.length) h += `<p class=no>${c.tidakDikenal.length} mutasi memakai kode barang yang tidak ada di Master Barang dan tidak dihitung.</p>`;
    const adaDiBukuBesar = (a) => a[0].startsWith('1.1.4.') && (Math.abs(o.cum[a[0]] || 0) > 0.5 || Math.abs(A[a[0]] || 0) > 0.5);
    return h + rekonsiliasi(KDMP.core.coa.daftar.filter(adaDiBukuBesar).map((a) => [a[0] + ' ' + a[1], A[a[0]] || 0, o.cum[a[0]] || 0])) + tandaTangan();
  }

  function render() {
    const [v, bar] = subTab('BP Persediaan', ['Master Barang', 'Mutasi Stok', 'Kartu Stok', 'Rekap & Rekonsiliasi']);
    let h = bar;
    if (v == 'Master Barang') h += renderMaster();
    else if (v == 'Mutasi Stok') h += daftarBarang() + renderMutasi();
    else if (v == 'Kartu Stok') h += daftarBarang() + renderKartu();
    else h += renderRekap();
    KDMP.ui.dom.isi(h);
  }

  KDMP.app.tab['BP Persediaan'] = { render };
})(globalThis.KDMP);
