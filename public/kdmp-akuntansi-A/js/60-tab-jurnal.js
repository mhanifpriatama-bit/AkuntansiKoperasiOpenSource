/* Tab Jurnal */
R['Jurnal']=function(){const P=S.tahun*12+B(),Y=+S.tahun,vis=[];S.rows.forEach((r,i)=>{if(!r.d||ymOf(r.d)==P||KEEP.has(r))vis.push(i)});const au=akKom(S.rows,Y,P);
  let h=`<div class=bar><button onclick="KEEP.add(S.rows[S.rows.push({d:defDate()})-1]);save();go()">+ Baris</button><button onclick="for(let i=0;i<10;i++)KEEP.add(S.rows[S.rows.push({d:defDate()})-1]);save();go()">+10 Baris</button><span class=c><b>Periode ${MON[B()-1]} ${S.tahun}</b> (${vis.length} baris). Ganti bulan/tahun di kanan atas untuk membuat atau melihat jurnal periode lain; data periode sebelumnya tetap tersimpan. Ketik sebagian nama/kode akun untuk mencari. Saldo awal: isi Keterangan <b>Saldo Awal</b> (sekali saja, pada periode pertama). Komponen arus kas pada baris kas/bank terisi otomatis dari akun lawan (No Bukti sama); pilih manual bila ingin mengubahnya.</span></div><table><tr><th>#</th><th>Tanggal</th><th>No Bukti</th><th>Akun</th><th>Debit</th><th>Kredit</th><th>Keterangan</th><th>Komponen Arus Kas</th><th></th></tr>`;
  vis.forEach((i,n)=>{const r=S.rows[i],bad=r.ak&&!NM[r.ak.split(' ')[0]],m=au.get(r),al=m?Object.keys(m).join(' + '):'';
   const c=k=>`<td><input class="i" ${k=='ak'?'list=dl':''} value="${esc(r[k])}" onchange="S.rows[${i}].${k}=this.value;save();status()"></td>`;
   const nm=k=>`<td class=n><input class="i n" data-f=1 inputmode=numeric value="${fmtN(r[k])}" oninput="nIn(this)" onchange="jNum(${i},'${k}',this)"></td>`;
   h+=`<tr class="${bad?'bad':''}"><td class=c>${n+1}</td><td>${dfield(r.d,'rows:'+i+':d',1)}</td>${c('no')}${c('ak')}${nm('db')}${nm('kr')}${c('ket')}<td><select onchange="S.rows[${i}].kom=this.value;save()"><option value="">${al?'(otomatis) '+esc(al):''}</option>${CFG.kom.map(x=>`<option ${r.kom==x?'selected':''}>${x}</option>`).join('')}</select></td><td><button onclick="jDel(${i})">\u00d7</button></td></tr>`});
  $('#m').innerHTML=h+`</table><p>Total Debit <b id=jtd></b> | Total Kredit <b id=jtk></b> <span class=c>(periode ini)</span></p>`;jTot()};
function jTot(){const P=S.tahun*12+B();let a=0,b=0;S.rows.forEach(r=>{if(!r.d||ymOf(r.d)==P){a+=+r.db||0;b+=+r.kr||0}});const x=$('#jtd'),y=$('#jtk');if(x)x.textContent=f(a);if(y)y.textContent=f(b)}
function jNum(i,k,el){const v=idn(el.value);S.rows[i][k]=v;el.value=fmtN(v);save();status();jTot()}
function jDel(i){const r=S.rows[i];if(!r)return;const u=(r.ak||'(akun kosong)')+' | Debit '+f(+r.db||0)+' | Kredit '+f(+r.kr||0);
  if(!confirm('Hapus baris jurnal ini?\n\n'+u+'\n\n(Konfirmasi 1 dari 2)'))return;
  if(!confirm('Yakin ingin menghapus? Baris yang dihapus tidak dapat dikembalikan.\n\n(Konfirmasi 2 dari 2)'))return;
  S.rows.splice(i,1);save();go()}
