/*
 * Tab Data (unit): identitas koperasi, ekspor paket, backup/pulih, ganti sandi, hapus semua data unit.
 */
(function (KDMP) {
  'use strict';
  const { klik, ubah } = KDMP.ui.aksi;
  const app = KDMP.app.state;

  async function hapusSemua() {
    const p = await KDMP.ui.pesan.mintaSandi('Masukkan <b>sandi login</b> untuk menghapus semua data unit ini:');
    if (p === null) return;
    if (p !== app.kunci.PIN) return alert('Sandi salah. Data tidak dihapus.');
    if (!confirm('Hapus semua data unit ini? Tindakan ini tidak bisa dibatalkan.')) return;
    app.data.rows = [];
    app.keep.clear();
    KDMP.app.simpan.jadwalkan();
    KDMP.app.navigasi.pergi('Jurnal');
  }

  function render() {
    KDMP.ui.dom.isi(`<div class=bar>${KDMP.ui.kop.isianIdentitas()}</div><div class=bar><button class=p ${klik('paket.ekspor')}>Ekspor paket untuk bendahara (.kdmp.json)</button><button ${klik('backup.unduh')}>Unduh Backup Database (.json)</button><label>Pulihkan backup <input type=file accept=.json ${ubah('backup.pulihkan')}></label><label>Impor paket <input type=file accept=.json ${ubah('paket.impor')}></label><button ${klik('sandi.gantiUnit')}>Ganti sandi</button><button ${klik('sesi.keluar')}>Keluar</button><button ${klik('data.hapusSemua')}>Hapus semua</button></div><p id=ei class=c></p><p class=c>Data tersimpan otomatis di database IndexedDB browser ini (offline, tanpa server). Unduh <b>Backup Database (.json)</b> secara rutin — data akan hilang bila data situs browser dihapus. Klik <b>Simpan data ke file</b> untuk menyimpan salinan ke komputer (pilih folder, mis. Documents atau flashdisk) — lakukan rutin sebagai cadangan. Laporan: <b>Cetak / PDF</b> (pilih printer atau 'Simpan sebagai PDF') dan <b>Excel (CSV)</b>.</p>`);
    KDMP.app.paket.infoEkspor();
    KDMP.ui.dom.tambahDiAkhir(KDMP.app.panelDb.html());
  }

  KDMP.ui.aksi.daftar({ 'data.hapusSemua': () => hapusSemua() });
  KDMP.app.tab['Data'] = { render };
})(globalThis.KDMP);
