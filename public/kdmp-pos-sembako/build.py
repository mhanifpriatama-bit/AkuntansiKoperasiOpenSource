#!/usr/bin/env python3
"""Menyusun aplikasi dari modul di src/.

Hasil:
  dist/kdmp-pos-sembako.html  satu berkas HTML offline (yang dibagikan ke pengguna)
  index.html                halaman pengembangan: memuat modul satu per satu lewat <script src>

Urutan muat ditentukan oleh penanda <!--@css ...--> dan <!--@js ...--> di src/kerangka.html.
Untuk menambah modul: buat berkas di src/, lalu tambahkan satu baris penanda di kerangka.html.

Pemakaian:  python3 build.py
"""
import pathlib
import re
import sys

AKAR = pathlib.Path(__file__).resolve().parent
SRC = AKAR / 'src'
POLA = re.compile(r'<!--@(css|js) (\S+?)-->')


def baca(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def tulis(p, teks):
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(teks)


def main():
    kerangka = baca(SRC / 'kerangka.html')
    terdaftar = [m.group(2) for m in POLA.finditer(kerangka)]
    hilang = [b for b in terdaftar if not (SRC / b).is_file()]
    if hilang:
        sys.exit('Berkas modul tidak ditemukan: ' + ', '.join(hilang))
    if len(set(terdaftar)) != len(terdaftar):
        sys.exit('Ada modul yang didaftarkan dua kali di src/kerangka.html')
    ada = {p.relative_to(SRC).as_posix() for ext in ('css', 'js') for p in (SRC / ext).rglob('*.' + ext)}
    for b in sorted(ada - set(terdaftar)):
        print('Peringatan: %s ada di src/ tetapi belum didaftarkan di kerangka.html' % b)

    def satu(m):
        isi = baca(SRC / m.group(2))
        tag = 'style' if m.group(1) == 'css' else 'script'
        return '<%s>\n%s\n</%s>' % (tag, isi, tag)

    def dev(m):
        if m.group(1) == 'css':
            return '<link rel="stylesheet" href="src/%s">' % m.group(2)
        return '<script src="src/%s"></script>' % m.group(2)

    tulis(AKAR / 'dist' / 'kdmp-pos-sembako.html', POLA.sub(satu, kerangka))
    tulis(AKAR / 'index.html', POLA.sub(dev, kerangka))
    print('Selesai: dist/kdmp-pos-sembako.html dan index.html (%d modul)' % len(terdaftar))


main()
