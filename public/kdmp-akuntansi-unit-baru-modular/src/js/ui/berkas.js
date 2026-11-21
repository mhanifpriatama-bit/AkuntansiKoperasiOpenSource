/*
 * Menyimpan berkas ke komputer pengguna dan mencetak.
 */
(function (KDMP) {
  'use strict';

  /** Menyimpan Blob: memakai dialog "Simpan sebagai" bila browser mendukung, selain itu unduh biasa. */
  async function simpanSebagai(nama, blob) {
    if (window.showSaveFilePicker) {
      try {
        const h = await showSaveFilePicker({ suggestedName: nama });
        const w = await h.createWritable();
        await w.write(blob);
        await w.close();
        return;
      } catch (e) { if (e.name == 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nama;
    a.click();
  }

  const simpanJson = (nama, obj) => simpanSebagai(nama, new Blob([JSON.stringify(obj)], { type: 'application/json' }));

  /** Mencetak tampilan; orientasi landscape untuk konsolidasi dan buku pembantu. */
  function cetak() {
    const app = KDMP.app.state; // state dibaca saat dipanggil (modul app dimuat setelah ui)
    const st = document.createElement('style');
    st.textContent = '@page{size:A4 ' + (app.konsol || /^BP /.test(app.tab) ? 'landscape' : 'portrait') + ';margin:12mm}';
    document.head.appendChild(st);
    window.print();
    setTimeout(() => st.remove(), 800);
  }

  KDMP.ui.berkas = { simpanSebagai, simpanJson, cetak };
})(globalThis.KDMP);
