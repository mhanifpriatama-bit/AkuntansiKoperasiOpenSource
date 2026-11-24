/*
 * Pesan singkat (toast) dan dialog sandi.
 */
(function (KDMP) {
  'use strict';
  const { $ } = KDMP.ui.dom;

  /** Pesan melayang 2,4 detik di bawah layar. */
  function toast(pesan) {
    const e = $('#tt');
    e.textContent = pesan;
    e.style.display = 'block';
    clearTimeout(e._t);
    e._t = setTimeout(() => (e.style.display = 'none'), 2400);
  }

  /** Dialog meminta sandi. @returns {Promise<string|null>} sandi, atau null bila dibatalkan. */
  function mintaSandi(pesan) {
    return new Promise(function (selesai) {
      const o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
      o.innerHTML = '<form style="background:#fff;color:#222;padding:18px;border-radius:8px;min-width:280px;max-width:90vw;box-shadow:0 4px 24px rgba(0,0,0,.3)"><p style="margin:0 0 10px">' + pesan + '</p><input type=password autocomplete=current-password style="width:100%;box-sizing:border-box;padding:6px;margin-bottom:10px"><div style="text-align:right"><button type=button class=b>Batal</button> <button type=submit class=p>Lanjut</button></div></form>';
      document.body.appendChild(o);
      const kolom = o.querySelector('input');
      const tutup = (v) => { o.remove(); selesai(v); };
      kolom.focus();
      o.querySelector('form').onsubmit = (e) => { e.preventDefault(); tutup(kolom.value); };
      o.querySelector('.b').onclick = () => tutup(null);
    });
  }

  KDMP.ui.pesan = { toast, mintaSandi };
})(globalThis.KDMP);
