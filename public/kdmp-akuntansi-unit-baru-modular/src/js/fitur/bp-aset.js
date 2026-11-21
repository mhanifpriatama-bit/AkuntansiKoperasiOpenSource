/*
 * Tab BP Aset (buku pembantu aset tetap): Daftar Aset, Jadwal Penyusutan, Rekonsiliasi & Jurnal penyusutan.
 * Hitungan penyusutan ada di KDMP.core.asetTetap.
 */
(function (KDMP) {
  'use strict';
  const { esc, tanggalId, akhirBulan, pad2, NAMA_BULAN } = KDMP.core.format;
  const { klik } = KDMP.ui.aksi;
  const { grid, subTab, rekonsiliasi, barisTotal, selRupiah: nc } = KDMP.ui.grid;
  const { kop, tandaTangan } = KDMP.ui.kop;
  const aset = KDMP.core.asetTetap;
  const KAT = Object.keys(aset.KATEGORI);
  const app = KDMP.app.state;

  const hitung = () => aset.hitungAset(KDMP.app.sub('aset'), +app.data.tahun, KDMP.app.bulan());

  /** Membuat jurnal penyusutan bulan ini (Debit Beban / Kredit Akumulasi), mengganti jurnal DEP bulan itu bila ada. */
  function buatJurnalPenyusutan() {
    const grup = aset.kelompokBeban(hitung());
    if (!Object.keys(grup).length) return alert('Tidak ada beban penyusutan pada bulan ini.');
    const no = 'DEP-' + app.data.tahun + pad2(KDMP.app.bulan());
    const ada = app.data.rows.filter((r) => r.no == no);
    if (ada.length && !confirm('Jurnal penyusutan bulan ini sudah ada (' + ada.length + ' baris) dan akan DIGANTI. Lanjut?')) return;
    app.data.rows = app.data.rows.filter((r) => r.no != no);
    const d = akhirBulan(app.data.tahun, KDMP.app.bulan());
    const ket = 'Penyusutan ' + NAMA_BULAN[KDMP.app.bulan() - 1] + ' ' + app.data.tahun;
    const nama = KDMP.core.coa.nama;
    Object.entries(grup).forEach(([k, v]) => {
      const [b, a] = k.split('|');
      const x = Math.round(v);
      app.data.rows.push({ d, no, ak: b + ' ' + nama(b), db: x, kr: 0, ket });
      app.data.rows.push({ d, no, ak: a + ' ' + nama(a), db: 0, kr: x, ket });
    });
    KDMP.app.simpan.jadwalkan();
    KDMP.app.navigasi.pergi();
    KDMP.ui.pesan.toast('Jurnal penyusutan dibuat (lihat tab Jurnal)');
  }

  function renderDaftar() {
    return grid('aset', [
      { k: 'kode', l: 'Kode Aset', w: 90 }, { k: 'nama', l: 'Nama Aset', w: 220 }, { k: 'kat', l: 'Kategori', o: KAT },
      { k: 'tgl', l: 'Tgl Perolehan', t: 'date' }, { k: 'hp', l: 'Harga Perolehan', t: 'number', m: 1, w: 120 },
      { k: 'res', l: 'Nilai Residu', t: 'number', m: 1, w: 100 }, { k: 'umur', l: 'Umur (tahun)', t: 'number', w: 70 },
      { k: 'met', l: 'Metode', o: ['Garis Lurus', 'Saldo Menurun'] }, { k: 'lepas', l: 'Tgl Lepas (opsional)', t: 'date' }
    ], 'Penyusutan dihitung mulai bulan perolehan. Tanah tidak disusutkan. Saldo Menurun memakai tarif 2 × (1/umur).');
  }

  function renderJadwal() {
    const rs = hitung();
    const T = { cost: 0, bln: 0, ytd: 0, akum: 0, nb: 0 };
    const G = {};
    let h = kop('BUKU PEMBANTU ASET TETAP DAN PENYUSUTAN') + '<table><tr><th>Kode</th><th>Nama Aset</th><th>Kategori</th><th>Tgl Perolehan</th><th>Umur (thn)</th><th>Metode</th><th>Status</th><th>Harga Perolehan</th><th>Beban Bulan Ini</th><th>Beban Tahun Berjalan</th><th>Akumulasi Penyusutan</th><th>Nilai Buku</th></tr>';
    rs.forEach((r) => {
      const a = r.a;
      for (const k in T) T[k] += r[k];
      const g = (G[a.kat || '-'] = G[a.kat || '-'] || { cost: 0, bln: 0, ytd: 0, akum: 0, nb: 0 });
      for (const k in T) g[k] += r[k];
      h += `<tr${r.ak ? '' : ' style="color:#999"'}><td>${esc(a.kode)}</td><td>${esc(a.nama)}</td><td>${esc(a.kat)}</td><td>${tanggalId(a.tgl)}</td><td class=n>${esc(a.umur || '')}</td><td>${esc(a.met || '')}</td><td>${r.st}</td>${nc(r.cost)}${nc(r.bln)}${nc(r.ytd)}${nc(r.akum)}${nc(r.nb)}</tr>`;
    });
    h += barisTotal(`<td colspan=7>JUMLAH</td>${nc(T.cost)}${nc(T.bln)}${nc(T.ytd)}${nc(T.akum)}${nc(T.nb)}`) + '</table><h4>Rekap per Kategori</h4><table><tr><th>Kategori</th><th>Harga Perolehan</th><th>Beban Bulan Ini</th><th>Beban Tahun Berjalan</th><th>Akumulasi Penyusutan</th><th>Nilai Buku</th></tr>';
    Object.keys(G).forEach((k) => { const g = G[k]; h += `<tr><td>${esc(k)}</td>${nc(g.cost)}${nc(g.bln)}${nc(g.ytd)}${nc(g.akum)}${nc(g.nb)}</tr>`; });
    return h + '</table>' + tandaTangan();
  }

  function renderRekon() {
    const { o } = KDMP.fitur.dataUnit();
    const rs = hitung();
    const biaya = {}, akum = {};
    const K = aset.KATEGORI;
    rs.forEach((r) => {
      const c = K[r.a.kat];
      if (!c) return;
      biaya[c[0]] = (biaya[c[0]] || 0) + r.cost;
      if (c[1]) akum[c[1]] = (akum[c[1]] || 0) + r.akum;
    });
    const akunAset = [...new Set(KAT.map((k) => K[k][0]))];
    const akunAkum = [...new Set(KAT.filter((k) => K[k][1]).map((k) => K[k][1]))];
    const baris = (l, m) => l.filter((c) => Math.abs(m[c] || 0) > 0.5 || Math.abs(o.cum[c] || 0) > 0.5).map((c) => [c + ' ' + KDMP.core.coa.nama(c), m[c] || 0, o.cum[c] || 0]);
    return kop('REKONSILIASI ASET TETAP') + rekonsiliasi(baris(akunAset, biaya), 'Harga Perolehan') + rekonsiliasi(baris(akunAkum, akum), 'Akumulasi Penyusutan') +
      `<div class=bar><button class=p ${klik('aset.jurnalPenyusutan')}>Buat jurnal penyusutan bulan ${NAMA_BULAN[KDMP.app.bulan() - 1]}</button><span class=c>Membuat jurnal Debit Beban Penyusutan / Kredit Akumulasi Penyusutan di tab Jurnal (no bukti DEP-${app.data.tahun}${pad2(KDMP.app.bulan())}). Jika dibuat ulang, jurnal lama bulan itu diganti.</span></div>`;
  }

  function render() {
    const [v, bar] = subTab('BP Aset', ['Daftar Aset', 'Jadwal Penyusutan', 'Rekonsiliasi & Jurnal']);
    KDMP.ui.dom.isi(bar + (v == 'Daftar Aset' ? renderDaftar() : v == 'Jadwal Penyusutan' ? renderJadwal() : renderRekon()));
  }

  KDMP.ui.aksi.daftar({ 'aset.jurnalPenyusutan': () => buatJurnalPenyusutan() });
  KDMP.app.tab['BP Aset'] = { render };
})(globalThis.KDMP);
