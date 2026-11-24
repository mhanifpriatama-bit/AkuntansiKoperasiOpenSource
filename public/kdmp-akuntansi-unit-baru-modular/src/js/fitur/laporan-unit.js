/*
 * Tab laporan satu unit: Neraca Saldo, Laba Rugi, Neraca (Laporan Posisi Keuangan), Arus Kas.
 * Semua angka dihitung oleh KDMP.core.*; berkas ini hanya merangkai tampilan.
 */
(function (KDMP) {
  'use strict';
  const { rupiah } = KDMP.core.format;
  const { hitungSaldo, labaRugiAkun, shuTahunSebelumnya } = KDMP.core.saldo;
  const { susunLaporan, perluasSpesifikasi } = KDMP.core.laporan;
  const { kop } = KDMP.ui.kop;
  const { tabelLaporan } = KDMP.ui.tabelLaporan;
  const { NAMA_BULAN } = KDMP.core.format;
  const app = KDMP.app.state;

  /** Saldo periode ini + nilai-nilai Laba Rugi (mis. shu_final) yang dibutuhkan baris tipe "L" di Neraca. */
  function dataUnit() {
    const o = hitungSaldo(app.data.rows, app.data.tahun, KDMP.app.bulan());
    const laba = susunLaporan(app.konfig.LR, labaRugiAkun(o.cumA));
    return { o, nilaiL: laba.key };
  }

  const namaAkun = (c) => KDMP.core.coa.nama(c);

  function renderNeracaSaldo() {
    const o = hitungSaldo(app.data.rows, app.data.tahun, KDMP.app.bulan());
    let h = kop('NERACA SALDO') + '<table><tr><th>Akun</th><th>Debit</th><th>Kredit</th><th>Saldo Akhir</th></tr>';
    let a = 0, b = 0;
    KDMP.core.coa.daftar.forEach(([c, n, s]) => {
      if (o.cum[c] === undefined) return;
      a += o.dr[c];
      b += o.kr[c];
      h += `<tr><td>${c} ${n}</td><td class=n>${rupiah(o.dr[c])}</td><td class=n>${rupiah(o.kr[c])}</td><td class=n>${rupiah(o.cum[c])} <span class=c>${s[0]}</span></td></tr>`;
    });
    const pr = shuTahunSebelumnya(o);
    if (Math.abs(pr) >= 0.5) {
      h += `<tr><td>SHU tahun-tahun sebelumnya (otomatis)</td><td class=n>${pr < 0 ? rupiah(-pr) : '-'}</td><td class=n>${pr > 0 ? rupiah(pr) : '-'}</td><td class=n>${rupiah(Math.abs(pr))} <span class=c>${pr > 0 ? 'K' : 'D'}</span></td></tr>`;
      if (pr > 0) b += pr; else a -= pr;
    }
    KDMP.ui.dom.isi(h + `<tr class=g><td>JUMLAH</td><td class=n>${rupiah(a)}</td><td class=n>${rupiah(b)}</td><td></td></tr></table>`);
  }

  function renderLabaRugi() {
    const { o } = dataUnit();
    const m1 = labaRugiAkun(o.mon);
    const m2 = labaRugiAkun(o.cum);
    const spek = perluasSpesifikasi(app.konfig.LR, [m1, m2], namaAkun);
    const a = susunLaporan(spek, m1);
    const b = susunLaporan(spek, m2);
    KDMP.ui.dom.isi(kop('LAPORAN LABA RUGI') + tabelLaporan(a.rows, [a.rows.map((r) => r.v), b.rows.map((r) => r.v)], [NAMA_BULAN[KDMP.app.bulan() - 1], 's.d. bulan ini']));
  }

  function renderNeraca() {
    const { o, nilaiL } = dataUnit();
    const a = susunLaporan(perluasSpesifikasi(app.konfig.LPK, [o.M], namaAkun), o.M, nilaiL);
    const ok = Math.round(a.key.tot_aset - a.key.tot_ke) == 0;
    KDMP.ui.dom.isi(kop('LAPORAN POSISI KEUANGAN (NERACA)') + `<p class="${ok ? 'ok' : 'no'}">${ok ? 'Balance' : 'Tidak balance, selisih ' + rupiah(a.key.tot_aset - a.key.tot_ke)}</p>` + tabelLaporan(a.rows, [a.rows.map((r) => r.v)], ['Jumlah']));
  }

  function renderArusKas() {
    const { o } = dataUnit();
    const r = KDMP.core.arusKas.susunArusKas(o, KDMP.config.arusKas);
    const kas = Object.keys(o.M).filter((c) => c.startsWith('1.1.1.')).reduce((s, c) => s + o.M[c], 0);
    const selisih = r[r.length - 1].x - kas;
    let h = kop('LAPORAN ARUS KAS') + '<table><tr><th>Uraian</th><th>Jumlah</th></tr>';
    r.forEach((a) => {
      if (a.tp == 'e') return;
      h += `<tr class="${a.tp == 'h' ? 'h' + a.lv : a.lv == 1 ? 'g' : a.lv == 0 ? 't' : ''}"><td style="padding-left:${a.lv == 3 ? 24 : 6}px">${a.l}</td><td class=n>${a.tp == 'h' ? '' : rupiah(a.x)}</td></tr>`;
    });
    const cocok = Math.round(selisih) == 0;
    KDMP.ui.dom.isi(h + `</table><p class="${cocok ? 'ok' : 'no'}">${cocok ? 'Sesuai dengan Kas di Neraca' : 'Selisih terhadap Kas di Neraca ' + rupiah(selisih) + ' — ada mutasi kas tanpa Komponen Arus Kas'}</p>`);
  }

  KDMP.app.tab['Neraca Saldo'] = { render: renderNeracaSaldo };
  KDMP.app.tab['Laba Rugi'] = { render: renderLabaRugi };
  KDMP.app.tab['Neraca'] = { render: renderNeraca };
  KDMP.app.tab['Arus Kas'] = { render: renderArusKas };
  KDMP.fitur.dataUnit = dataUnit;
})(globalThis.KDMP);
