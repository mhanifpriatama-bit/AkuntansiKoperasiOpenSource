# Uji asap di Chrome tanpa tampilan: python3 alat/asap.py
import sys, json, os, tempfile
from playwright.sync_api import sync_playwright
HTML = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist', 'kdmp-usp.html'))
galat = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page()
    pg.on('pageerror', lambda e: galat.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: galat.append('console: ' + m.text) if m.type == 'error' else None)
    pg.on('dialog', lambda d: d.accept('Rina' if 'menyerahkan' in d.message else ('Hartono' if 'penyetuju' in d.message else 'alasan uji')) if d.type == 'prompt' else d.accept())
    pg.goto(HTML)
    pg.fill('input[name=sandi]', 'rahasia123'); pg.fill('input[name=ulang]', 'rahasia123'); pg.click('[data-a=buat]')
    pg.wait_for_selector('nav')
    def tab(n): pg.click(f'nav [data-id="{n}"]')
    # template (periode = bulan ini)
    import datetime
    hi = datetime.date.today()
    T = {'app':'kdmp-usp-template','versi':1,'idTemplat':'T-UJI','unit':'USP','koperasi':'Uji','periode':{'tahun':hi.year,'bulan':hi.month},'dasarJasa':'KAS','posisiSaldo':'x',
      'coa':[['1.1.1.01','Kas Tunai','Debit'],['1.1.1.02','Kas di Bank BRI','Debit'],['1.1.2.06','Kredit Anggota','Debit'],['1.1.3.05','Dana CRK','Kredit'],['2.1.1.03','Utang Simpanan Sukarela','Kredit'],['3.1.1.01','Simpanan Pokok','Kredit'],['3.1.2.01','Simpanan Wajib','Kredit'],['4.1.3.02','Pendapatan Jasa Pinjaman','Kredit'],['4.1.3.05','Pendapatan Administrasi','Kredit'],['9.1.3.01','Pendapatan Denda','Kredit']],
      'komponenArusKas':[],'saldoReferensi':{'1.1.1.01':20000000,'1.1.1.02':0,'1.1.2.06':0,'1.1.3.05':0,'2.1.1.03':0,'3.1.1.01':0,'3.1.2.01':0},
      'pemetaan':{'kasTunai':'1.1.1.01','bank':'1.1.1.02','kredit':'1.1.2.06','crk':'1.1.3.05','simpananPokok':'3.1.1.01','simpananWajib':'3.1.2.01','simpananSukarela':'2.1.1.03','jasaPinjaman':'4.1.3.02','provisi':'4.1.3.05','denda':'9.1.3.01'}}
    open('/tmp/tpl-uji.json','w').write(json.dumps(T))
    tab('Ekspor'); pg.set_input_files('input[type=file]', '/tmp/tpl-uji.json'); pg.wait_for_selector('text=T-UJI')
    # anggota
    tab('Anggota'); pg.fill('input[name=no]', 'KMP-0123'); pg.fill('input[name=nama]', 'Siti Aminah'); pg.click('[data-a=anggotaBaru]')
    pg.wait_for_selector('text=KMP-0123')
    # loket: setoran
    tab('Loket'); pg.fill('#cari', 'siti'); pg.click('[data-a=pilih]')
    pg.wait_for_selector('text=Setoran simpanan')
    f = pg.locator('[data-f]', has_text='Setoran simpanan').first
    f.locator('input[name=kasir]').fill('Rina'); f.locator('input[name=jumlah]').fill('500000'); f.locator('select[name=sub]').select_option('sukarela'); f.locator('[data-a=setor]').click()
    pg.wait_for_selector('text=Rp 500.000')
    # tarik melebihi saldo harus ditolak
    t = pg.locator('[data-f]', has_text='Penarikan simpanan').first
    t.locator('input[name=kasir]').fill('Rina'); t.locator('input[name=jumlah]').fill('900000'); t.locator('[data-a=tarik]').click()
    pg.wait_for_selector('#pesan:has-text("melebihi saldo")')
    # pinjaman: ajukan, setujui, cairkan
    tab('Pinjaman'); a = pg.locator('[data-f]').first
    a.locator('input[name=pokok]').fill('5000000'); pg.wait_for_selector('#sim table'); a.locator('input[name=pengaju]').fill('Budi'); a.locator('[data-a=ajukan]').click()
    pg.wait_for_selector('text=Diajukan'); pg.click('[data-a=setuju]'); pg.wait_for_selector('text=Disetujui'); pg.click('[data-a=cairkan]'); pg.wait_for_selector('td:has-text("Aktif")')
    # kas harian: tutup
    tab('Kas Harian')
    sist = pg.locator('p b').first.inner_text()
    print('saldo kas sistem:', sist)
    nilai = int(''.join(c for c in sist if c.isdigit())) * (-1 if sist.startswith('-') else 1)
    k = pg.locator('[data-f]', has_text='Tutup kas').first
    k.locator('input[name=saldoFisik]').fill(str(nilai)); k.locator('input[name=kasir]').fill('Rina'); k.locator('[data-a=tutup]').click()
    pg.wait_for_timeout(500); print('pesan:', pg.inner_text('#pesan'), '| sistem:', sist, '| fisik:', nilai)
    pg.wait_for_selector('text=Ditutup oleh Rina')
    # ekspor: unduh berkas dan periksa isinya
    tab('Ekspor')
    with pg.expect_download() as dl:
        pg.click('[data-a=ekspor]')
    arsip = json.load(open(dl.value.path()))
    assert arsip['app'] == 'kdmp-usp-data' and arsip['kontrol']['totalDebit'] == arsip['kontrol']['totalKredit'] > 0, arsip['kontrol']
    json.dump(arsip, open('/tmp/usp-ekspor.json','w'))
    print('ekspor:', len(arsip['jurnal']), 'baris, checksum', arsip['kontrol']['checksum'][:12])
    # laporan
    tab('Laporan'); pg.wait_for_selector('text=Rekap simpanan')
    # reload: data harus terenkripsi dan bisa dibuka lagi
    pg.reload(); pg.fill('input[name=sandi]', 'salah'); pg.click('[data-a=masuk]'); pg.wait_for_selector('#pesan:has-text("salah")')
    pg.fill('input[name=sandi]', 'rahasia123'); pg.click('[data-a=masuk]'); pg.wait_for_selector('nav')
    tab('Anggota'); pg.wait_for_selector('text=Siti Aminah')
    mentah = pg.evaluate("SIMPAN.mentah()")
    assert 'Siti' not in json.dumps(mentah), 'data tidak terenkripsi'
    pg.screenshot(path='/tmp/usp-anggota.png')
    tab('Loket'); pg.screenshot(path='/tmp/usp-loket.png')
    b.close()
print('GALAT:', galat if galat else 'tidak ada')
print('uji asap lolos' if not galat else 'ADA GALAT')
sys.exit(1 if galat else 0)
