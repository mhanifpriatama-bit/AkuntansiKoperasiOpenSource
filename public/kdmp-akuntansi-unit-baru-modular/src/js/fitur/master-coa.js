/*
 * Tab Master COA (hanya Konsolidasi/Admin) serta ekspor/impor COA. Aturan validasi ada di KDMP.core.coa.
 * Akun yang sudah dipakai di jurnal tidak boleh diubah kodenya, saldo normalnya, atau dihapus.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { esc, kodeAkun } = KDMP.core.format;
  const { klik, ubah, input, arg } = KDMP.ui.aksi;
  const coa = KDMP.core.coa;
  const app = KDMP.app.state;
  const simpanCoa = () => KDMP.storage.coaDb.simpan();
  const gambarUlang = () => KDMP.app.navigasi.pergi();

  /** Jumlah baris jurnal per kode akun (semua unit pada mode Konsolidasi). */
  function akunDipakai() {
    const u = {};
    (app.konsol ? Object.values(app.data.units || {}) : [app.data]).forEach((x) => (x.rows || []).forEach((r) => {
      const c = kodeAkun(r.ak);
      if (c) u[c] = (u[c] || 0) + 1;
    }));
    return u;
  }

  function tambah() {
    const k = $('#nk').value.trim();
    const n = $('#nn').value.trim();
    const m = $('#nm').value;
    const e = coa.galatKode(k, -1);
    if (e) return alert(e);
    if (!n) return alert('Nama akun wajib diisi.');
    if (m != coa.saldoNormalBawaan(k) && !confirm('Saldo normal berbeda dari kebiasaan golongan akun ini. Tetap lanjut?')) return;
    coa.tambah(k, n, m);
    simpanCoa();
    gambarUlang();
    KDMP.ui.pesan.toast('Akun ' + k + ' ditambahkan');
  }

  function ubahBaris(i, jenis, v) {
    const a = coa.daftar[i];
    v = v.trim();
    if (jenis == 'n') {
      if (!v) { alert('Nama akun wajib diisi.'); return gambarUlang(); }
      coa.ubahNama(i, v);
    } else if (jenis == 'k') {
      const e = coa.galatKode(v, i);
      if (e) { alert(e); return gambarUlang(); }
      coa.ubahKode(i, v);
    } else coa.ubahSaldoNormal(i, v);
    simpanCoa();
    if (jenis == 'k') gambarUlang();
  }

  function hapus(i) {
    const a = coa.daftar[i];
    if (!confirm('Hapus akun ' + a[0] + ' ' + a[1] + '?')) return;
    coa.hapus(i);
    simpanCoa();
    gambarUlang();
  }

  function kembalikanBawaan() {
    const u = akunDipakai();
    const bawaan = new Set(coa.bawaan.map((a) => a[0]));
    const bad = Object.keys(u).filter((c) => !bawaan.has(c));
    if (bad.length) return alert('Tidak bisa dikembalikan: akun tambahan berikut masih dipakai di jurnal: ' + bad.join(', '));
    if (!confirm('Kembalikan seluruh akun ke daftar bawaan? Akun tambahan dan perubahan nama akan hilang.')) return;
    coa.kembalikanBawaan();
    KDMP.storage.coaDb.hapus();
    gambarUlang();
  }

  const ekspor = () => KDMP.ui.berkas.simpanJson('KDMP_COA.json', { app: KDMP.config.aplikasi.idTeknis.coa, tgl: new Date().toLocaleString('id-ID'), coa: coa.daftar });

  function impor(berkas) {
    if (!berkas) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        if (o.app != KDMP.config.aplikasi.idTeknis.coa || !Array.isArray(o.coa)) throw 0;
        const baru = o.coa;
        if (!baru.every(coa.barisImporValid)) throw 0;
        const u = akunDipakai();
        const m = {};
        baru.forEach((a) => (m[a[0]] = a[2]));
        const bad = Object.keys(u).filter((c) => m[c] !== coa.saldoNormal[c]);
        if (bad.length) return alert('COA ditolak: akun yang sudah dipakai di jurnal harus tetap ada dengan saldo normal sama (' + bad.slice(0, 6).join(', ') + ').');
        if (!confirm('Ganti daftar akun dengan ' + baru.length + ' akun dari file ini?')) return;
        coa.ganti(baru);
        simpanCoa();
        gambarUlang();
        KDMP.ui.pesan.toast('COA diimpor');
      } catch (e) { alert('File bukan ekspor COA KDMP yang valid.'); }
    };
    r.readAsText(berkas);
  }

  function render() {
    const u = akunDipakai();
    let h = `<div class=bar><b>Tambah akun:</b><input id=nk placeholder="Kode, mis. 6.1.9.24" style="width:160px" ${input('coa.kodeBaru')}><input id=nn placeholder="Nama akun" style="width:320px"><select id=nm><option>Debit</option><option>Kredit</option></select><button class=p ${klik('coa.tambah')}>Tambah</button></div><div class=bar><input placeholder="Cari kode / nama akun" style="width:260px" ${input('coa.cari')}><button ${klik('coa.ekspor')}>Ekspor COA</button><label class=btn>Impor COA<input type=file accept=.json style=display:none ${ubah('coa.impor')}></label><button ${klik('coa.reset')}>Kembalikan ke bawaan</button><span class=c>${coa.daftar.length} akun · kode dan saldo normal terkunci jika akun sudah dipakai di jurnal unit · setelah mengubah COA, bagikan file ekspornya ke komputer unit (tab Data → Impor COA)</span></div><table id=ct><tr><th>Kode Akun</th><th>Nama Akun</th><th>Saldo Normal</th><th>Dipakai (baris jurnal)</th><th></th></tr>`;
    coa.daftar.forEach((a, i) => {
      const n = u[a[0]] || 0;
      h += `<tr data-t="${esc((a[0] + ' ' + a[1]).toLowerCase())}"><td>${n ? esc(a[0]) : `<input class=i value="${esc(a[0])}" ${ubah('coa.ubah', { i, fl: 'k' })}>`}</td><td><input class=i value="${esc(a[1])}" ${ubah('coa.ubah', { i, fl: 'n' })}></td><td>${n ? a[2] : `<select ${ubah('coa.ubah', { i, fl: 'm' })}><option${a[2] == 'Debit' ? ' selected' : ''}>Debit</option><option${a[2] == 'Kredit' ? ' selected' : ''}>Kredit</option></select>`}</td><td class=n>${n || '-'}</td><td>${n ? '' : `<button ${klik('coa.hapus', { i })}>Hapus</button>`}</td></tr>`;
    });
    KDMP.ui.dom.isi(h + '</table>');
  }

  KDMP.ui.aksi.daftar({
    'coa.kodeBaru': (el) => { if (coa.POLA_KODE.test(el.value)) $('#nm').value = coa.saldoNormalBawaan(el.value); },
    'coa.tambah': () => tambah(),
    'coa.cari': (el) => {
      const q = el.value.toLowerCase();
      document.querySelectorAll('#ct tr[data-t]').forEach((r) => (r.style.display = r.dataset.t.includes(q) ? '' : 'none'));
    },
    'coa.ubah': (el) => ubahBaris(+arg(el, 'i'), arg(el, 'fl'), el.value),
    'coa.hapus': (el) => hapus(+arg(el, 'i')),
    'coa.reset': () => kembalikanBawaan(),
    'coa.ekspor': () => ekspor(),
    'coa.impor': (el) => impor(el.files[0])
  });
  KDMP.app.tab['Master COA'] = { render };
})(globalThis.KDMP);
