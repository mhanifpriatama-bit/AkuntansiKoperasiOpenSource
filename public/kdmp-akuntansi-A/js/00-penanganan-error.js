/* Penanganan error global: menampilkan pesan bila aplikasi gagal dimuat. */
window.__ok=0;
window.__err=function(m){var o=document.getElementById('ov');if(!o||window.__ok==2)return;o.style.display='block';o.innerHTML='<div style="max-width:620px;margin:30px auto;padding:20px;background:#fff;border-top:5px solid #A4161F;font:14px sans-serif"><b>Aplikasi gagal dimuat.</b><br><br>'+String(m)+'<br><br><small>Kirim tulisan ini (atau screenshot-nya) agar bisa diperbaiki.</small></div>'};
window.onerror=function(m,s,l,c){window.__err(m+' ('+String(s).split('/').pop()+' baris '+l+':'+c+')')};
window.addEventListener('unhandledrejection',function(e){window.__err((e.reason&&e.reason.message)||e.reason)});
