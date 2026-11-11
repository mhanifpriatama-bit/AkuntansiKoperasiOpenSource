/*
 * Kop laporan (logo, nama koperasi, judul, periode), isian data koperasi, dan kolom tanda tangan.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;
  const { klik, ubah, arg } = KDMP.ui.aksi;
  const { tanggalPanjang } = KDMP.core.format;
  const apl = KDMP.config.aplikasi;

  /** Logo yang dipakai: logo kustom pengguna (data URL di state) atau logo bawaan dari konfigurasi. */
  const logo = () => { const d = KDMP.app.state.data; return (d && d.logo) || apl.logo; };
  const tanggalLaporan = () => { const d = KDMP.app.state.data; return tanggalPanjang(+d.tahun, KDMP.app.bulan()); };

  /** Kop di atas tiap laporan. `judul` mis. "NERACA SALDO". */
  function kop(judul) {
    const d = KDMP.app.state.data;
    return `<div class=hd><img src="${logo()}" alt="Logo"><div class=ht><b>${(d.kop || apl.singkatan).toUpperCase()}</b><br>${d.alamat || ''}<h3>${judul}</h3><b>${KDMP.app.state.konfig.name.toUpperCase()}</b><br>${/LABA RUGI|ARUS KAS/.test(judul) ? 'Untuk periode yang berakhir sampai dengan ' : 'Per '}${tanggalLaporan()}<br><i>(dalam rupiah)</i></div></div>`;
  }

  const KOLOM_IDENTITAS = [['kop', 'Nama koperasi'], ['alamat', 'Alamat'], ['kota', 'Kab/Kota'], ['pet', 'Petugas Akuntansi'], ['ben', 'Bendahara'], ['ket', 'Ketua Koperasi']];

  /** Isian identitas koperasi + logo (tab Data). */
  function isianIdentitas() {
    const d = KDMP.app.state.data;
    return '<div class=bar style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' +
      KOLOM_IDENTITAS.map(([k, l]) => `<label>${l}<br><input style=width:95% value="${(d[k] || '').replace(/"/g, '&quot;')}" ${ubah('kop.isi', { k })}></label>`).join('') +
      '</div><div style="margin-top:8px">Logo: <img src="' + logo() + '" style="height:44px;vertical-align:middle"> <input type=file accept="image/*" ' + ubah('kop.logo') + '> <button ' + klik('kop.logoAwal') + '>Logo awal</button></div>';
  }

  /** Tanda tangan di bawah laporan. */
  function tandaTangan() {
    const d = KDMP.app.state.data;
    const c = (x, k) => `<td style="text-align:center;width:33%"><b>${x}</b><br><br><br><br><b><u>${d[k] || '………………'}</u></b></td>`;
    return `<table class=sg style="margin-top:20px"><tr><td></td><td></td><td style="text-align:center">${d.kota || ''}, ${tanggalLaporan()}</td></tr><tr>${c('Petugas Akuntansi', 'pet')}${c('Bendahara', 'ben')}${c('Ketua Koperasi', 'ket')}</tr></table>`;
  }

  /** Memperkecil gambar logo (maks 260 px) lalu menyimpannya sebagai data URL di data unit. */
  function pasangLogo(berkas) {
    if (!berkas) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 260 / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.width * k));
        c.height = Math.max(1, Math.round(im.height * k));
        const g = c.getContext('2d');
        g.drawImage(im, 0, 0, c.width, c.height);
        let d = c.toDataURL('image/png');
        if (d.length > 120000) { // PNG terlalu besar -> JPEG berlatar putih
          g.globalCompositeOperation = 'destination-over';
          g.fillStyle = '#fff';
          g.fillRect(0, 0, c.width, c.height);
          d = c.toDataURL('image/jpeg', 0.85);
        }
        KDMP.app.state.data.logo = d;
        KDMP.app.simpan.jadwalkan();
        $('#lg').src = logo();
        KDMP.app.navigasi.pergi();
      };
      im.onerror = () => alert('File gambar tidak dapat dibaca.');
      im.src = r.result;
    };
    r.readAsDataURL(berkas);
  }

  KDMP.ui.aksi.daftar({
    'kop.isi': (el) => { KDMP.app.state.data[arg(el, 'k')] = el.value; KDMP.app.simpan.jadwalkan(); },
    'kop.logo': (el) => pasangLogo(el.files[0]),
    'kop.logoAwal': () => {
      if (!confirm('Kembalikan ke logo awal?')) return;
      delete KDMP.app.state.data.logo;
      KDMP.app.simpan.jadwalkan();
      $('#lg').src = logo();
      KDMP.app.navigasi.pergi();
    }
  });

  KDMP.ui.kop = { logo, tanggalLaporan, kop, isianIdentitas, tandaTangan };
})(globalThis.KDMP);
