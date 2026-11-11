/*
 * Backup & pemulihan database lengkap (tampilan/ interaksi). Logika berkas ada di KDMP.storage.backup.
 */
(function (KDMP) {
  'use strict';
  const kv = KDMP.storage.kv;
  const backup = KDMP.storage.backup;

  async function unduh() {
    const b = await backup.buatBerkas();
    await KDMP.ui.berkas.simpanSebagai(b.nama, new Blob([b.isi], { type: 'application/json' }));
    backup.tandaiSudahBackup();
  }

  function pulihDariBerkas(berkas) {
    if (!berkas) return;
    const r = new FileReader();
    r.onload = async () => {
      try {
        const o = backup.bacaBerkas(r.result);
        if ((await kv.get('meta')) && !confirm('Data di database browser ini akan DITIMPA oleh file backup. Lanjut?')) return;
        await backup.pulihkan(o);
        alert('Berhasil dipulihkan. Masuk dengan sandi LAMA Anda.');
        location.reload();
      } catch (e) { alert('File bukan cadangan lengkap KDMP.'); }
    };
    r.readAsText(berkas);
  }

  KDMP.ui.aksi.daftar({
    'backup.unduh': (el) => { unduh(); KDMP.ui.dom.tutupMenu(el); },
    'backup.pulihkan': (el) => { pulihDariBerkas(el.files[0]); el.value = ''; }, // File tetap valid setelah input dikosongkan
    'backup.pilihBerkas': (el) => { document.getElementById('rf').click(); KDMP.ui.dom.tutupMenu(el); }
  });
  KDMP.app.cadangan = { unduh, pulihDariBerkas };
})(globalThis.KDMP);
