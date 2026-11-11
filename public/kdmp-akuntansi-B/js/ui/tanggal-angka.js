/*
 * Kolom isian tanggal (ketik dd/mm/yyyy + pemilih kalender) dan kolom angka berformat Indonesia.
 * Isian tanggal menyimpan ke state lewat atribut data-t="<daftar>:<indeks>:<kolom>" (daftar = 'rows' atau nama buku pembantu).
 */
(function (KDMP) {
  'use strict';
  const { esc, tanggalId, bacaTanggal, periodeDari, NAMA_BULAN } = KDMP.core.format;
  const { klik, ubah } = KDMP.ui.aksi;

  /** HTML kolom tanggal. `mengikutiPeriode` = baris dipindah ke periode lain bila tanggal berubah bulan. */
  const kolomTanggal = (v, t, mengikutiPeriode) =>
    `<div class=dt data-t="${t}" data-v="${esc(v || '')}"${mengikutiPeriode ? ' data-fl=1' : ''}><input class="i dti" placeholder="dd/mm/yyyy" value="${tanggalId(v)}" ${ubah('tanggal.set')}><button type=button class=dtb title="Pilih tanggal" ${klik('tanggal.pilih')}>&#128197;</button><input type=date class=dtp tabindex=-1 value="${esc(v || '')}" ${ubah('tanggal.set')}></div>`;

  function bukaKalender(tombol) {
    const p = tombol.parentNode.querySelector('.dtp');
    try { p.showPicker(); } catch (e) { try { p.focus(); p.click(); } catch (e2) { /* browser lama: abaikan */ } }
  }

  function simpanTanggal(el) {
    const app = KDMP.app.state;
    const w = el.closest('.dt');
    const t = w.dataset.t.split(':');
    const tx = w.querySelector('.dti');
    const pk = w.querySelector('.dtp');
    let v;
    if (el.type == 'date') v = el.value;
    else if (!el.value.trim()) v = '';
    else {
      v = bacaTanggal(el.value);
      if (!v) { KDMP.ui.pesan.toast('Format tanggal: dd/mm/yyyy'); tx.value = tanggalId(w.dataset.v); return; }
    }
    w.dataset.v = v;
    tx.value = tanggalId(v);
    pk.value = v;
    const daftar = t[0] == 'rows' ? app.data.rows : KDMP.app.sub(t[0]);
    daftar[+t[1]][t[2]] = v;
    KDMP.app.simpan.jadwalkan();
    if (t[0] == 'rows') KDMP.ui.header.status();
    if (w.dataset.fl && v) {
      const q = periodeDari(v);
      if (q != KDMP.app.periode()) {
        app.keep.delete(daftar[+t[1]]);
        const m = q % 12 || 12;
        const y = (q - m) / 12;
        KDMP.ui.pesan.toast('Baris dipindahkan ke periode ' + NAMA_BULAN[m - 1] + ' ' + y);
        KDMP.app.navigasi.pergi();
      }
    }
  }

  /** Memformat angka saat mengetik (titik ribuan, koma desimal maks 2 digit) sambil menjaga posisi kursor. */
  function formatSaatMengetik(el) {
    const v = el.value;
    const p = el.selectionStart;
    let k = 0;
    for (let i = 0; i < p; i++) if (/[\d,]/.test(v[i])) k++;
    const s = v.replace(/[^\d,]/g, '');
    const ci = s.indexOf(',');
    let a = ci < 0 ? s : s.slice(0, ci);
    const b = ci < 0 ? null : s.slice(ci + 1).replace(/,/g, '').slice(0, 2);
    a = a.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const nv = a + (b === null ? '' : ',' + b);
    el.value = nv;
    let c = 0;
    let np = 0;
    for (; np < nv.length && c < k; np++) if (/[\d,]/.test(nv[np])) c++;
    try { el.setSelectionRange(np, np); } catch (e) { /* tipe input tak mendukung */ }
  }

  KDMP.ui.aksi.daftar({
    'tanggal.set': (el) => simpanTanggal(el),
    'tanggal.pilih': (el) => bukaKalender(el),
    'angka.ketik': (el) => formatSaatMengetik(el)
  });
  KDMP.ui.tanggalAngka = { kolomTanggal, formatSaatMengetik };
})(globalThis.KDMP);
