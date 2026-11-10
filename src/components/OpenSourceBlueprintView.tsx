import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  GitBranch, 
  ShieldCheck, 
  FolderTree, 
  Users, 
  Terminal, 
  FileCode2, 
  ArrowRight, 
  Layers, 
  Database, 
  Smartphone, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export const OpenSourceBlueprintView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleRepoTree = `open-koperasi/
├── .github/
│   ├── workflows/             # CI/CD: Automated Tests & Lint
│   └── ISSUE_TEMPLATE/        # Standard contribution bug & feature forms
├── packages/
│   ├── core-accounting/       # Pure TypeScript Accounting Domain (Zero Dependencies)
│   │   ├── src/
│   │   │   ├── doubleEntry.ts # Validasi balance & debit-credit invariant
│   │   │   ├── ledger.ts      # Buku Besar & perhitungan saldo berjalan
│   │   │   ├── statements.ts  # Generator Neraca, Laba Rugi, Arus Kas
│   │   │   ├── depreciation.ts# Depresiasi Aset (Garis Lurus & Saldo Menurun)
│   │   │   └── inventory.ts   # Moving Average inventory valuation
│   │   └── tests/             # 100% Unit test coverage untuk rumus akuntansi
│   ├── coa-standards/         # Standar Bagan Akun Kemenkop & SAK EP
│   │   ├── ksp.json           # Standar Koperasi Simpan Pinjam
│   │   ├── serba-usaha.json   # Standar Koperasi Serba Usaha (KSU)
│   │   └── bumdes.json        # Standar Akuntansi BUMDes
│   └── web-app/               # React + Tailwind + PWA Frontend
│       ├── src/
│       │   ├── components/    # Komponen UI modular
│       │   ├── hooks/         # Hook akuntansi & reaktivitas
│       │   └── storage/       # Adapter IndexedDB / Local-first
│       └── public/manifest.json
├── LICENSE                    # AGPL-3.0 atau Apache-2.0
├── CONTRIBUTING.md            # Panduan berkontribusi untuk developer
└── README.md                  # Dokumentasi & Quick Start`;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-rose-950 to-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-rose-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Analisis Strategis & Teknis Komunitas
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 leading-snug">
            Apakah aplikasi ini bisa dikembangkan oleh komunitas open source?
          </h2>
          
          <div className="text-rose-100/90 text-sm sm:text-base leading-relaxed space-y-2">
            <p className="font-semibold text-rose-200 text-base sm:text-lg">
              Jawaban: <span className="underline decoration-rose-400 underline-offset-4 font-bold text-white">Sangat Bisa, dan Sangat Dibutuhkan di Indonesia!</span>
            </p>
            <p>
              Aplikasi akuntansi ini memiliki domain logic yang sangat kaya dan spesifik untuk kebutuhan 
              Koperasi Indonesia (KemenkopUKM / SAK-EP / Permenkop), seperti unit simpan pinjam, unit ritel/sembako, 
              penyusutan aset, kartu stok rata-rata bergerak, serta eliminasi konsolidasi otomatis antar unit.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pilar Mengapa Sangat Layak */}
      <div>
        <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-600" />
          4 Alasan Kuat Mengapa Proyek Ini Sangat Bernilai untuk Open Source
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs hover:border-rose-300 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Pasar Luas & Biaya Software Komersial Mahal</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Ada lebih dari 127.000 koperasi aktif dan 50.000+ BUMDes di Indonesia. Software akuntansi komersial (Accurate, Jurnal Mekari, SAP) membebankan biaya langganan jutaan rupiah per tahun per unit yang memberatkan kas desa. Open source memberikan kemandirian teknologi desa.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs hover:border-rose-300 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Kesesuaian Standar Akuntansi Koperasi (SAK ETAP / SAK EP)</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Struktur akun (Simpanan Pokok, Wajib, Sukarela, Dana Cadangan, Dana Pengurus/Pengawas, SHU Bagian Anggota) sangat khas dan jarang didukung software global tanpa kustomisasi rumit. Di aplikasi ini, perhitungannya sudah tertanam langsung.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs hover:border-rose-300 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Arsitektur Offline-First (Sangat Ramah Pedesaan)</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Banyak koperasi pelosok sering mengalami gangguan koneksi internet. Pendekatan offline-first dengan database lokal di browser (IndexedDB) memungkinkan pembukuan tetap berjalan tanpa koneksi cloud, dengan fitur backup/restore paket terenkripsi.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs hover:border-rose-300 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Ekosistem Pengembang & Mahasiswa di Indonesia</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Banyak universitas (Fakultas Ekonomi & Ilmu Komputer) serta komunitas pegiat desa mencari proyek nyata untuk KKN, tugas akhir, dan kontribusi sosial. Proyek akuntansi desa open source menjadi sarana kolaborasi akuntan dan programmer.
            </p>
          </div>
        </div>
      </div>

      {/* Perbandingan: Kode Monolitik vs Arsitektur Komunitas */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-rose-600" />
          Tantangan File Saat Ini & Cara Komunitas Mengatasinya
        </h3>
        <p className="text-xs text-neutral-500 mb-6">
          File HTML lama adalah satu berkas monolitik (~1.100 baris). Berikut adalah perbandingan sebelum dan sesudah refactoring untuk kebutuhan open source:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Lama */}
          <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Kondisi File HTML Lama</span>
              <span className="text-[11px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-semibold">Tantangan Kolaborasi</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                <span><b>Monolitik 1 Berkas:</b> Kode HTML, CSS, JavaScript, dan logo Base64 digabung jadi satu. Jika 2 programmer mengedit bersamaan di Git, akan sering terjadi merge conflict fatal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                <span><b>Variabel Singkat & Minified:</b> Menggunakan variabel seperti <code>o.M</code>, <code>r.ak</code>, <code>c.db</code>, <code>ev</code>, <code>kcols</code> yang sulit dipahami pengembang baru tanpa dokumentasi mendalam.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                <span><b>Manipulasi DOM Manual:</b> Render tabel menggunakan perulangan <code>innerHTML += '&lt;tr&gt;'</code> yang rentan bug visual dan sulit diuji otomatis (automated unit tests).</span>
              </li>
            </ul>
          </div>

          {/* Kolom Solusi Komunitas */}
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Arsitektur Modular Komunitas</span>
              <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">Standar Open Source Modern</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Modular TypeScript (Clean Architecture):</b> Memisahkan Domain Logic (rumus akuntansi murni tanpa dependensi UI), State Management, dan Komponen Tampilan (React).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Type Safety & Diriwayatkan Rapi:</b> Interface terstruktur (<code>JournalRow</code>, <code>FixedAsset</code>, <code>AccountCOA</code>) mencegah salah ketik dan memudahkan autocomplete di IDE.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Automated Testing:</b> Tes otomatis untuk memastikan jurnal selalu balance, penyusutan aset akurat, dan eliminasi transaksi antar unit tidak salah hitung sebelum di-merge ke repositori.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Blueprint Struktur Repositori Git */}
      <div className="bg-neutral-900 text-neutral-100 rounded-2xl p-6 shadow-md border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-rose-400" />
              Rekomendasi Struktur Repositori Open Source (Monorepo)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Struktur folder standar industri agar mudah dikerjakan oleh puluhan kontributor GitHub/GitLab.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(sampleRepoTree, 'tree')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium transition-colors"
          >
            {copiedSection === 'tree' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Struktur</span>
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-xs text-neutral-300 bg-neutral-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-neutral-800">
          {sampleRepoTree}
        </pre>
      </div>

      {/* Lisensi & Roadmap Pengembangan Komunitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lisensi */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-2">
              <ShieldCheck className="w-5 h-5" />
              Rekomendasi Lisensi Open Source
            </div>
            <h4 className="text-base font-bold text-neutral-900 mb-3">
              AGPL-3.0 vs Apache-2.0 / MIT
            </h4>
            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <b className="text-neutral-900 block mb-1">Pilihan 1: GNU AGPLv3 (Direkomendasikan untuk Perlindungan Komunitas)</b>
                Jika ada vendor komersial yang mengambil aplikasi ini dan menjualnya sebagai layanan Cloud (SaaS), mereka <b>wajib</b> tetap membuka kode sumber perubahannya ke publik. Ini menjaga agar karya komunitas tidak dibajak untuk monopoli.
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <b className="text-neutral-900 block mb-1">Pilihan 2: Apache-2.0 / MIT (Direkomendasikan untuk Adopsi Maksimal)</b>
                Sangat permisif. Dinas Koperasi tingkat kabupaten/kota atau BUMDes bebas memasang, mengintegrasikan, dan memodifikasi tanpa hambatan legal apa pun.
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm mb-3">
            <GitBranch className="w-5 h-5 text-rose-600" />
            Roadmap Pengembangan Komunitas (5 Fase)
          </div>
          
          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
                F1
              </div>
              <div>
                <b className="text-neutral-900 block">Modernisasi & Modularisasi (Selesai pada aplikasi ini)</b>
                <span className="text-neutral-500">Migrasi dari HTML tunggal ke React, TypeScript, dan Tailwind dengan pemisahan komponen.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
                F2
              </div>
              <div>
                <b className="text-neutral-900 block">PWA Installable & Offline Sync</b>
                <span className="text-neutral-500">Bisa diinstal sebagai aplikasi desktop/ponsel tanpa perlu koneksi internet, dengan sinkronisasi peer-to-peer antar bendahara.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
                F3
              </div>
              <div>
                <b className="text-neutral-900 block">Modul POS Kasir & Simpan Pinjam Anggota</b>
                <span className="text-neutral-500">Pencatatan kasir toko ritel sembako dan cetak kartu angsuran pinjaman anggota secara langsung.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
                F4
              </div>
              <div>
                <b className="text-neutral-900 block">Format Laporan RAT KemenkopUKM Siap Cetak</b>
                <span className="text-neutral-500">Penyesuaian template laporan pertanggungjawaban Rapat Anggota Tahunan (RAT) otomatis sesuai regulasi kementerian.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
                F5
              </div>
              <div>
                <b className="text-neutral-900 block">Dukungan Multi-Tenant & Server Opsional</b>
                <span className="text-neutral-500">Opsi hosting mandiri bagi dinas kabupaten untuk memantau puluhan koperasi kalurahan dalam satu dashboard terintegrasi.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Langkah Praktis Memulai */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
        <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-700" />
          Langkah Praktis Memulai Inisiatif Open Source:
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-700">
          <li><b>Unggah ke GitHub / GitLab:</b> Buat organisasi baru (misal: <code>open-koperasi</code> atau <code>kdmp-community</code>).</li>
          <li><b>Pilih Lisensi:</b> Sematkan berkas <code>LICENSE</code> (AGPL-3.0 atau Apache 2.0).</li>
          <li><b>Tulis <code>CONTRIBUTING.md</code>:</b> Jelaskan cara memasang proyek lokal (<code>git clone</code>, <code>npm install</code>, <code>npm run dev</code>).</li>
          <li><b>Ajak Akademisi & Praktisi:</b> Gandeng dosen akuntansi & komunitas developer daerah untuk memvalidasi rumus serta membuat template bagan akun (COA).</li>
        </ol>
      </div>
    </div>
  );
};
