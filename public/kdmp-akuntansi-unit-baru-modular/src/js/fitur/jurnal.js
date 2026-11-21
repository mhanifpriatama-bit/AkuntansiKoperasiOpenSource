/*
 * Tab Jurnal: entri jurnal umum per periode. Baris jurnal: {d: tanggal ISO, no, ak: "kode nama", db, kr, ket, kom}.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { esc, rupiah, angkaInput, bacaAngka, periodeDari, hariIni, kodeAkun, NAMA_BULAN } = KDMP.core.format;
  const { klik, ubah, input, arg } = KDMP.ui.aksi;
  const { kolomTanggal } = KDMP.ui.tanggalAngka;
  const app = KDMP.app.state;
  const simpan = () => KDMP.app.simpan.jadwalkan();

  /** Menampilkan total debit/kredit periode di bawah tabel. */
  function totalPeriode() {
    const P = KDMP.app.periode();
    let a = 0, b = 0;
    app.data.rows.forEach((r) => { if (!r.d || periodeDari(r.d) == P) { a += +r.db || 0; b += +r.kr || 0; } });
    const x = $('#jtd'), y = $('#jtk');
    if (x) x.textContent = rupiah(a);
    if (y) y.textContent = rupiah(b);
  }

  function tambahBaris(n) {
    for (let i = 0; i < n; i++) app.keep.add(app.data.rows[app.data.rows.push({ d: hariIni() }) - 1]);
    simpan();
    KDMP.app.navigasi.pergi();
  }

  function hapusBaris(i) {
    const r = app.data.rows[i];
    if (!r) return;
    const u = (r.ak || '(akun kosong)') + ' | Debit ' + rupiah(+r.db || 0) + ' | Kredit ' + rupiah(+r.kr || 0);
    if (!confirm('Hapus baris jurnal ini?\n\n' + u + '\n\n(Konfirmasi 1 dari 2)')) return;
    if (!confirm('Yakin ingin menghapus? Baris yang dihapus tidak dapat dikembalikan.\n\n(Konfirmasi 2 dari 2)')) return;
    app.data.rows.splice(i, 1);
    simpan();
    KDMP.app.navigasi.pergi();
  }

  function render() {
    const d = app.data;
    const P = KDMP.app.periode();
    const Y = +d.tahun;
    const NM = KDMP.core.coa.saldoNormal;
    const tampil = [];
    d.rows.forEach((r, i) => { if (!r.d || periodeDari(r.d) == P || app.keep.has(r)) tampil.push(i); });
    const otomatis = KDMP.core.arusKas.komponenOtomatis(d.rows, Y, P, (k) => !!NM[k]);

    let h = `<div class=bar><button ${klik('jurnal.tambah', { n: 1 })}>+ Baris</button><button ${klik('jurnal.tambah', { n: 10 })}>+10 Baris</button><span class=c><b>Periode ${NAMA_BULAN[KDMP.app.bulan() - 1]} ${d.tahun}</b> (${tampil.length} baris). Ganti bulan/tahun di kanan atas untuk membuat atau melihat jurnal periode lain; data periode sebelumnya tetap tersimpan. Ketik sebagian nama/kode akun untuk mencari. Saldo awal: isi Keterangan <b>Saldo Awal</b> (sekali saja, pada periode pertama). Komponen arus kas pada baris kas/bank terisi otomatis dari akun lawan (No Bukti sama); pilih manual bila ingin mengubahnya.</span></div><table><tr><th>#</th><th>Tanggal</th><th>No Bukti</th><th>Akun</th><th>Debit</th><th>Kredit</th><th>Keterangan</th><th>Komponen Arus Kas</th><th></th></tr>`;
    tampil.forEach(function (i, n) {
      const r = d.rows[i];
      const salah = r.ak && !NM[kodeAkun(r.ak)];
      const m = otomatis.get(r);
      const al = m ? Object.keys(m).join(' + ') : '';
      const teks = (k) => `<td><input class="i" ${k == 'ak' ? 'list=dl' : ''} value="${esc(r[k])}" ${ubah('jurnal.isi', { i, k })}></td>`;
      const angka = (k) => `<td class=n><input class="i n" data-f=1 inputmode=numeric value="${angkaInput(r[k])}" ${input('angka.ketik')} ${ubah('jurnal.angka', { i, k })}></td>`;
      h += `<tr class="${salah ? 'bad' : ''}"><td class=c>${n + 1}</td><td>${kolomTanggal(r.d, 'rows:' + i + ':d', 1)}</td>${teks('no')}${teks('ak')}${angka('db')}${angka('kr')}${teks('ket')}<td><select ${ubah('jurnal.komponen', { i })}><option value="">${al ? '(otomatis) ' + esc(al) : ''}</option>${KDMP.config.komponenArusKas.map((x) => `<option ${r.kom == x ? 'selected' : ''}>${x}</option>`).join('')}</select></td><td><button ${klik('jurnal.hapus', { i })}>×</button></td></tr>`;
    });
    KDMP.ui.dom.isi(h + `</table><p>Total Debit <b id=jtd></b> | Total Kredit <b id=jtk></b> <span class=c>(periode ini)</span></p>`);
    totalPeriode();
  }

  KDMP.ui.aksi.daftar({
    'jurnal.tambah': (el) => tambahBaris(+arg(el, 'n')),
    'jurnal.hapus': (el) => hapusBaris(+arg(el, 'i')),
    'jurnal.isi': (el) => { app.data.rows[+arg(el, 'i')][arg(el, 'k')] = el.value; simpan(); KDMP.ui.header.status(); },
    'jurnal.angka': (el) => {
      const v = bacaAngka(el.value);
      app.data.rows[+arg(el, 'i')][arg(el, 'k')] = v;
      el.value = angkaInput(v);
      simpan();
      KDMP.ui.header.status();
      totalPeriode();
    },
    'jurnal.komponen': (el) => { app.data.rows[+arg(el, 'i')].kom = el.value; simpan(); }
  });

  KDMP.app.tab['Jurnal'] = { render };
})(globalThis.KDMP);
