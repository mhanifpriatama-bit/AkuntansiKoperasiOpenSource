/**
 * @license
 * KDMP Akuntansi - Main Application Entry Point
 */
import { $, S, setMETA, dirty } from './state.js';
import './config.js';
import './crypto.js';
import { kv, manualSave } from './db.js';
import './accounting-engine.js';
import './export.js';
import './ui-renderers.js';
import { setupUI, loginUI, box } from './auth.js';

// Keyboard shortcut (Ctrl+S / Cmd+S for manual save)
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key == 's' || e.key == 'S')) {
    e.preventDefault();
    if (window.S) manualSave();
  }
});

// Guard against unsaved changes on unload
addEventListener('beforeunload', e => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// Clear title placeholder
const ttl = document.getElementById('ttl');
if (ttl) ttl.textContent = '';

// Main application bootstrap
(async () => {
  try {
    box('<p>Membuka database lokal\u2026</p>');
    await kv.open();
    try {
      if (navigator.storage && navigator.storage.persist) {
        await navigator.storage.persist();
      }
    } catch (e) {}
    const meta = await kv.get('meta');
    setMETA(meta);
    window.__ok = 2;
    meta ? loginUI() : setupUI();
  } catch (e) {
    if (window.__err) {
      window.__err('Gagal membuka database lokal (IndexedDB): ' + ((e && e.message) || e));
    } else {
      alert('Gagal membuka database lokal (IndexedDB): ' + ((e && e.message) || e));
    }
  }
})();
