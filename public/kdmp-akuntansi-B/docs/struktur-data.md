# Struktur data tersimpan

Bentuk di bawah ini **kompatibel dengan aplikasi asli**; jangan diubah tanpa migrasi.

## IndexedDB (`kdmp_akuntansi`, object store `s`: `{k, v, t}`)

| Kunci | Isi |
|---|---|
| `meta` | `{saltA, units:{USP:{s, wU, wA}, Sembako:{...}}}` – salt dan kunci data terbungkus (lihat `js/security/kunci.js`) |
| `d_USP`, `d_Sembako`, `d_KONSOL` | data unit, **terenkripsi** (`"<iv>.<ciphertext>"` base64) |
| `coa` | daftar akun `[[kode, nama, saldoNormal], ...]` + baris penanda `['#v','3','']` |
| `snap_<unit>_<ms>` | titik pulih `{t, l, d}` (d = nilai `d_<unit>` terenkripsi) |
| `lastexp_<unit>`, `lastbak` | waktu ekspor/backup terakhir (untuk pengingat) |

## Data unit (setelah didekripsi)

```jsonc
{
  "bulan": 10, "tahun": 2026,           // periode laporan yang dipilih
  "kop": "KDMP", "alamat": "", "kota": "", "pet": "", "ben": "", "ket": "",   // kop & penanda tangan
  "logo": "data:image/...",             // opsional; bila kosong dipakai logo bawaan
  "cv": 3,                              // versi COA (3 = kode aset versi baru)
  "rows": [ { "d": "2026-03-15", "no": "U-03-01", "ak": "1.1.1.02 Kas di Bank BRI",
              "db": 1000000, "kr": 0, "ket": "...", "kom": "Komponen Arus Kas (opsional)" } ],
  "sub": { "aset": [...], "pb": [...], "pm": [...] },   // buku pembantu aset & persediaan
  // khusus Konsolidasi:
  "elnb": {"kodeAkun": nilai}, "elm": {...}, "ely": {...},  // eliminasi manual (neraca / LR bulan / LR s.d. bulan)
  "imp": { "USP": {...data unit hasil impor paket...}, "Sembako": {...} }
}
```

Kunci `ak` selalu diawali kode akun lalu spasi lalu nama (`KDMP.core.format.kodeAkun` mengambil kodenya).
`units` (data semua unit) hanya ada di memori saat mode Konsolidasi dan tidak disimpan.

Contoh data lengkap (sintetis): `tests/data/data-sintetis.json`.

## Berkas backup & paket

- Backup lengkap: `{app:"kdmp-full", ts, tgl, kv:{...semua kunci IndexedDB...}}`
- Paket unit (.kdmp.json): `{app:"kdmp2", unit, ts, tgl, saltA, s, wU, wA, data}` (data terenkripsi berisi `{rows, kop, tahun, sub, cv}`) – dibuka Konsolidasi dengan sandi Admin
- Backup COA: `{app:"kdmp-coa", ...}`
