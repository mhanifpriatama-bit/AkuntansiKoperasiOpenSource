/*
 * Tab transaksi: Kasir (penjualan), Pembelian, Retur, Piutang & Utang, Stok & Opname, Kas.
 */
(function (POS) {
  'use strict';
  const { A, F, R, u: U } = POS;
  const { esc, rp, qty } = U;
  const kasir = () => F.kasir;

  const cariBarang = (teks) => {
    const t = String(teks || '').trim().toLowerCase();
    if (!t) return null;
    const S = U.s();
    return S.barang.find((b) => b.barcode && String(b.barcode).toLowerCase() === t) || S.barang.find((b) => b.k.toLowerCase() === t) || S.barang.find((b) => b.n.toLowerCase() === t) || S.barang.find((b) => b.n.toLowerCase().includes(t)) || S.barang.find((b) => b.k.toLowerCase().startsWith(t));
  };
  const tabelItem = (items, kolomHarga, hapusAksi, harga) => items.length
    ? `<table><tr><th>Barang</th><th class=n>Jumlah</th><th class=n>${kolomHarga}</th><th class=n>Jumlah Rp</th><th></th></tr>${items.map((x, i) => `<tr><td>${esc(x.k)} <span class=c>${esc((U.barang(x.k) || {}).n)}</span></td><td class=n>${qty(x.q)}</td><td class=n>${rp(harga(x))}</td><td class=n>${rp(POS.mesin.bulat(x.q * harga(x)))}</td><td><button class=k data-a="${hapusAksi}" data-i="${i}">hapus</button></td></tr>`).join('')}</table>`
    : '<p class=c>Belum ada barang.</p>';
  const total = (items, harga) => items.reduce((s, x) => s + POS.mesin.bulat(x.q * harga(x)), 0);

  // ---------- Kasir
  R['Kasir'] = () => {
    if (!U.s().tpl) return U.perlu();
    const S = U.s(), f = kasir();
    const tot = total(f.item, (x) => x.harga);
    return `<h2>Kasir — penjualan</h2>${U.datalistBarang()}
<div class=scan><label style="flex:1">Scan barcode (Enter)<input id=scan autocomplete=off inputmode=text placeholder="Arahkan pemindai ke sini, atau ketik kode lalu Enter" data-enter="kasir.scan"></label>
${POS.kamera.tersedia() ? '<button class=x data-a="kasir.kamera">Kamera</button>' : ''}</div>
<div class=card><div class=bar>
<label>Tanggal<input type=date value="${f.tgl}" data-f="kasir.tgl"></label>
<label>Pelanggan / anggota <span class=c>(ketik nama, kosongkan untuk Umum)</span>${U.inputOrang('pelanggan', f.pelanggan, 'kasir.pelanggan', { info: 'kinfo', kosong: 'Umum — ketik huruf nama anggota' })}<span id=kinfo class=c>${U.infoPelanggan(f.pelanggan)}</span></label></div>
<div class=bar><label>Barang (kode / nama)<input list=dlb value="${esc(f.k)}" data-f="kasir.k" data-r="kasir.pilih" style="width:220px"></label>
<label>Jumlah<input class="n s" value="${f.q}" data-f="kasir.q" data-t=num></label>
<label>Harga satuan<input class=n value="${f.harga}" data-f="kasir.harga" data-t=num></label>
<button class=x data-a="kasir.tambah">Masuk keranjang</button></div>
${f.peringatan ? `<div class=galat id=kpw><b>Tidak masuk keranjang:</b> ${esc(f.peringatan)}</div>` : ''}
<h3>Keranjang</h3>${tabelItem(f.item, 'Harga', 'kasir.hapus', (x) => x.harga)}
<p>Total <span class=tot id=ktot>${rp(tot)}</span></p>
<div class=bar><label>Tunai<input class=n value="${f.tunai || ''}" data-f="kasir.tunai" data-t=num data-r="kasir.sisa"></label>
<label>Non-tunai (bank/QRIS)<input class=n value="${f.bank || ''}" data-f="kasir.bank" data-t=num data-r="kasir.sisa"></label>
<label>Kredit (piutang)<input class=n value="${f.kredit || ''}" data-f="kasir.kredit" data-t=num data-r="kasir.sisa"></label>
<button class=x data-a="kasir.pas">Tunai pas</button></div>
<p id=ksisa class=c></p>
<div class=bar><button class=p data-a="kasir.simpan">Simpan penjualan</button><button class=x data-a="kasir.batal">Kosongkan</button></div></div>`;
  };
  // Stok harus cukup untuk isi keranjang + tambahan; stok 0 atau kurang = tidak masuk keranjang, muncul peringatan.
  const stokCukup = (b, tambah) => {
    const f = kasir(), tersedia = U.hasil().stokTersedia(b.k, f.tgl);
    const dikeranjang = f.item.filter((x) => x.k === b.k).reduce((s, x) => s + x.q, 0);
    let pesan = '';
    if (tersedia <= 1e-9) pesan = 'Stok ' + b.n + ' habis (0).';
    else if (dikeranjang + tambah > tersedia + 1e-9) pesan = 'Stok ' + b.n + ' tinggal ' + qty(tersedia) + (dikeranjang ? ', di keranjang sudah ' + qty(dikeranjang) : '') + '.';
    f.peringatan = pesan;
    if (pesan) { U.toast(pesan, true); return false; }
    return true;
  };
  // Menambah satu barang dari barcode (atau kode barang). Mengembalikan true bila berhasil.
  const tambahScan = (kode) => {
    const f = kasir(), b = cariBarang(kode);
    if (!b) { U.toast('Barcode ' + kode + ' tidak dikenal. Daftarkan di Menu › Master.', true); return false; }
    const harga = b.harga || 0;
    if (!(harga > 0)) { U.toast(b.n + ': harga jual belum diisi di Master.', true); return false; }
    if (!stokCukup(b, 1)) return false;
    const ada = f.item.find((x) => x.k === b.k && x.harga === harga);
    if (ada) ada.q += 1; else f.item.push({ k: b.k, q: 1, harga });
    U.toast(b.n + ' ×1', false);
    return true;
  };
  A['kasir.scan'] = (el) => { const kode = el.value.trim(); if (!kode) return; if (tambahScan(kode)) kasir().peringatan = ''; U.fokus = 'scan'; U.render(); };
  A['kasir.kamera'] = () => POS.kamera.pindai((kode) => { if (U.pos() === 'Kasir') { if (tambahScan(kode)) kasir().peringatan = ''; U.render(); } }, { terus: true });
  A['kasir.pilih'] = () => { const f = kasir(), b = cariBarang(f.k); if (b) { f.k = b.k; if (!f.harga) f.harga = b.harga || 0; U.render(); } };
  A['kasir.tambah'] = () => {
    const f = kasir(), b = cariBarang(f.k);
    if (!b) return U.toast('Barang tidak ditemukan di Master.', true);
    if (!(f.q > 0)) return U.toast('Jumlah harus lebih dari 0.', true);
    const harga = f.harga || b.harga || 0;
    if (!(harga > 0)) return U.toast('Isi harga satuan (atau isi harga jual di Master).', true);
    if (!stokCukup(b, f.q)) return U.render();
    const ada = f.item.find((x) => x.k === b.k && x.harga === harga);
    if (ada) ada.q += f.q; else f.item.push({ k: b.k, q: f.q, harga });
    f.k = ''; f.q = 1; f.harga = ''; f.peringatan = '';
    U.render();
  };
  A['kasir.hapus'] = (el) => { kasir().item.splice(+el.dataset.i, 1); U.render(); };
  A['kasir.pas'] = () => { const f = kasir(); f.tunai = total(f.item, (x) => x.harga); f.bank = 0; f.kredit = 0; U.render(); };
  A['kasir.sisa'] = () => {
    const f = kasir(), tot = total(f.item, (x) => x.harga), s = tot - (f.tunai || 0) - (f.bank || 0) - (f.kredit || 0);
    const e = document.getElementById('ksisa');
    if (e) { e.textContent = s === 0 ? 'Pembayaran pas.' : s > 0 ? 'Kurang ' + rp(s) : 'Lebih ' + rp(-s) + ' (kembalian tidak dicatat; isi tunai sebesar total).'; e.className = s === 0 ? 'ok' : 'no'; }
  };
  A['kasir.batal'] = () => { Object.assign(kasir(), { item: [], tunai: 0, bank: 0, kredit: 0, k: '', q: 1, harga: '', peringatan: '' }); U.render(); };
  A['kasir.simpan'] = () => {
    const f = kasir(), tot = total(f.item, (x) => x.harga);
    if (!f.item.length) return U.toast('Belum ada barang.', true);
    if ((f.tunai || 0) + (f.bank || 0) + (f.kredit || 0) !== tot) return U.toast('Pembayaran harus sama dengan total ' + rp(tot) + '.', true);
    if (f.kredit > 0 && !f.pelanggan) return U.toast('Penjualan kredit butuh pelanggan terdaftar (bukan Umum).', true);
    if (U.simpanTx({ tgl: f.tgl, jenis: 'JUAL', pelanggan: f.pelanggan || null, item: f.item.map((x) => ({ ...x })), tunai: f.tunai || 0, bank: f.bank || 0, kredit: f.kredit || 0 })) {
      Object.assign(f, { item: [], tunai: 0, bank: 0, kredit: 0 }); U.toast('Penjualan ' + rp(tot) + ' tersimpan'); U.render();
    }
  };

  // ---------- Pembelian
  R['Pembelian'] = () => {
    if (!U.s().tpl) return U.perlu();
    const S = U.s(), f = F.beli;
    const tot = total(f.item, (x) => x.h);
    return `<h2>Pembelian dari pemasok</h2>${U.datalistBarang()}
<div class=scan><label style="flex:1">Scan barcode barang (Enter)<input id=bscan autocomplete=off data-enter="beli.scan"></label>
${POS.kamera.tersedia() ? '<button class=x data-a="beli.kamera">Kamera</button>' : ''}</div>
<div class=card><div class=bar><label>Tanggal<input type=date value="${f.tgl}" data-f="beli.tgl"></label>
<label>Pemasok${U.inputOrang('pemasok', f.pemasok, 'beli.pemasok', { kosong: 'ketik huruf nama pemasok' })}</label>
<label>No. faktur<input value="${esc(f.faktur)}" data-f="beli.faktur"></label>
<label>Pembayaran<select data-f="beli.cara">${U.opt([['kredit', 'Kredit (utang usaha)'], ['tunai', 'Tunai'], ['bank', 'Bank']], f.cara)}</select></label></div>
<div class=bar><label>Barang (kode / nama)<input list=dlb value="${esc(f.k)}" data-f="beli.k" style="width:220px"></label>
<label>Jumlah<input class="n s" value="${f.q}" data-f="beli.q" data-t=num></label>
<label>Harga beli satuan<input id=beli-h class=n value="${f.h}" data-f="beli.h" data-t=num></label>
<button class=x data-a="beli.tambah">+ Tambah</button></div>
${tabelItem(f.item, 'Harga beli', 'beli.hapus', (x) => x.h)}
<p>Total <span class=tot>${rp(tot)}</span></p>
<div class=bar><button class=p data-a="beli.simpan">Simpan pembelian</button></div></div>`;
  };
  const pilihScanBeli = (kode) => { const b = cariBarang(kode); if (!b) return U.toast('Barcode ' + kode + ' tidak dikenal. Daftarkan di Menu › Master.', true); F.beli.k = b.k; F.beli.h = F.beli.h || b.hargaBeli || ''; U.fokus = 'beli-h'; U.render(); };
  A['beli.scan'] = (el) => { const kode = el.value.trim(); if (kode) pilihScanBeli(kode); };
  A['beli.kamera'] = () => POS.kamera.pindai((kode) => { if (U.pos() === 'Pembelian') pilihScanBeli(kode); });
  A['beli.tambah'] = () => {
    const f = F.beli, b = cariBarang(f.k);
    if (!b) return U.toast('Barang tidak ditemukan di Master.', true);
    if (!(f.q > 0) || !(f.h > 0)) return U.toast('Isi jumlah dan harga beli.', true);
    const ada = f.item.find((x) => x.k === b.k);
    if (ada) { const n = ada.q * ada.h + f.q * f.h; ada.q += f.q; ada.h = n / ada.q; } else f.item.push({ k: b.k, q: f.q, h: f.h });
    f.k = ''; f.q = 1; f.h = '';
    U.render();
  };
  A['beli.hapus'] = (el) => { F.beli.item.splice(+el.dataset.i, 1); U.render(); };
  A['beli.simpan'] = () => {
    const f = F.beli;
    if (!f.item.length) return U.toast('Belum ada barang.', true);
    if (!f.pemasok) return U.toast('Pilih pemasok (tambah di Master bila belum ada).', true);
    if (U.simpanTx({ tgl: f.tgl, jenis: 'BELI', pemasok: f.pemasok, faktur: f.faktur, item: f.item.map((x) => ({ ...x })), cara: f.cara })) {
      f.item.forEach((x) => { const b = U.barang(x.k); if (b) b.hargaBeli = x.h; });
      Object.assign(f, { item: [], faktur: '' }); U.toast('Pembelian tersimpan'); U.render();
    }
  };

  // ---------- Retur
  const dikembalikan = (jenis, ref, k) => U.s().tx.filter((t) => t.jenis === jenis && t.ref === ref).reduce((s, t) => s + t.item.filter((x) => x.k === k).reduce((a, x) => a + x.q, 0), 0);
  const labelTx = (t) => U.tglId(t.tgl) + ' · ' + (t.jenis === 'JUAL' ? U.namaPelanggan(t.pelanggan) + ' · ' + rp(POS.mesin.totalJual(t)) : U.namaPemasok(t.pemasok) + ' · faktur ' + (t.faktur || '-') + ' · ' + rp(total(t.item, (x) => x.h)));
  const blokRetur = (judul, jenis, tgl, ref, cara, q, caraOpsi, kunci) => {
    const S = U.s();
    const daftar = S.tx.filter((t) => t.jenis === jenis).slice().reverse();
    const asal = S.tx.find((t) => t.id === ref);
    const baris = asal ? asal.item.map((x) => { const sisa = x.q - dikembalikan(jenis === 'JUAL' ? 'RJUAL' : 'RBELI', asal.id, x.k); return `<tr><td>${esc(x.k)} <span class=c>${esc((U.barang(x.k) || {}).n)}</span></td><td class=n>${qty(x.q)}</td><td class=n>${qty(sisa)}</td><td><input class="n s" value="${q[x.k] || ''}" data-f="retur.${kunci}.${x.k.replace(/\./g, '_')}" data-t=num></td></tr>`; }).join('') : '';
    return `<div class=card><h3>${judul}</h3><div class=bar><label>Tanggal retur<input type=date value="${tgl}" data-f="retur.${jenis === 'JUAL' ? 'tglJ' : 'tglB'}"></label>
<label>Transaksi asal<select data-f="retur.${jenis === 'JUAL' ? 'refJ' : 'refB'}" data-r="retur.segar" style="max-width:420px">${U.opt(daftar.map((t) => [t.id, labelTx(t)]), ref, '— pilih —')}</select></label>
<label>Pengembalian dana<select data-f="retur.${jenis === 'JUAL' ? 'caraJ' : 'caraB'}">${U.opt(caraOpsi, cara)}</select></label></div>
${asal ? `<table><tr><th>Barang</th><th class=n>Dibeli/dijual</th><th class=n>Masih bisa diretur</th><th>Jumlah retur</th></tr>${baris}</table>` : '<p class=c>Pilih transaksi asal.</p>'}
<div class=bar><button class=p data-a="retur.simpan${jenis}">Simpan retur</button></div></div>`;
  };
  R['Retur'] = () => {
    if (!U.s().tpl) return U.perlu();
    const f = F.retur;
    return '<h2>Retur</h2>' + blokRetur('Retur penjualan (barang kembali ke stok)', 'JUAL', f.tglJ, f.refJ, f.caraJ, f.qJ, [['tunai', 'Tunai'], ['bank', 'Bank'], ['piutang', 'Kurangi piutang']], 'qJ')
      + blokRetur('Retur pembelian (barang kembali ke pemasok)', 'BELI', f.tglB, f.refB, f.caraB, f.qB, [['utang', 'Kurangi utang'], ['tunai', 'Tunai'], ['bank', 'Bank']], 'qB');
  };
  A['retur.segar'] = () => { F.retur.qJ = {}; F.retur.qB = {}; U.render(); };
  const simpanRetur = (jenis) => {
    const f = F.retur, J = jenis === 'JUAL';
    const ref = J ? f.refJ : f.refB, qs = J ? f.qJ : f.qB, S = U.s();
    const asal = S.tx.find((t) => t.id === ref);
    if (!asal) return U.toast('Pilih transaksi asal.', true);
    const item = [];
    for (const x of asal.item) {
      const q = qs[x.k.replace(/\./g, '_')] || qs[x.k] || 0;
      if (!(q > 0)) continue;
      const sisa = x.q - dikembalikan(J ? 'RJUAL' : 'RBELI', asal.id, x.k);
      if (q > sisa + 1e-9) return U.toast('Retur ' + x.k + ' melebihi sisa yang bisa diretur (' + qty(sisa) + ').', true);
      item.push({ k: x.k, q });
    }
    if (!item.length) return U.toast('Isi jumlah retur.', true);
    const cara = J ? f.caraJ : f.caraB;
    if (J && cara === 'piutang' && !asal.pelanggan) return U.toast('Penjualan umum tidak punya piutang; pilih tunai atau bank.', true);
    if (!J && cara === 'utang' && asal.cara !== 'kredit') return U.toast('Pembelian ini tidak kredit; pilih tunai atau bank.', true);
    if (U.simpanTx({ tgl: J ? f.tglJ : f.tglB, jenis: J ? 'RJUAL' : 'RBELI', ref, pelanggan: asal.pelanggan || null, item, cara })) {
      if (J) f.qJ = {}; else f.qB = {};
      U.toast('Retur tersimpan'); U.render();
    }
  };
  A['retur.simpanJUAL'] = () => simpanRetur('JUAL');
  A['retur.simpanBELI'] = () => simpanRetur('BELI');

  // ---------- Piutang & Utang
  R['Piutang & Utang'] = () => {
    if (!U.s().tpl) return U.perlu();
    const S = U.s(), H = U.hasil(), f = F.bayar;
    const totP = Object.values(H.piutang).reduce((s, v) => s + v, 0), totU = Object.values(H.utang).reduce((s, v) => s + v, 0);
    const ref = S.tpl.saldoReferensi || {};
    const selisih = (kode, v, nama) => { const r = Object.keys(ref).filter((k) => k.startsWith(kode)).reduce((s, k) => s + ref[k], 0); return Math.abs(r - 0) > 0 && false ? '' : ''; };
    void selisih;
    return `<h2>Piutang pelanggan &amp; utang pemasok</h2><div class=grid2>
<div class=card><h3>Piutang pelanggan</h3><table><tr><th>Pelanggan</th><th class=n>Saldo</th></tr>${S.pelanggan.map((p) => `<tr><td>${esc(p.nama)}</td><td class=n>${rp(H.piutang[p.id] || 0)}</td></tr>`).join('') || '<tr><td colspan=2 class=c>Belum ada pelanggan</td></tr>'}<tr><th>Jumlah</th><th class=n>${rp(totP)}</th></tr></table>
<h3>Terima pelunasan</h3><div class=bar><label>Tanggal<input type=date value="${f.tgl}" data-f="bayar.tgl"></label>
<label>Pelanggan${U.inputOrang('pelanggan', f.pelanggan, 'bayar.pelanggan', { kosong: 'ketik huruf nama', label: (p) => 'piutang ' + rp(H.piutang[p.id] || 0) })}</label></div>
<div class=bar><label>Tunai<input class=n value="${f.tunai || ''}" data-f="bayar.tunai" data-t=num></label><label>Bank<input class=n value="${f.bank || ''}" data-f="bayar.bank" data-t=num></label><button class=p data-a="bayar.terima">Simpan</button></div></div>
<div class=card><h3>Utang pemasok</h3><table><tr><th>Pemasok</th><th class=n>Saldo</th></tr>${S.pemasok.map((p) => `<tr><td>${esc(p.nama)}</td><td class=n>${rp(H.utang[p.id] || 0)}</td></tr>`).join('') || '<tr><td colspan=2 class=c>Belum ada pemasok</td></tr>'}<tr><th>Jumlah</th><th class=n>${rp(totU)}</th></tr></table>
<h3>Bayar utang</h3><div class=bar><label>Tanggal<input type=date value="${f.tglB}" data-f="bayar.tglB"></label>
<label>Pemasok${U.inputOrang('pemasok', f.pemasokId, 'bayar.pemasokId', { kosong: 'ketik huruf nama', label: (p) => 'utang ' + rp(H.utang[p.id] || 0) })}</label></div>
<div class=bar><label>Jumlah<input class=n value="${f.jumlah || ''}" data-f="bayar.jumlah" data-t=num></label><label>Dari<select data-f="bayar.dari">${U.opt([['tunai', 'Kas tunai'], ['bank', 'Bank']], f.dari)}</select></label><button class=p data-a="bayar.bayar">Simpan</button></div></div></div>
<p class=c>Saldo awal piutang/utang per pihak diisi di tab Master. Jumlahnya harus sama dengan saldo Piutang/Utang di akuntansiApp (lihat saldo referensi di tab Ekspor/Impor).</p>`;
  };
  A['bayar.terima'] = () => {
    const f = F.bayar;
    if (!f.pelanggan) return U.toast('Pilih pelanggan.', true);
    if (!((f.tunai || 0) + (f.bank || 0) > 0)) return U.toast('Isi jumlah.', true);
    if (U.simpanTx({ tgl: f.tgl, jenis: 'PELUNASAN', pelanggan: f.pelanggan, tunai: f.tunai || 0, bank: f.bank || 0 })) { f.tunai = 0; f.bank = 0; U.toast('Pelunasan tersimpan'); U.render(); }
  };
  A['bayar.bayar'] = () => {
    const f = F.bayar;
    if (!f.pemasokId) return U.toast('Pilih pemasok.', true);
    if (!(f.jumlah > 0)) return U.toast('Isi jumlah.', true);
    if (U.simpanTx({ tgl: f.tglB, jenis: 'BAYAR', pemasok: f.pemasokId, jumlah: f.jumlah, dari: f.dari })) { f.jumlah = 0; U.toast('Pembayaran tersimpan'); U.render(); }
  };

  // ---------- Stok & Opname
  R['Stok & Opname'] = () => {
    if (!U.s().tpl) return U.perlu();
    const S = U.s(), H = U.hasil(), f = F.opname;
    let tn = 0;
    const baris = S.barang.map((b) => {
      const r = H.stok[b.k] || { q: 0, lapisan: [] };
      const nilai = r.lapisan.reduce((s, l) => s + l.q * l.h, 0); tn += nilai;
      return `<tr><td>${esc(b.k)}</td><td>${esc(b.n)}</td><td class=n>${qty(r.q)}</td><td class=n>${rp(nilai)}</td><td class=c>${r.lapisan.length} lapisan</td><td><input class="n s" value="${f.fisik[b.k.replace(/\./g, '_')] === undefined ? '' : f.fisik[b.k.replace(/\./g, '_')]}" data-f="opname.fisik.${b.k.replace(/\./g, '_')}" data-t=num></td></tr>`;
    }).join('');
    return `<h2>Stok (FIFO) &amp; opname</h2><div class=card><table><tr><th>Kode</th><th>Barang</th><th class=n>Stok sistem</th><th class=n>Nilai</th><th></th><th>Stok fisik</th></tr>${baris}<tr><th colspan=3>Nilai persediaan</th><th class=n>${rp(tn)}</th><th colspan=2></th></tr></table>
<div class=bar><label>Tanggal opname<input type=date value="${f.tgl}" data-f="opname.tgl"></label><button class=p data-a="opname.simpan">Simpan opname (hanya barang yang diisi)</button></div>
<p class=c>Selisih kurang dicatat sebagai beban selisih persediaan; selisih lebih dinilai pada harga lapisan terakhir.</p></div>`;
  };
  A['opname.simpan'] = () => {
    const f = F.opname, S = U.s(), item = [];
    S.barang.forEach((b) => { const v = f.fisik[b.k.replace(/\./g, '_')]; if (v !== undefined && v !== '') item.push({ k: b.k, fisik: v }); });
    if (!item.length) return U.toast('Isi stok fisik minimal satu barang.', true);
    if (U.simpanTx({ tgl: f.tgl, jenis: 'OPNAME', item })) { f.fisik = {}; U.toast('Opname tersimpan'); U.render(); }
  };

  // ---------- Kas
  R['Kas'] = () => {
    if (!U.s().tpl) return U.perlu();
    const H = U.hasil(), s = H.saldoPada(), p = U.s().tpl.pemetaan, f = F.kas;
    return `<h2>Kas &amp; setoran</h2><div class=card><table><tr><th>Akun</th><th class=n>Saldo menurut POS</th></tr><tr><td>${esc(p.kasTunai)} Kas tunai</td><td class=n>${rp(s[p.kasTunai] || 0)}</td></tr><tr><td>${esc(p.bank)} Bank</td><td class=n>${rp(s[p.bank] || 0)}</td></tr></table>
<h3>Setor kas tunai ke bank</h3><div class=bar><label>Tanggal<input type=date value="${f.tgl}" data-f="kas.tgl"></label><label>Jumlah<input class=n value="${f.jumlah || ''}" data-f="kas.jumlah" data-t=num></label><button class=p data-a="kas.setor">Simpan setoran</button></div>
<p class=c>Saldo dihitung dari saldo referensi template ditambah semua transaksi POS.</p></div>`;
  };
  A['kas.setor'] = () => {
    const f = F.kas;
    if (!(f.jumlah > 0)) return U.toast('Isi jumlah setoran.', true);
    if (U.simpanTx({ tgl: f.tgl, jenis: 'SETOR', jumlah: f.jumlah })) { f.jumlah = 0; U.toast('Setoran tersimpan'); U.render(); }
  };
})(globalThis.POS = globalThis.POS || {});
