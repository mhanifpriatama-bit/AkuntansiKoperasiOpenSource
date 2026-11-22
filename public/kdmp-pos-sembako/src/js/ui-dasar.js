/*
 * Antarmuka POS: dasar (state, penanganan peristiwa, router tab) dan helper bersama.
 * Peristiwa: klik pada [data-a="nama"] memanggil POS.A[nama](el); perubahan pada [data-f="jalur"] menyimpan nilai ke POS.F.
 */
(function (POS) {
  'use strict';
  const A = (POS.A = {});   // aksi klik
  const F = (POS.F = {});   // keadaan formulir per tab
  const R = (POS.R = {});   // render per tab
  const U = (POS.u = {});
  let S = null;

  U.esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  U.rp = (x) => (x < 0 ? '-' : '') + 'Rp ' + Math.abs(Math.round(x || 0)).toLocaleString('id-ID');
  U.qty = (x) => (Math.round((x || 0) * 1000) / 1000).toLocaleString('id-ID');
  U.hariIni = () => new Date().toLocaleDateString('sv-SE');
  U.tglId = (d) => { const [y, m, t] = d.split('-'); return t + '/' + m + '/' + y; };
  U.s = () => S;
  U.hasil = () => POS.mesin.hitung(S);
  U.opt = (daftar, pilih, kosong) => (kosong != null ? `<option value="">${U.esc(kosong)}</option>` : '') + daftar.map(([v, l]) => `<option value="${U.esc(v)}"${String(v) === String(pilih) ? ' selected' : ''}>${U.esc(l)}</option>`).join('');
  U.namaPelanggan = (id) => (S.pelanggan.find((p) => p.id === id) || { nama: 'Umum' }).nama;
  U.namaPemasok = (id) => (S.pemasok.find((p) => p.id === id) || { nama: '-' }).nama;
  U.barang = (k) => S.barang.find((b) => b.k === k);
  U.datalistBarang = () => '<datalist id=dlb>' + S.barang.map((b) => `<option value="${U.esc(b.k)}" label="${U.esc(b.n)}">`).join('') + '</datalist>';
  U.akunCoa = (awalan) => ((S.tpl && S.tpl.coa) || []).filter((a) => a[0].startsWith(awalan)).map((a) => [a[0], a[0] + ' ' + a[1]]);

  const toast = (t, galat) => {
    let e = document.getElementById('toast');
    if (!e) { e = document.createElement('div'); e.id = 'toast'; e.style.cssText = 'position:fixed;bottom:14px;left:50%;transform:translateX(-50%);padding:9px 16px;border-radius:8px;color:#fff;z-index:9;max-width:90vw'; document.body.appendChild(e); }
    e.style.background = galat ? '#b42318' : '#1a7f37'; e.textContent = t; e.style.display = 'block';
    clearTimeout(toast.t); toast.t = setTimeout(() => { e.style.display = 'none'; }, galat ? 6000 : 2200);
  };
  U.toast = toast;
  POS.status = (t) => { const e = document.getElementById('st'); if (e) e.textContent = t; };

  /** Menambahkan transaksi; ditolak (dikembalikan) bila menimbulkan galat pada mesin (stok minus, jurnal tak seimbang, dst). */
  U.simpanTx = (t) => {
    t.id = 't' + (++S.seq); t.urut = S.seq;
    S.tx.push(t);
    const h = U.hasil();
    if (h.galat.length) { S.tx.pop(); S.seq--; toast(h.galat.slice(0, 3).join(' '), true); return false; }
    POS.simpan.jadwalkan(S);
    return true;
  };
  U.hapusTx = (id) => {
    const i = S.tx.findIndex((t) => t.id === id);
    if (i < 0) return false;
    const [t] = S.tx.splice(i, 1);
    const adaRujukan = S.tx.some((x) => x.ref === id);
    const h = U.hasil();
    if (adaRujukan || h.galat.length) { S.tx.splice(i, 0, t); toast(adaRujukan ? 'Transaksi ini dirujuk transaksi lain (retur); hapus returnya dulu.' : 'Tidak bisa dihapus: ' + h.galat[0], true); return false; }
    POS.simpan.jadwalkan(S);
    return true;
  };
  U.perlu = () => { if (S.tpl) return ''; return '<div class=info>Belum ada template. Buka <b>Menu › Ekspor/Impor</b> dan impor template dari akuntansiApp dulu. <button class=x data-a="tab" data-t="Ekspor/Impor">Buka Ekspor/Impor</button></div>'; };
  // Angka gaya Indonesia: "1.500" = 1500 (titik ribuan), "2,5" = 2,5, "2.5" = 2,5 (titik diikuti bukan tiga angka)
  U.ubahBilangan = (v) => {
    let t = String(v).trim();
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    const n = Number(t); return isNaN(n) ? 0 : n;
  };

  const TAB = ['Kasir', 'Pembelian', 'Retur', 'Piutang & Utang', 'Stok & Opname', 'Kas', 'Master', 'Riwayat', 'Ekspor/Impor'];
  let tab = null;

  function render() {
    const panel = document.getElementById('menupanel');
    panel.innerHTML = TAB.map((t) => `<button data-a="tab" data-t="${U.esc(t)}" class="${t === tab ? 'on' : ''}">${U.esc(t)}</button>`).join('');
    panel.hidden = true;
    document.getElementById('menu').setAttribute('aria-expanded', 'false');
    const info = S.tpl ? `${U.esc(S.tpl.unit)} · periode ${S.tpl.periode.tahun}-${String(S.tpl.periode.bulan).padStart(2, '0')}` : 'Belum ada template';
    document.getElementById('info').textContent = info;
    document.getElementById('isi').innerHTML = R[tab] ? R[tab]() : '';
    if (U.fokus) { const e = document.getElementById(U.fokus); U.fokus = null; if (e) e.focus(); }
  }
  U.render = render;
  U.pergi = (t) => { tab = t; render(); window.scrollTo(0, 0); };
  U.pos = () => tab;

  function setJalur(jalur, nilai) {
    const p = jalur.split('.');
    let o = F;
    for (let i = 0; i < p.length - 1; i++) { if (o[p[i]] == null) o[p[i]] = {}; o = o[p[i]]; }
    o[p[p.length - 1]] = nilai;
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const f = A[el.dataset.a];
    if (!f) return;
    const r = f(el, e);
    if (r && r.catch) r.catch((x) => toast(String((x && x.message) || x), true));
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-f]');
    if (el) {
      const v = el.type === 'checkbox' ? el.checked : el.dataset.t === 'num' ? U.ubahBilangan(el.value) : el.value;
      setJalur(el.dataset.f, v);
      if (el.dataset.r) { const g = A[el.dataset.r]; if (g) g(el, e); }
      return;
    }
    const b = e.target.closest('[data-b]'); // berkas
    if (b && A[b.dataset.b]) { const r = A[b.dataset.b](b, e); if (r && r.catch) r.catch((x) => toast(String((x && x.message) || x), true)); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const el = e.target.closest && e.target.closest('[data-enter]');
    if (!el) return;
    e.preventDefault();
    const r = A[el.dataset.enter](el, e);
    if (r && r.catch) r.catch((x) => toast(String((x && x.message) || x), true));
  });
  A.tab = (el) => U.pergi(el.dataset.t);
  A.menu = () => { const p = document.getElementById('menupanel'); p.hidden = !p.hidden; document.getElementById('menu').setAttribute('aria-expanded', String(!p.hidden)); };
  document.addEventListener('click', (e) => { const p = document.getElementById('menupanel'); if (p && !p.hidden && !e.target.closest('#menupanel') && !e.target.closest('#menu')) p.hidden = true; });

  POS.mulai = async function () {
    S = await POS.simpan.muat();
    POS.S = S;
    F.kasir = { tgl: U.hariIni(), pelanggan: '', k: '', q: 1, harga: '', item: [], tunai: 0, bank: 0, kredit: 0 };
    F.beli = { tgl: U.hariIni(), pemasok: '', faktur: '', k: '', q: 1, h: '', item: [], cara: 'kredit' };
    F.retur = { tglJ: U.hariIni(), refJ: '', caraJ: 'tunai', qJ: {}, tglB: U.hariIni(), refB: '', caraB: 'utang', qB: {} };
    F.bayar = { tgl: U.hariIni(), pelanggan: '', tunai: 0, bank: 0, pemasokId: '', jumlah: 0, dari: 'tunai', tglB: U.hariIni() };
    F.opname = { tgl: U.hariIni(), fisik: {} };
    F.kas = { tgl: U.hariIni(), jumlah: 0 };
    F.ekspor = { dari: '', sampai: '' };
    tab = 'Kasir';
    render();
    if (!POS.simpan.tersedia()) toast('IndexedDB tidak tersedia: data hanya di memori. Unduh backup secara rutin.', true);
  };
  POS.ganti = (baru) => { S = baru; POS.S = S; };
})(globalThis.POS = globalThis.POS || {});
