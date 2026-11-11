/*
 * Paket unit (.kdmp.json): ekspor dari unit, impor ke unit yang sama (pindah komputer), dan impor
 * backup/paket kedua unit ke Konsolidasi. Semua tetap terenkripsi; sandi Admin harus sama di semua komputer.
 */
(function (KDMP) {
  'use strict';
  const kv = KDMP.storage.kv;
  const kripto = KDMP.security.kripto;
  const { esc } = KDMP.core.format;
  const { klik, arg } = KDMP.ui.aksi;
  const app = KDMP.app.state;
  const UNIT = KDMP.config.aplikasi.unit;
  let hasilImpor = '';

  const bukaData = async (mentah, teks) => kripto.dekripsiJson(await kripto.kunciDariMentah(mentah), teks);
  const tglId = (t) => new Date(t).toLocaleString('id-ID');

  async function ekspor() {
    await KDMP.app.simpan.saatIni();
    const k = app.kunci;
    const m = k.META.units[app.unit];
    const ts = Date.now();
    const d = app.data;
    await KDMP.ui.berkas.simpanJson('KDMP_' + app.unit + '_' + new Date().toISOString().slice(0, 10) + '.kdmp.json', {
      app: 'kdmp2', unit: app.unit, ts, saltA: k.META.saltA, s: m.s, wU: m.wU, wA: m.wA, tgl: tglId(ts),
      data: await kripto.enkripsiJson(k.DK, { rows: d.rows.filter((r) => r.ak || r.db || r.kr), kop: d.kop, tahun: d.tahun, sub: d.sub, cv: 3 })
    });
    await kv.set('lastexp_' + app.unit, ts);
    infoEkspor();
  }

  /** Teks status ekspor di tab Data ("terakhir diekspor ..."). */
  async function infoEkspor() {
    const e = document.getElementById('ei');
    if (!e || app.konsol) return;
    const le = await kv.get('lastexp_' + app.unit);
    const v = await kv.ver([app.kunci.KEY]);
    const t = v[app.kunci.KEY] ? +v[app.kunci.KEY] : 0;
    e.innerHTML = !le ? '<b class=no>⚠ Paket belum pernah diekspor untuk bendahara.</b>'
      : 'Terakhir diekspor untuk bendahara: <b>' + tglId(le) + '</b>' + (t > le + 1000 ? ' — <b class=no>⚠ ada perubahan data setelah itu, ekspor ulang.</b>' : ' — <span class=ok>data sudah sama dengan paket.</span>');
  }

  /** Impor paket milik unit ini sendiri (mis. pindah komputer). */
  function imporPaket(berkas) {
    const r = new FileReader();
    r.onload = async () => {
      try {
        const o = JSON.parse(r.result);
        if (o.unit != app.unit) throw 0;
        const mentah = await kripto.dekripsi(await kripto.turunkanKunci(app.kunci.PIN, kripto.dariBase64(o.s)), o.wU);
        const d = await bukaData(mentah, o.data);
        app.data.rows = d.rows;
        app.data.kop = d.kop || app.data.kop;
        if (d.sub) app.data.sub = d.sub;
        KDMP.app.simpan.jadwalkan();
        KDMP.app.navigasi.pergi('Jurnal');
      } catch (e) { alert('Gagal: file bukan milik unit ini atau sandi berbeda.'); }
    };
    r.readAsText(berkas);
  }

  /** Impor banyak berkas (backup lengkap atau paket unit) ke Konsolidasi. Hasil ditampilkan di tab Data Unit. */
  async function imporKonsol(daftarBerkas) {
    const berkas = [...daftarBerkas];
    if (!berkas.length) return;
    const L = [];
    const terbaik = {};
    const d0 = app.data;
    for (const f of berkas) {
      try {
        const o = JSON.parse(await f.text());
        if (o && o.app == 'kdmp-full' && o.kv && o.kv.meta) {
          const mt = o.kv.meta;
          let kunciAdmin;
          let n = 0;
          try { kunciAdmin = await kripto.turunkanKunci(app.kunci.PIN, kripto.dariBase64(mt.saltA)); } catch (e) { throw new Error('backup rusak'); }
          for (const u of UNIT) {
            const x = o.kv['d_' + u];
            if (!x || !mt.units || !mt.units[u]) continue;
            let d;
            try { d = await bukaData(await kripto.dekripsi(kunciAdmin, mt.units[u].wA), x); } catch (e) { throw new Error('sandi Admin di komputer asal berbeda dengan sandi Admin Anda'); }
            d.tgl = o.tgl; d.ts = o.ts || 0; d.impT = Date.now();
            (terbaik[u] = terbaik[u] || []).push({ d, fn: f.name, u });
            n++;
          }
          if (!n) throw new Error('backup ini tidak berisi data unit USP/Sembako (unduh Backup Database dari komputer unit)');
          if (Array.isArray(o.kv.coa)) {
            const coa = KDMP.core.coa;
            const baru = o.kv.coa.filter((a) => Array.isArray(a) && coa.POLA_KODE.test(a[0]) && a[1] && (a[2] == 'Debit' || a[2] == 'Kredit') && !coa.saldoNormal[a[0]]);
            if (baru.length) {
              baru.forEach((a) => coa.tambah(a[0], a[1], a[2]));
              KDMP.storage.coaDb.simpan();
              L.push({ ok: 1, n: f.name, m: baru.length + ' akun tambahan dari COA unit ditambahkan ke Master COA: ' + esc(baru.map((a) => a[0]).join(', ')) });
            }
          }
          continue;
        }
        if (!o || o.app != 'kdmp2' || !UNIT.includes(o.unit) || !o.data) throw new Error('bukan paket unit (.kdmp.json) atau Backup Database KDMP yang valid');
        let d;
        try { d = await bukaData(await kripto.dekripsi(await kripto.turunkanKunci(app.kunci.PIN, kripto.dariBase64(o.saltA)), o.wA), o.data); } catch (e) { throw new Error('sandi Admin di komputer asal berbeda dengan sandi Admin Anda'); }
        d.tgl = o.tgl; d.ts = o.ts || 0; d.impT = Date.now();
        (terbaik[o.unit] = terbaik[o.unit] || []).push({ d, fn: f.name, u: o.unit });
      } catch (e) { L.push({ ok: 0, n: f.name, m: e.message || 'gagal dibuka' }); }
    }
    for (const u in terbaik) {
      const a = terbaik[u].sort((x, y) => (y.d.ts || 0) - (x.d.ts || 0));
      const w = a[0];
      a.slice(1).forEach((x) => L.push({ ok: 0, n: x.fn, m: 'dilewati — ada file ' + u + ' yang lebih baru' }));
      d0.imp[u] = w.d;
      d0.units[u] = w.d;
      const th = +w.d.tahun != +d0.tahun ? ' <b class=no>(tahun data ' + w.d.tahun + ', periode konsolidasi ' + d0.tahun + ')</b>' : '';
      L.push({ ok: 1, n: w.fn, m: 'unit <b>' + u + '</b> diimpor — ' + (w.d.rows || []).length + ' baris jurnal, diekspor ' + esc(w.d.tgl || '-') + th });
    }
    if (L.some((x) => x.ok)) KDMP.app.simpan.jadwalkan();
    hasilImpor = '<div style="background:#fff;padding:10px 14px;margin:10px 0;border-left:4px solid #1F3864"><b>Hasil impor</b>' +
      L.map((x) => `<div class="${x.ok ? 'ok' : 'no'}">${x.ok ? '✔' : '✖'} ${esc(x.n)} — ${x.ok ? x.m : esc(x.m)}</div>`).join('') +
      (L.some((x) => x.ok) ? '<div style="margin-top:8px"><button class=p ' + klik('nav.tab', { tab: 'Neraca Konsolidasi' }) + '>Lihat Neraca Konsolidasi</button></div>' : '') + '</div>';
    KDMP.app.navigasi.pergi('Data Unit');
  }

  /** Mengambil (sekali) ringkasan hasil impor terakhir untuk ditampilkan. */
  function ambilHasilImpor() { const h = hasilImpor; hasilImpor = ''; return h; }

  KDMP.ui.aksi.daftar({
    'paket.ekspor': () => ekspor(),
    'paket.impor': (el) => imporPaket(el.files[0]),
    'paket.imporKonsol': (el, e) => {
      imporKonsol(e.type == 'drop' ? e.dataTransfer.files : el.files);
      if (e.type != 'drop') el.value = '';
    }
  });
  KDMP.app.paket = { ekspor, infoEkspor, imporPaket, imporKonsol, ambilHasilImpor };
})(globalThis.KDMP);
