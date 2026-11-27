/* Antarmuka aplikasi USP. Aturan ada di layanan.js dan inti.js (diuji di Node); berkas ini hanya tampilan. */
(function () {
  'use strict';
  const U = globalThis.USP, L = globalThis.USPL;
  const S = { data: null, k: null, tab: 'Loket', aid: null, cari: '', kasir: '', tglKas: null };
  const D = () => S.data;
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rp = (n) => (n < 0 ? '-' : '') + 'Rp ' + Math.abs(n || 0).toLocaleString('id-ID');
  const hariIni = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const $ = (s, r) => (r || document).querySelector(s);
  const angka = (v) => (v === '' || v == null ? 0 : Number(v));
  const TABS = ['Loket', 'Anggota', 'Pinjaman', 'Kas Harian', 'Ekspor', 'Laporan', 'Pengaturan'];

  function pesan(t, galat) { const e = $('#pesan'); e.textContent = t; e.style.background = galat ? '#b3261e' : '#15803d'; e.style.display = 'block'; clearTimeout(pesan.t); pesan.t = setTimeout(() => (e.style.display = 'none'), galat ? 6000 : 2500); }
  async function simpan() { await SIMPAN.tulis(S.k, S.data); }
  async function jalan(r, sukses) { if (!r.ok) { pesan(r.galat, true); return false; } await simpan(); pesan(sukses || 'Tersimpan'); render(); return true; }
  const ambil = (el) => { const k = el.closest('[data-f]'); const o = {}; k.querySelectorAll('[name]').forEach((i) => { o[i.name] = i.type === 'checkbox' ? i.checked : i.value; }); return o; };
  const anggotaNama = (id) => { const a = D().anggota.find((x) => x.id === id); return a ? a.no + ' ' + a.nama : '?'; };
  const opsiAnggota = () => D().anggota.filter((a) => a.status !== 'keluar').map((a) => `<option value="${a.id}">${esc(a.no + ' ' + a.nama)}</option>`).join('');
  const inp = (label, nama, v, tipe, extra) => `<label>${label}<input name="${nama}" type="${tipe || 'text'}" value="${esc(v == null ? '' : v)}" ${extra || ''}></label>`;
  const cara = () => '<label>Cara<select name="cara"><option value="tunai">Tunai</option><option value="bank">Bank</option></select></label>';
  const kolom = (a) => a.map((s) => `<th>${s}</th>`).join('');

  // ---------- Layar masuk ----------
  async function layarMasuk() {
    const ada = await SIMPAN.ada();
    $('#akar').innerHTML = `<div id="kunci" class="k" data-f><h3>USP Koperasi Merah Putih</h3>${ada
      ? '<p class=c>Masukkan kata sandi untuk membuka data.</p><div class=baris>' + inp('Kata sandi', 'sandi', '', 'password') + '<button class=p data-a=masuk>Masuk</button></div>'
      : '<p>Belum ada data di browser ini. Buat kata sandi baru.</p><p class="no"><b>Kata sandi tidak bisa dipulihkan.</b> Bila hilang, data tidak bisa dibuka. Simpan cadangan secara rutin (menu Pengaturan).</p><div class=baris>' + inp('Kata sandi baru (min. 8 karakter)', 'sandi', '', 'password') + inp('Ulangi', 'ulang', '', 'password') + '<button class=p data-a=buat>Buat</button></div>'}</div>`;
  }

  // ---------- Tab ----------
  function tabLoket() {
    const a = D().anggota.find((x) => x.id === S.aid);
    let h = `<div class=k><div class=baris><label>Cari anggota (nomor atau nama)<input id=cari value="${esc(S.cari)}" data-a=cari autocomplete=off></label></div><div id=hasilCari>${hasilCari()}</div></div>`;
    if (!a) return h + '<p class=c>Pilih anggota untuk mencatat setoran, penarikan, atau angsuran.</p>';
    const t = D().trx, hi = hariIni();
    const pin = D().pinjaman.filter((p) => p.anggotaId === a.id && p.status === 'aktif');
    h += `<div class=k><h3>${esc(a.no)} · ${esc(a.nama)} <span class=c>(${a.status})</span></h3><table><tr>${kolom(['Simpanan pokok', 'Simpanan wajib', 'Simpanan sukarela'])}</tr><tr>${['pokok', 'wajib', 'sukarela'].map((s) => `<td>${rp(U.saldoSimpanan(t, a.id, s))}</td>`).join('')}</tr></table>`;
    h += pin.length ? `<table><tr>${kolom(['Pinjaman', 'Sisa pokok', 'Tunggakan', 'Umur (hari)', 'Denda disarankan'])}</tr>${pin.map((p) => { const r = L.tagihan(D(), p.id, hi); return `<tr><td>${p.no}</td><td>${rp(r.sisaPokok)}</td><td class="${r.tunggakan ? 'no' : ''}">${rp(r.tunggakan)}</td><td>${r.umur}</td><td>${rp(r.dendaDisarankan)}</td></tr>`; }).join('')}</table>` : '<p class=c>Tidak ada pinjaman aktif.</p>';
    h += '</div>';
    const dasar = `${inp('Tanggal', 'tgl', hi, 'date')}${inp('Kasir', 'kasir', S.kasir)}`;
    h += `<div class=k data-f><h4>Setoran simpanan</h4><div class=baris>${dasar}<label>Jenis<select name=sub><option value=wajib>Wajib</option><option value=pokok>Pokok</option><option value=sukarela>Sukarela</option></select></label>${inp('Jumlah (Rp)', 'jumlah', '', 'number', 'min=1')}${cara()}<button class=p data-a=setor>Simpan setoran</button></div></div>`;
    h += `<div class=k data-f><h4>Penarikan simpanan sukarela</h4><div class=baris>${dasar}${inp('Jumlah (Rp)', 'jumlah', '', 'number', 'min=1')}${cara()}<button class=p data-a=tarik>Simpan penarikan</button></div></div>`;
    if (pin.length) h += `<div class=k data-f><h4>Angsuran</h4><div class=baris>${dasar}<label>Pinjaman<select name=pinjamanId>${pin.map((p) => `<option value="${p.id}">${p.no}</option>`).join('')}</select></label>${inp('Jumlah dibayar (Rp)', 'jumlah', '', 'number', 'min=1')}${inp('Denda (Rp)', 'denda', 0, 'number', 'min=0')}${cara()}<label>Pelunasan dipercepat <input type=checkbox name=lunas></label>${inp('Jasa pelunasan (Rp)', 'jasaLunas', 0, 'number', 'min=0')}<button class=p data-a=angsur>Simpan angsuran</button></div><p class=c>Pembayaran diterapkan ke denda, lalu jasa, lalu pokok, mulai dari angsuran tertua. Untuk pelunasan, isi jasa yang disepakati; jumlah dibayar diabaikan.</p></div>`;
    h += `<div class=k data-f><h4>Biaya administrasi</h4><div class=baris>${dasar}${inp('Jumlah (Rp)', 'jumlah', '', 'number', 'min=1')}${cara()}<button data-a=adm>Simpan</button></div></div>`;
    h += riwayat(t.filter((x) => x.anggotaId === a.id).slice(-15).reverse());
    return h;
  }
  function hasilCari() {
    const q = S.cari.toLowerCase();
    const r = D().anggota.filter((a) => a.status !== 'keluar' && (!q || a.no.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q))).slice(0, 8);
    return r.length ? '<div class=baris>' + r.map((a) => `<button data-a=pilih data-id="${a.id}" class="${a.id === S.aid ? 'p' : ''}">${esc(a.no + ' ' + a.nama)}</button>`).join('') + '</div>' : '<p class=c>Tidak ditemukan.</p>';
  }
  const URAI = { simpan: 'Setoran', tarik: 'Penarikan', cair: 'Pencairan', angsur: 'Angsuran', adm: 'Administrasi', setorBank: 'Setor ke bank' };
  function nilaiTrx(t) { return t.jenis === 'cair' ? t.pokok : t.jenis === 'angsur' ? t.pokok + t.jasa + (t.denda || 0) : t.jumlah; }
  function riwayat(list) {
    if (!list.length) return '';
    const sudah = new Set(D().trx.filter((x) => x.pembalikDari).map((x) => x.pembalikDari));
    return `<div class=k><h4>Transaksi terakhir</h4><table><tr>${kolom(['Tanggal', 'Jenis', 'Rincian', 'Jumlah', 'Kasir', ''])}</tr>${list.map((t) => `<tr><td>${t.tgl}</td><td>${URAI[t.jenis]}${t.pembalik ? ' <b class=no>(pembalik)</b>' : ''}</td><td class=c>${esc(t.sub || t.cara || '')}</td><td class=n>${rp(nilaiTrx(t))}</td><td>${esc(t.kasir)}</td><td>${t.pembalik || sudah.has(t.id) ? '' : `<button data-a=balik data-id="${t.id}">Balik</button>`}</td></tr>`).join('')}</table></div>`;
  }

  function tabAnggota() {
    return `<div class=k data-f><h4>Anggota baru</h4><p class=c>Nomor anggota diisi manual dan harus sama dengan nomor di aplikasi POS. Nomor tidak bisa diubah setelah disimpan.</p><div class=baris>${inp('Nomor anggota (sama dengan POS)', 'no', '')}${inp('Nama', 'nama', '')}${inp('Alamat', 'alamat', '')}${inp('Telepon', 'telepon', '')}${inp('Tanggal masuk', 'tglMasuk', hariIni(), 'date')}<button class=p data-a=anggotaBaru>Daftarkan</button></div></div>
    <div class=k><table><tr>${kolom(['No', 'Nama', 'Alamat', 'Telepon', 'Status'])}</tr>${D().anggota.map((a) => `<tr><td>${esc(a.no)}</td><td>${esc(a.nama)}</td><td>${esc(a.alamat)}</td><td>${esc(a.telepon)}</td><td><select data-a=status data-id="${a.id}">${['aktif', 'tidak aktif', 'keluar'].map((s) => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan=5 class=c>Belum ada anggota.</td></tr>'}</table></div>`;
  }

  function simulasi(f) {
    try {
      const j = U.jadwal({ pokok: angka(f.pokok), tenor: angka(f.tenor), metode: f.metode, suku: angka(f.suku) / 100, tglCair: f.tgl || hariIni() });
      return `<table><tr>${kolom(['Ke', 'Jatuh tempo', 'Pokok', 'Jasa', 'Angsuran'])}</tr>${j.map((a) => `<tr><td>${a.ke}</td><td>${a.jatuhTempo}</td><td class=n>${rp(a.pokok)}</td><td class=n>${rp(a.jasa)}</td><td class=n>${rp(a.pokok + a.jasa)}</td></tr>`).join('')}<tr><th colspan=2>Jumlah</th><th class=n>${rp(j.reduce((s, a) => s + a.pokok, 0))}</th><th class=n>${rp(j.reduce((s, a) => s + a.jasa, 0))}</th><th class=n>${rp(j.reduce((s, a) => s + a.pokok + a.jasa, 0))}</th></tr></table>`;
    } catch (e) { return '<p class=c>Isi pokok, tenor, dan suku untuk melihat simulasi.</p>'; }
  }
  function tabPinjaman() {
    const P = D().param, STAT = { diajukan: 'Diajukan', disetujui: 'Disetujui', aktif: 'Aktif', lunas: 'Lunas', ditolak: 'Ditolak' };
    const aksi = (p) => p.status === 'diajukan' ? `<button data-a=setuju data-id="${p.id}">Setujui</button> <button data-a=tolakP data-id="${p.id}">Tolak</button>` : p.status === 'disetujui' ? `<button class=p data-a=cairkan data-id="${p.id}">Cairkan</button>` : '';
    return `<div class=k data-f><h4>Pengajuan pinjaman (perorangan)</h4><div class=baris><label>Anggota<select name=anggotaId>${opsiAnggota()}</select></label>${inp('Pokok (Rp)', 'pokok', '', 'number', 'min=1 data-a=sim')}${inp('Tenor (bulan)', 'tenor', 10, 'number', 'min=1 data-a=sim')}<label>Metode<select name=metode data-a=sim><option value=flat>Flat</option><option value=efektif>Efektif</option><option value=anuitas>Anuitas</option></select></label>${inp('Jasa per bulan (%)', 'suku', P.sukuBawaan * 100, 'number', 'step=0.01 min=0 data-a=sim')}${inp('Tanggal', 'tgl', hariIni(), 'date')}${inp('Pengaju', 'pengaju', S.kasir)}<button class=p data-a=ajukan>Ajukan</button></div><div id=sim>${simulasi({ pokok: 0, tenor: 0, metode: 'flat', suku: 0 })}</div></div>
    <div class=k><h4>Daftar pinjaman</h4><table><tr>${kolom(['No', 'Anggota', 'Pokok', 'Tenor', 'Metode', 'Status', 'Pengaju / penyetuju', ''])}</tr>${D().pinjaman.map((p) => `<tr><td>${p.no}</td><td>${esc(anggotaNama(p.anggotaId))}</td><td class=n>${rp(p.pokok)}</td><td>${p.tenor}</td><td>${p.metode}</td><td>${STAT[p.status]}</td><td class=c>${esc(p.pengaju)} / ${esc(p.penyetuju || '-')}</td><td>${aksi(p)}</td></tr>`).join('') || '<tr><td colspan=8 class=c>Belum ada pinjaman.</td></tr>'}</table><p class=c>Pencairan: potong provisi ${P.provisiPersen}% dan Dana CRK ${P.crkPersen}% dari pokok. Persetujuan harus oleh orang lain dari pengaju, dan kasir pencairan berbeda dari keduanya.</p></div>`;
  }

  function tabKas() {
    const tgl = S.tglKas || hariIni(), t = D().trx.filter((x) => x.tgl === tgl), tutup = D().tutup[tgl];
    return `<div class=k data-f><div class=baris>${inp('Tanggal', 'tgl', tgl, 'date', 'data-a=tglKas')}</div>
    <p>Saldo kas tunai menurut sistem sampai tanggal ini: <b>${rp(L.kasTunaiSampai(D(), tgl))}</b>${D().template ? '' : ' <span class=no>(saldo awal kas belum diketahui: muat template di tab Ekspor)</span>'} ${tutup ? `· <b class=ok>Ditutup oleh ${esc(tutup.kasir)}</b> (fisik ${rp(tutup.saldoFisik)}, selisih ${rp(tutup.selisih)})` : '· <span class=no>belum ditutup</span>'}</p></div>
    ${tutup ? '' : `<div class=k data-f><h4>Setor kas ke bank</h4><div class=baris><input type=hidden name=tgl value="${tgl}">${inp('Jumlah (Rp)', 'jumlah', '', 'number', 'min=1')}${inp('Kasir', 'kasir', S.kasir)}<button data-a=setorBank>Catat setoran</button></div></div>
    <div class=k data-f><h4>Tutup kas</h4><div class=baris><input type=hidden name=tgl value="${tgl}">${inp('Uang tunai fisik (Rp)', 'saldoFisik', '', 'number', 'min=0')}${inp('Kasir', 'kasir', S.kasir)}${inp('Alasan selisih', 'alasan', '')}<button class=p data-a=tutup>Tutup kas</button></div><p class=c>Setelah ditutup, transaksi tanggal ini terkunci. Koreksi lewat transaksi pembalik pada tanggal yang masih terbuka.</p></div>`}
    ${riwayat(t.slice().reverse())}<div class=k><h4>Hari yang sudah ditutup</h4>${Object.keys(D().tutup).sort().reverse().map((d) => `<span class=c>${d}</span> `).join('') || '<span class=c>Belum ada.</span>'}</div>`;
  }

  const unduh = (nama, obj) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)], { type: 'application/json' })); a.download = nama; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  function tabEkspor() {
    const T = D().template;
    let h = `<div class=k><h4>1. Muat template dari akuntansiApp</h4><label>Berkas template (.json) <input type=file accept=.json data-a=template></label>`;
    if (T) h += `<p class=ok>Template ${esc(T.idTemplat)} · ${esc(T.koperasi || '')} · periode ${T.periode.tahun}-${String(T.periode.bulan).padStart(2, '0')} · posisi saldo ${T.posisiSaldo}</p>`;
    else h += '<p class=c>Belum ada template. Di akuntansiApp, buka tab Data pada unit USP lalu klik "Ekspor template USP".</p>';
    h += '</div>';
    if (!T) return h;
    const bln = T.periode.tahun + '-' + String(T.periode.bulan).padStart(2, '0'), akhir = new Date(Date.UTC(T.periode.tahun, T.periode.bulan, 0)).getUTCDate();
    const dari = bln + '-01', sampai = bln + '-' + String(akhir).padStart(2, '0');
    const buka = L.hariBelumTutup(D(), dari, sampai);
    h += `<div class=k data-f><h4>2. Buat berkas data USP</h4><div class=baris>${inp('Dari', 'dari', dari, 'date')}${inp('Sampai', 'sampai', sampai, 'date')}<button class=p data-a=ekspor>Periksa dan unduh</button></div>${buka.length ? `<p class=no>Kas belum ditutup pada: ${buka.join(', ')}</p>` : '<p class=ok>Semua hari bertransaksi sudah ditutup.</p>'}<p class=c>Berkas dibuat dari transaksi, tidak diketik. Impor di akuntansiApp bersifat idempoten dan tidak menyentuh jurnal manual.</p></div>`;
    h += `<div class=k><h4>Riwayat ekspor</h4><table><tr>${kolom(['Batch', 'Rentang', 'Dibuat', 'Checksum'])}</tr>${D().batch.slice().reverse().map((b) => `<tr><td class=c>${esc(b.idBatch.slice(0, 8))}</td><td>${b.dari} s.d. ${b.sampai}</td><td>${esc(b.dibuat.slice(0, 16))}</td><td class=c>${esc(b.checksum.slice(0, 12))}…</td></tr>`).join('') || '<tr><td colspan=4 class=c>Belum ada.</td></tr>'}</table></div>`;
    return h;
  }

  function tabLaporan() {
    const t = D().trx, hi = hariIni();
    const baris = D().anggota.map((a) => ({ a, p: U.saldoSimpanan(t, a.id, 'pokok'), w: U.saldoSimpanan(t, a.id, 'wajib'), s: U.saldoSimpanan(t, a.id, 'sukarela') }));
    const tot = baris.reduce((s, r) => ({ p: s.p + r.p, w: s.w + r.w, s: s.s + r.s }), { p: 0, w: 0, s: 0 });
    const akt = D().pinjaman.filter((p) => p.status === 'aktif').map((p) => ({ p, r: L.tagihan(D(), p.id, hi) }));
    return `<div class="baris tdk"><button class=p data-a=cetak>Cetak / simpan PDF</button></div>
    <div class=k><h4>Rekap simpanan (${hi})</h4><table><tr>${kolom(['Anggota', 'Pokok', 'Wajib', 'Sukarela'])}</tr>${baris.map((r) => `<tr><td>${esc(r.a.no + ' ' + r.a.nama)}</td><td class=n>${rp(r.p)}</td><td class=n>${rp(r.w)}</td><td class=n>${rp(r.s)}</td></tr>`).join('')}<tr><th>Jumlah</th><th class=n>${rp(tot.p)}</th><th class=n>${rp(tot.w)}</th><th class=n>${rp(tot.s)}</th></tr></table></div>
    <div class=k><h4>Rekap pinjaman aktif</h4><table><tr>${kolom(['Pinjaman', 'Anggota', 'Sisa pokok', 'Tunggakan', 'Umur (hari)'])}</tr>${akt.map(({ p, r }) => `<tr><td>${p.no}</td><td>${esc(anggotaNama(p.anggotaId))}</td><td class=n>${rp(r.sisaPokok)}</td><td class="n ${r.tunggakan ? 'no' : ''}">${rp(r.tunggakan)}</td><td>${r.umur}</td></tr>`).join('') || '<tr><td colspan=5 class=c>Tidak ada.</td></tr>'}</table></div>
    <div class=k><h4>Daftar tunggakan untuk penagihan</h4><table><tr>${kolom(['Pinjaman', 'Anggota', 'Telepon', 'Tunggakan', 'Umur (hari)'])}</tr>${akt.filter((x) => x.r.tunggakan > 0).sort((x, y) => y.r.umur - x.r.umur).map(({ p, r }) => { const a = D().anggota.find((z) => z.id === p.anggotaId); return `<tr><td>${p.no}</td><td>${esc(a.nama)}</td><td>${esc(a.telepon)}</td><td class=n>${rp(r.tunggakan)}</td><td>${r.umur}</td></tr>`; }).join('') || '<tr><td colspan=5 class=c>Tidak ada tunggakan.</td></tr>'}</table></div>`;
  }

  function tabPengaturan() {
    const P = D().param;
    return `<div class=k data-f><h4>Parameter</h4><div class=baris>${inp('Provisi (% dari pokok)', 'provisiPersen', P.provisiPersen, 'number', 'step=0.01 min=0')}${inp('Dana CRK (% dari pokok)', 'crkPersen', P.crkPersen, 'number', 'step=0.01 min=0')}${inp('Jasa bawaan per bulan (%)', 'suku', P.sukuBawaan * 100, 'number', 'step=0.01 min=0')}<label>Denda<select name=dendaMode><option value="" ${!P.denda ? 'selected' : ''}>Tidak ada (nol)</option><option value=tetap ${P.denda && P.denda.mode === 'tetap' ? 'selected' : ''}>Nominal tetap</option><option value=persen ${P.denda && P.denda.mode === 'persen' ? 'selected' : ''}>Persen per hari dari tunggakan</option></select></label>${inp('Nilai denda (Rp atau %)', 'dendaNilai', P.denda ? (P.denda.mode === 'persen' ? P.denda.nilai * 100 : P.denda.nilai) : 0, 'number', 'step=0.01 min=0')}<label>Anggota tidak aktif boleh bertransaksi <input type=checkbox name=izin ${P.izinkanTidakAktif ? 'checked' : ''}></label><button class=p data-a=param>Simpan parameter</button></div><p class=c>Denda bernilai nol sampai pengurus menetapkan kebijakannya. Simapan 2% belum ada di v1 karena belum dipastikan wajib.</p></div>
    <div class=k><h4>Cadangan</h4><div class=baris><button class=p data-a=backup>Unduh cadangan terenkripsi</button><label>Pulihkan cadangan <input type=file accept=.json data-a=pulihkan></label></div><p class=c>Cadangan hanya bisa dibuka dengan kata sandi yang sama saat dibuat. Lakukan setiap hari kerja; menghapus data browser tanpa cadangan berarti kehilangan buku pembantu.</p></div>
    <div class=k><h4>Log audit (50 terakhir)</h4><table><tr>${kolom(['Waktu', 'Oleh', 'Aksi', 'Rincian'])}</tr>${D().audit.slice(-50).reverse().map((a) => `<tr><td class=c>${esc(a.ts.slice(0, 19).replace('T', ' '))}</td><td>${esc(a.oleh)}</td><td>${esc(a.aksi)}</td><td class=c>${esc(a.detail)}</td></tr>`).join('')}</table></div>`;
  }

  function render() {
    const isi = { Loket: tabLoket, Anggota: tabAnggota, Pinjaman: tabPinjaman, 'Kas Harian': tabKas, Ekspor: tabEkspor, Laporan: tabLaporan, Pengaturan: tabPengaturan }[S.tab]();
    $('#akar').innerHTML = `<header><b>USP · Koperasi Merah Putih</b><button data-a=keluar>Kunci</button></header><nav class=tdk>${TABS.map((t) => `<button data-a=tab data-id="${t}" class="${t === S.tab ? 'on' : ''}">${t}</button>`).join('')}</nav><main>${isi}</main>`;
  }

  // ---------- Aksi ----------
  const H = {
    async buat(el) {
      const f = ambil(el);
      if (f.sandi.length < 8) return pesan('Kata sandi minimal 8 karakter.', true);
      if (f.sandi !== f.ulang) return pesan('Kata sandi tidak sama.', true);
      S.data = L.dataBaru(); S.k = await SIMPAN.baru(f.sandi, S.data); render();
    },
    async masuk(el) { try { const r = await SIMPAN.masuk(ambil(el).sandi); S.k = r.k; S.data = r.data; render(); } catch (e) { pesan('Kata sandi salah atau data rusak.', true); } },
    keluar() { S.data = null; S.k = null; layarMasuk(); },
    tab(el) { S.tab = el.dataset.id; render(); },
    cari(el) { S.cari = el.value; $('#hasilCari').innerHTML = hasilCari(); },
    pilih(el) { S.aid = el.dataset.id; render(); },
    tglKas(el) { S.tglKas = el.value; render(); },
    sim(el) { $('#sim').innerHTML = simulasi(ambil(el)); },
    cetak() { window.print(); },
    anggotaBaru(el) { const f = ambil(el); return jalan(L.tambahAnggota(D(), f, S.kasir), 'Anggota didaftarkan'); },
    async status(el) { return jalan(L.ubahStatus(D(), el.dataset.id, el.value, S.kasir), 'Status diubah'); },
    setor(el) { const f = ambil(el); S.kasir = f.kasir; return jalan(L.setor(D(), { ...f, anggotaId: S.aid, jumlah: angka(f.jumlah) }, hariIni()), 'Setoran tersimpan'); },
    tarik(el) { const f = ambil(el); S.kasir = f.kasir; return jalan(L.tarik(D(), { ...f, anggotaId: S.aid, sub: 'sukarela', jumlah: angka(f.jumlah) }, hariIni()), 'Penarikan tersimpan'); },
    adm(el) { const f = ambil(el); S.kasir = f.kasir; return jalan(L.adm(D(), { ...f, anggotaId: S.aid, jumlah: angka(f.jumlah) }, hariIni()), 'Tersimpan'); },
    angsur(el) { const f = ambil(el); S.kasir = f.kasir; return jalan(L.angsur(D(), { ...f, jumlah: angka(f.jumlah), denda: angka(f.denda), jasaLunas: angka(f.jasaLunas) }, hariIni()), 'Angsuran tersimpan'); },
    balik(el) {
      const alasan = prompt('Alasan pembalikan (wajib):'); if (!alasan) return;
      const kasir = S.kasir || prompt('Nama kasir:'); if (!kasir) return; S.kasir = kasir;
      return jalan(L.balik(D(), { trxId: el.dataset.id, tgl: hariIni(), kasir, alasan }, hariIni()), 'Pembalik dicatat pada ' + hariIni());
    },
    ajukan(el) { const f = ambil(el); S.kasir = f.pengaju; return jalan(L.ajukan(D(), { ...f, pokok: angka(f.pokok), tenor: angka(f.tenor), suku: angka(f.suku) / 100 }), 'Pengajuan dicatat'); },
    setuju(el) { const n = prompt('Nama penyetuju (harus berbeda dari pengaju):'); if (n) return jalan(L.putuskan(D(), el.dataset.id, n, true), 'Disetujui'); },
    tolakP(el) { const n = prompt('Nama pemutus:'); if (n) return jalan(L.putuskan(D(), el.dataset.id, n, false), 'Ditolak'); },
    cairkan(el) {
      const kasir = prompt('Nama kasir yang menyerahkan uang (berbeda dari pengaju dan penyetuju):'); if (!kasir) return;
      const c = confirm('Uang diserahkan TUNAI? OK = tunai, Batal = lewat bank.') ? 'tunai' : 'bank';
      return jalan(L.cairkan(D(), { pinjamanId: el.dataset.id, tgl: hariIni(), kasir, cara: c }, hariIni()), 'Pinjaman dicairkan');
    },
    setorBank(el) { const f = ambil(el); S.kasir = f.kasir; return jalan(L.setorBank(D(), { ...f, jumlah: angka(f.jumlah) }, hariIni()), 'Setoran ke bank dicatat'); },
    tutup(el) {
      const f = ambil(el); S.kasir = f.kasir;
      if (!confirm('Tutup kas ' + f.tgl + '? Transaksi tanggal ini akan terkunci.')) return;
      return jalan(L.tutupKas(D(), { ...f, saldoFisik: f.saldoFisik === '' ? NaN : angka(f.saldoFisik) }, hariIni()), 'Kas ditutup');
    },
    async template(el) {
      const b = el.files[0]; el.value = ''; if (!b) return;
      let T; try { T = JSON.parse(await b.text()); } catch (e) { return pesan('Bukan JSON yang valid.', true); }
      if (!T || T.app !== 'kdmp-usp-template' || T.versi !== 1 || !T.pemetaan || !T.coa || !T.periode) return pesan('Bukan berkas template USP v1.', true);
      D().template = T; await simpan(); pesan('Template dimuat'); render();
    },
    async ekspor(el) {
      const f = ambil(el);
      if (!confirm('Buat berkas data USP untuk ' + f.dari + ' s.d. ' + f.sampai + '?')) return;
      const r = await L.ekspor(D(), { dari: f.dari, sampai: f.sampai, oleh: S.kasir });
      if (!r.ok) return pesan(r.galat, true);
      const raw = await SIMPAN.mentah(); void raw; await simpan();
      unduh('KDMP_USP_data_' + f.dari.replace(/-/g, '') + '_' + f.sampai.replace(/-/g, '') + '.json', r.data);
      pesan('Berkas dibuat: ' + r.data.jurnal.length + ' baris jurnal'); render();
    },
    param(el) {
      const f = ambil(el), P = D().param;
      P.provisiPersen = angka(f.provisiPersen); P.crkPersen = angka(f.crkPersen); P.sukuBawaan = angka(f.suku) / 100; P.izinkanTidakAktif = !!f.izin;
      P.denda = f.dendaMode ? { mode: f.dendaMode, nilai: f.dendaMode === 'persen' ? angka(f.dendaNilai) / 100 : angka(f.dendaNilai) } : null;
      return jalan({ ok: true }, 'Parameter disimpan');
    },
    async backup() { unduh('KDMP_USP_cadangan_' + hariIni() + '.json', await SIMPAN.mentah()); },
    async pulihkan(el) {
      const b = el.files[0]; el.value = ''; if (!b) return;
      const sandi = prompt('Kata sandi cadangan itu:'); if (!sandi) return;
      if (!confirm('Memulihkan akan MENGGANTI semua data di browser ini. Lanjutkan?')) return;
      try { const r = await SIMPAN.pulihkan(JSON.parse(await b.text()), sandi); S.k = r.k; S.data = r.data; pesan('Data dipulihkan'); render(); } catch (e) { pesan('Gagal: kata sandi salah atau berkas rusak.', true); }
    }
  };
  document.addEventListener('click', (e) => { const el = e.target.closest('[data-a]'); if (el && el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && H[el.dataset.a]) H[el.dataset.a](el); });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-a]'); if (el && (el.tagName === 'SELECT' || el.type === 'file' || el.type === 'date') && H[el.dataset.a]) H[el.dataset.a](el); });
  document.addEventListener('input', (e) => { const el = e.target.closest('[data-a]'); if (el && (el.dataset.a === 'cari' || el.dataset.a === 'sim')) H[el.dataset.a](el); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.closest('#kunci')) { const b = $('#kunci [data-a]'); if (b) b.click(); } });
  layarMasuk();
})();
