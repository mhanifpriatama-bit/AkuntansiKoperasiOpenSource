/* Titik masuk aplikasi */
document.getElementById('nm-koperasi').textContent=APLIKASI.namaLengkap;
document.getElementById('lg').src=LOGO;
document.getElementById('ttl').textContent='';

(async()=>{try{box('<p>Membuka database lokal\u2026</p>');await kv.open();try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}META=await kv.get('meta');window.__ok=2;META?loginUI():setupUI()}catch(e){window.__err('Gagal membuka database lokal (IndexedDB): '+((e&&e.message)||e))}})();
