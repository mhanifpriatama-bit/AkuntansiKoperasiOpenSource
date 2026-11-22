/*
 * Tab Master (barang, pelanggan, pemasok), Riwayat, dan Ekspor/Impor (template, data POS, backup).
 */
(function (POS) {
  'use strict';
  const { A, F, R, u: U } = POS;
  const { esc, rp, qty } = U;
  const simpan = () => POS.simpan.jadwalkan(U.s());
  const unduh = (nama, isi, tipe) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([isi], { type: tipe || 'application/json' }));
    a.download = nama; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const pakai = (S, jenis, f) => S.tx.some((t) => f(t));

  // ---------- Master
  R['Master'] = () => {
    const S = U.s();
    const akunP = U.akunCoa('1.1.4.'), akunU = U.akunCoa('2.1.3.');
    const dariTpl = (k) => ((S.tpl && S.tpl.barang) || []).some((b) => b.k === k);
    return `<h2>Master data</h2>
<div class=card><h3>Barang</h3><table><tr><th>Kode</th><th>Nama</th><th>Barcode</th><th>Akun persediaan</th><th class=n>Harga jual</th><th class=n>Harga beli terakhir</th><th></th></tr>
${S.barang.map((b, i) => `<tr><td>${dariTpl(b.k) ? esc(b.k) : `<input class=s style="width:110px" value="${esc(b.k)}" data-f="m.b.${i}.k" data-r="m.ubah">`}</td>
<td><input value="${esc(b.n)}" data-f="m.b.${i}.n" data-r="m.ubah"></td>
<td style="white-space:nowrap"><input style="width:130px" value="${esc(b.barcode || '')}" data-f="m.b.${i}.barcode" data-r="m.ubah" placeholder="scan / ketik">${POS.kamera.tersedia() ? ` <button class=x data-a="m.pindai" data-i="${i}">Pindai</button>` : ''}</td>
<td><select data-f="m.b.${i}.akun" data-r="m.ubah">${U.opt(akunP, b.akun, '— pilih —')}</select></td>
<td class=n><input class=n value="${b.harga || ''}" data-t=num data-f="m.b.${i}.harga" data-r="m.ubah"></td>
<td class=n><input class=n value="${b.hargaBeli || ''}" data-t=num data-f="m.b.${i}.hargaBeli" data-r="m.ubah"></td>
<td>${dariTpl(b.k) ? '' : `<button class=k data-a="m.hapusB" data-i="${i}">hapus</button>`}</td></tr>`).join('')}</table>
<div class=bar><button class=x data-a="m.tambahB">+ Barang baru</button></div>
<p class=c>Barcode hanya ada di POS (tidak dikirim ke akuntansiApp). Pemindai fisik cukup diarahkan ke kolom Barcode lalu scan. Barang dari template tidak bisa dihapus atau diganti kodenya. Barang baru dikirim ke akuntansiApp sebagai barangBaru — pastikan akun persediaannya terisi.</p></div>
<div class=card><h3>Pelanggan</h3><table><tr><th>Nama</th><th>Anggota</th><th class=n>Saldo awal piutang</th><th></th></tr>
${S.pelanggan.map((p, i) => `<tr><td><input value="${esc(p.nama)}" data-f="m.p.${i}.nama" data-r="m.ubah"></td><td><input type=checkbox ${p.anggota ? 'checked' : ''} data-f="m.p.${i}.anggota" data-r="m.ubah"></td>
<td class=n><input class=n value="${p.saldoAwal || ''}" data-t=num data-f="m.p.${i}.saldoAwal" data-r="m.ubah"></td><td><button class=k data-a="m.hapusP" data-i="${i}">hapus</button></td></tr>`).join('')}</table>
<div class=bar><button class=x data-a="m.tambahP">+ Pelanggan</button></div>
<p class=c>Status anggota menentukan komponen arus kas penerimaan (anggota atau non-anggota). Penjualan tanpa pelanggan dianggap non-anggota.</p></div>
<div class=card><h3>Pemasok</h3><table><tr><th>Nama</th><th>Akun utang usaha</th><th class=n>Saldo awal utang</th><th></th></tr>
${S.pemasok.map((p, i) => `<tr><td><input value="${esc(p.nama)}" data-f="m.s.${i}.nama" data-r="m.ubah"></td><td><select data-f="m.s.${i}.akun" data-r="m.ubah">${U.opt(akunU, p.akun, '— pilih —')}</select></td>
<td class=n><input class=n value="${p.saldoAwal || ''}" data-t=num data-f="m.s.${i}.saldoAwal" data-r="m.ubah"></td><td><button class=k data-a="m.hapusS" data-i="${i}">hapus</button></td></tr>`).join('')}</table>
<div class=bar><button class=x data-a="m.tambahS">+ Pemasok</button></div></div>`;
  };
  // Nilai tabel Master disimpan langsung ke state (F.m.<b|p|s>.<i>.<kolom> disalin ke S)
  A['m.ubah'] = (el) => {
    const [, j, i, kolom] = el.dataset.f.split('.');
    const S = U.s(), daftar = j === 'b' ? S.barang : j === 'p' ? S.pelanggan : S.pemasok;
    const baris = daftar[+i]; if (!baris) return;
    const v = el.type === 'checkbox' ? el.checked : el.dataset.t === 'num' ? U.ubahBilangan(el.value) : el.value.trim();
    if (kolom === 'k' && S.barang.some((b, x) => x !== +i && b.k === v)) { U.toast('Kode barang sudah dipakai.', true); return U.render(); }
    if (kolom === 'k' && baris.k && pakai(S, 'x', (t) => (t.item || []).some((x) => x.k === baris.k))) { U.toast('Kode tidak bisa diganti: barang sudah dipakai di transaksi.', true); return U.render(); }
    if (kolom === 'barcode' && v && S.barang.some((b, x) => x !== +i && b.barcode === v)) { U.toast('Barcode itu sudah dipakai barang lain.', true); return U.render(); }
    baris[kolom] = v; simpan();
  };
  A['m.pindai'] = (el) => POS.kamera.pindai((kode) => {
    const S = U.s(), i = +el.dataset.i;
    if (S.barang.some((b, x) => x !== i && b.barcode === kode)) return U.toast('Barcode ' + kode + ' sudah dipakai barang lain.', true);
    S.barang[i].barcode = kode; simpan(); if (U.pos() === 'Master') U.render();
  });
  const idBaru = (a) => { const S = U.s(); S.seq++; return a + S.seq; };
  A['m.tambahB'] = () => { U.s().barang.push({ k: 'BRG-' + (U.s().barang.length + 1), n: '', akun: '', harga: 0, hargaBeli: 0 }); simpan(); U.render(); };
  A['m.tambahP'] = () => { U.s().pelanggan.push({ id: idBaru('p'), nama: 'Pelanggan baru', anggota: false, saldoAwal: 0 }); simpan(); U.render(); };
  A['m.tambahS'] = () => { const S = U.s(); S.pemasok.push({ id: idBaru('s'), nama: 'Pemasok baru', akun: S.tpl ? S.tpl.pemetaan.utangUsaha : '', saldoAwal: 0 }); simpan(); U.render(); };
  A['m.hapusB'] = (el) => { const S = U.s(), b = S.barang[+el.dataset.i]; if (pakai(S, 'x', (t) => (t.item || []).some((x) => x.k === b.k))) return U.toast('Barang sudah dipakai di transaksi.', true); S.barang.splice(+el.dataset.i, 1); simpan(); U.render(); };
  A['m.hapusP'] = (el) => { const S = U.s(), p = S.pelanggan[+el.dataset.i]; if (pakai(S, 'x', (t) => t.pelanggan === p.id)) return U.toast('Pelanggan sudah dipakai di transaksi.', true); S.pelanggan.splice(+el.dataset.i, 1); simpan(); U.render(); };
  A['m.hapusS'] = (el) => { const S = U.s(), p = S.pemasok[+el.dataset.i]; if (pakai(S, 'x', (t) => t.pemasok === p.id)) return U.toast('Pemasok sudah dipakai di transaksi.', true); S.pemasok.splice(+el.dataset.i, 1); simpan(); U.render(); };

  // ---------- Riwayat
  const ringkas = (t) => {
    const m = POS.mesin;
    switch (t.jenis) {
      case 'JUAL': return U.namaPelanggan(t.pelanggan) + ' · ' + t.item.length + ' barang · ' + rp(m.totalJual(t)) + (t.kredit ? ' (kredit ' + rp(t.kredit) + ')' : '');
      case 'PELUNASAN': return U.namaPelanggan(t.pelanggan) + ' · ' + rp((t.tunai || 0) + (t.bank || 0));
      case 'BELI': return U.namaPemasok(t.pemasok) + ' · faktur ' + (t.faktur || '-') + ' · ' + rp(t.item.reduce((s, x) => s + m.bulat(x.q * x.h), 0)) + ' · ' + t.cara;
      case 'BAYAR': return U.namaPemasok(t.pemasok) + ' · ' + rp(t.jumlah) + ' dari ' + t.dari;
      case 'RJUAL': case 'RBELI': return t.item.map((x) => x.k + ' ×' + qty(x.q)).join(', ') + ' · ' + t.cara;
      case 'OPNAME': return t.item.map((x) => x.k + ' fisik ' + qty(x.fisik)).join(', ');
      case 'SETOR': return rp(t.jumlah);
      default: return '';
    }
  };
  R['Riwayat'] = () => {
    const S = U.s();
    const daftar = S.tx.slice().sort((a, b) => (a.tgl < b.tgl ? 1 : a.tgl > b.tgl ? -1 : b.urut - a.urut));
    return `<h2>Riwayat transaksi</h2><div class=card><table><tr><th>Tanggal</th><th>Jenis</th><th>Ringkasan</th><th></th></tr>${daftar.map((t) => `<tr><td>${U.tglId(t.tgl)}</td><td>${esc(t.jenis)}</td><td>${esc(ringkas(t))}</td><td><button class=k data-a="r.hapus" data-id="${esc(t.id)}">hapus</button></td></tr>`).join('') || '<tr><td colspan=4 class=c>Belum ada transaksi.</td></tr>'}</table></div>`;
  };
  A['r.hapus'] = (el) => { if (confirm('Hapus transaksi ini?')) { if (U.hapusTx(el.dataset.id)) { U.toast('Dihapus'); U.render(); } } };

  // ---------- Ekspor / Impor
  const bulanTpl = () => { const p = U.s().tpl.periode; const d = String(p.bulan).padStart(2, '0'); return [p.tahun + '-' + d + '-01', new Date(Date.UTC(p.tahun, p.bulan, 0)).toISOString().slice(0, 10)]; };
  R['Ekspor/Impor'] = () => {
    const S = U.s(), t = S.tpl;
    let h = '<h2>Ekspor / Impor</h2>';
    h += `<div class=card><h3>1. Template dari akuntansiApp</h3>${t ? `<p>Template aktif: unit <b>${esc(t.unit)}</b>, periode <b>${t.periode.tahun}-${String(t.periode.bulan).padStart(2, '0')}</b>, stok awal per ${U.tglId(t.posisiStok)} (${(t.stokAwal || []).length} lapisan), metode ${esc(t.metodeHpp)}. <span class=c>ID ${esc(t.idTemplat)}</span></p>` : '<p class=no>Belum ada template.</p>'}
<label>Impor template (.json)<input type=file accept=.json data-b="x.templat"></label>
<p class=c>Template baru untuk bulan berikutnya: transaksi sampai tanggal stok awal dianggap sudah masuk akuntansiApp dan dibuang dari POS.</p></div>`;
    if (t) {
      const f = F.ekspor, [d0, d1] = bulanTpl();
      if (!f.dari) f.dari = d0; if (!f.sampai) f.sampai = d1;
      const H = U.hasil();
      const dalam = (r) => r.d >= f.dari && r.d <= f.sampai;
      const J = H.jurnal.filter(dalam), M = H.mutasi.filter(dalam);
      h += `<div class=card><h3>2. Data POS untuk akuntansiApp</h3><div class=bar><label>Dari<input type=date value="${f.dari}" data-f="ekspor.dari" data-r="x.segar"></label><label>Sampai<input type=date value="${f.sampai}" data-f="ekspor.sampai" data-r="x.segar"></label></div>
<p>${J.length} baris jurnal, ${M.length} mutasi stok. Total debit ${rp(J.reduce((s, r) => s + r.db, 0))}, kredit ${rp(J.reduce((s, r) => s + r.kr, 0))}.</p>
${H.galat.length ? `<div class=galat><b>Tidak bisa diekspor:</b><ul>${H.galat.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>` : ''}
<button class=p data-a="x.ekspor" ${H.galat.length || !J.length && !M.length ? 'disabled' : ''}>Unduh data POS (.json)</button>
<p class=c>Impor di akuntansiApp: tab Data › Impor data POS. Aman diulang: baris POS- pada rentang yang sama diganti.</p></div>`;
    }
    h += `<div class=card><h3>3. Backup lokal POS</h3><div class=bar><button class=x data-a="x.backup">Unduh backup</button><label>Pulihkan dari backup<input type=file accept=.json data-b="x.pulih"></label><button class=k data-a="x.reset">Hapus semua data POS</button></div></div>`;
    return h;
  };
  A['x.segar'] = () => U.render();
  A['x.templat'] = async (el) => {
    const berkas = el.files && el.files[0]; el.value = '';
    if (!berkas) return;
    let t;
    try { t = JSON.parse(await berkas.text()); } catch (e) { return U.toast('Berkas bukan JSON yang valid.', true); }
    const err = POS.kontrak.periksaTemplat(t);
    if (err) return U.toast(err, true);
    const S = U.s();
    if (S.tpl && S.tpl.unit !== t.unit) return U.toast('Template untuk unit ' + t.unit + ', POS ini untuk ' + S.tpl.unit + '.', true);
    const buang = S.tx.filter((x) => x.tgl <= t.posisiStok).length;
    if (S.tpl && !confirm('Pakai template baru periode ' + t.periode.tahun + '-' + String(t.periode.bulan).padStart(2, '0') + '?\n' + buang + ' transaksi bertanggal sampai ' + t.posisiStok + ' akan dibuang dari POS (sudah tercermin di stok awal template).')) return;
    S.tx = S.tx.filter((x) => x.tgl > t.posisiStok);
    S.tpl = t;
    t.barang.forEach((b) => { const a = S.barang.find((x) => x.k === b.k); if (a) { a.n = b.n; a.akun = b.akun; } else S.barang.push({ k: b.k, n: b.n, akun: b.akun, harga: 0, hargaBeli: 0 }); });
    if (!S.pemasok.length) S.pemasok.push({ id: 's' + (++S.seq), nama: 'Pemasok umum', akun: t.pemetaan.utangUsaha, saldoAwal: 0 });
    F.ekspor = { dari: '', sampai: '' };
    simpan(); U.toast('Template diimpor'); U.render();
  };
  A['x.ekspor'] = async () => {
    const S = U.s(), f = F.ekspor, H = U.hasil();
    if (H.galat.length) return U.toast('Perbaiki galat dulu.', true);
    if (f.dari > f.sampai) return U.toast('Rentang tanggal terbalik.', true);
    const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
    const pos = await POS.kontrak.bangunData(S, H, { dari: f.dari, sampai: f.sampai, idBatch: id, now: new Date().toISOString() });
    unduh('KDMP_POS_data_' + S.tpl.unit + '_' + f.dari + '_' + f.sampai + '.json', JSON.stringify(pos, null, 1));
    U.toast('Data POS diunduh (' + pos.jurnal.length + ' jurnal, ' + pos.mutasiStok.length + ' mutasi)');
  };
  A['x.backup'] = () => unduh('KDMP_POS_backup_' + U.hariIni() + '.json', JSON.stringify(U.s()));
  A['x.pulih'] = async (el) => {
    const berkas = el.files && el.files[0]; el.value = '';
    if (!berkas) return;
    let d; try { d = JSON.parse(await berkas.text()); } catch (e) { return U.toast('Berkas bukan JSON yang valid.', true); }
    if (!d || !Array.isArray(d.tx) || !Array.isArray(d.barang)) return U.toast('Bukan backup POS.', true);
    if (!confirm('Ganti seluruh data POS saat ini dengan backup ini?')) return;
    POS.ganti(Object.assign(POS.simpan.kosong(), d)); F.ekspor = { dari: '', sampai: '' };
    simpan(); U.toast('Backup dipulihkan'); U.render();
  };
  A['x.reset'] = async () => {
    if (!confirm('Hapus SEMUA data POS (transaksi, master, template) di perangkat ini?\nUnduh backup dulu bila perlu.')) return;
    if (!confirm('Yakin? Tindakan ini tidak bisa dibatalkan.')) return;
    POS.ganti(POS.simpan.kosong()); await POS.simpan.simpanSekarang(U.s()); F.ekspor = { dari: '', sampai: '' }; U.pergi('Ekspor/Impor');
  };
})(globalThis.POS = globalThis.POS || {});
