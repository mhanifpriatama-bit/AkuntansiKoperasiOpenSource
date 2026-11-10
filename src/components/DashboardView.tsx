import React from 'react';
import { 
  CalculatedBalances, 
  CooperativeProfile, 
  JournalRow, 
  UnitType 
} from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { 
  Wallet, 
  TrendingUp, 
  Landmark, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TabKey } from './Navigation';

interface DashboardViewProps {
  activeUnit: UnitType;
  periodMonth: number;
  periodYear: number;
  balances: CalculatedBalances;
  uspBalances: CalculatedBalances;
  sembakoBalances: CalculatedBalances;
  profile: CooperativeProfile;
  recentRows: JournalRow[];
  onNavigate: (tab: TabKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeUnit,
  periodMonth,
  periodYear,
  balances,
  uspBalances,
  sembakoBalances,
  profile,
  recentRows,
  onNavigate
}) => {
  // Compute cash & bank total
  const cashAccounts = Object.keys(balances.cum).filter(c => c.startsWith('1.1.1.'));
  const totalCash = cashAccounts.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);

  // Total assets (accounts 1.x)
  const totalAssets = Object.keys(balances.cum)
    .filter(c => c.startsWith('1.'))
    .reduce((sum, c) => {
      // If accumulated depreciation, it is a credit contra account, reducing assets
      if (c.startsWith('1.3.9.') || c.startsWith('1.1.3.')) {
        return sum - Math.abs(balances.cum[c] || 0);
      }
      return sum + (balances.cum[c] || 0);
    }, 0);

  // Revenue accounts (4.x and 9.1.x)
  const totalRevenue = Object.keys(balances.cum)
    .filter(c => c.startsWith('4.') || c.startsWith('9.1.'))
    .reduce((sum, c) => sum + (balances.cum[c] || 0), 0);

  // Net Income SHU YTD
  const shuYtd = balances.shuTotal;
  const isBalanced = Math.abs(balances.totalDebit - balances.totalCredit) < 0.5;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Summary */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h2 className="text-lg font-bold text-neutral-900">
                Ringkasan Keuangan {activeUnit === 'USP' ? 'Unit Simpan Pinjam' : activeUnit === 'Sembako' ? 'Unit Sembako & Gas' : 'Konsolidasi Seluruh Unit'}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Periode: {MONTH_NAMES[periodMonth - 1]} {periodYear} &bull; {profile.name} ({profile.village})
            </p>
          </div>

          <button
            onClick={() => onNavigate('blueprint')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 hover:border-rose-300 text-rose-800 text-xs font-semibold transition-all group"
          >
            <Sparkles className="w-4 h-4 text-rose-600 group-hover:rotate-12 transition-transform" />
            <span>Lihat Blueprint Open Source Komunitas</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Total Kas & Bank */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold">Kas & Setara Kas</span>
              <div className="p-2 bg-blue-100/70 text-blue-700 rounded-lg">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              Rp {formatRupiah(totalCash, false)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Kas tunai, bank BPD & bank BRI
            </div>
          </div>

          {/* Total Aset */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold">Total Aset (Aktiva)</span>
              <div className="p-2 bg-emerald-100/70 text-emerald-700 rounded-lg">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              Rp {formatRupiah(totalAssets, false)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Aset lancar, piutang, stok & inventaris
            </div>
          </div>

          {/* Pendapatan YTD */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold">Pendapatan Usaha YTD</span>
              <div className="p-2 bg-amber-100/70 text-amber-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              Rp {formatRupiah(totalRevenue, false)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              s.d. bulan {MONTH_NAMES[periodMonth - 1]}
            </div>
          </div>

          {/* Sisa Hasil Usaha (SHU) */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold">Sisa Hasil Usaha (SHU)</span>
              <div className={`p-2 rounded-lg ${shuYtd >= 0 ? 'bg-emerald-100/70 text-emerald-700' : 'bg-rose-100/70 text-rose-700'}`}>
                {shuYtd >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className={`text-xl font-bold ${shuYtd >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              Rp {formatRupiah(shuYtd, false)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Laba bersih berjalan tahun {periodYear}
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Overview between USP and Sembako */}
      {activeUnit === 'KONSOL' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-700" />
            Perbandingan Kinerja Antar Unit (USP vs Sembako)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* USP Card */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
              <div className="flex items-center justify-between font-bold text-rose-900 text-sm mb-3">
                <span>Unit Simpan Pinjam (USP)</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px]">Jasa Keuangan</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Kredit Anggota:</span>
                  <span className="font-semibold text-neutral-900">Rp {formatRupiah(uspBalances.cum['1.1.2.06'] || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Simpanan Anggota:</span>
                  <span className="font-semibold text-neutral-900">Rp {formatRupiah(uspBalances.cum['2.1.1.04'] || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">SHU Berjalan USP:</span>
                  <span className="font-bold text-emerald-700">Rp {formatRupiah(uspBalances.shuTotal)}</span>
                </div>
              </div>
            </div>

            {/* Sembako Card */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <div className="flex items-center justify-between font-bold text-emerald-900 text-sm mb-3">
                <span>Unit Sembako, Pupuk & Gas</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">Ritel & Distribusi</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Persediaan Dagangan:</span>
                  <span className="font-semibold text-neutral-900">
                    Rp {formatRupiah((sembakoBalances.cum['1.1.4.02'] || 0) + (sembakoBalances.cum['1.1.4.03'] || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Penjualan Dagangan:</span>
                  <span className="font-semibold text-neutral-900">Rp {formatRupiah(sembakoBalances.cum['4.1.1.01'] || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">SHU Berjalan Sembako:</span>
                  <span className="font-bold text-emerald-700">Rp {formatRupiah(sembakoBalances.shuTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Journal Transactions & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Transaksi Jurnal Terkini ({activeUnit})
            </h3>
            <button
              onClick={() => onNavigate('journal')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800"
            >
              Buka Jurnal Lengkap &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 bg-neutral-50/50">
                  <th className="py-2 px-3 font-semibold">Tgl</th>
                  <th className="py-2 px-3 font-semibold">No Bukti</th>
                  <th className="py-2 px-3 font-semibold">Akun</th>
                  <th className="py-2 px-3 font-semibold text-right">Debit</th>
                  <th className="py-2 px-3 font-semibold text-right">Kredit</th>
                  <th className="py-2 px-3 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentRows.slice(0, 6).map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-neutral-50/50">
                    <td className="py-2 px-3 text-neutral-600 whitespace-nowrap">{r.d}</td>
                    <td className="py-2 px-3 font-mono font-medium text-neutral-700">{r.no}</td>
                    <td className="py-2 px-3 text-neutral-900 font-medium">{r.ak}</td>
                    <td className="py-2 px-3 text-right font-mono text-neutral-800">
                      {r.db ? formatRupiah(r.db) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-neutral-800">
                      {r.kr ? formatRupiah(r.kr) : '-'}
                    </td>
                    <td className="py-2 px-3 text-neutral-500 max-w-[200px] truncate">{r.ket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Audit & Health Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">
            Status Audit & Kepatuhan
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <span className="text-xs text-neutral-600">Keseimbangan Debit/Kredit</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {isBalanced ? 'Balance 100%' : 'Selisih'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <span className="text-xs text-neutral-600">Standar Akuntansi</span>
              <span className="text-xs font-bold text-neutral-800">
                Permenkop / SAK-EP
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <span className="text-xs text-neutral-600">Mode Penyimpanan</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Offline-First (Aman)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-700 mb-2">Tautan Cepat Laporan:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('trialBalance')}
                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-left"
              >
                &bull; Neraca Saldo
              </button>
              <button
                onClick={() => onNavigate('profitLoss')}
                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-left"
              >
                &bull; Laba Rugi
              </button>
              <button
                onClick={() => onNavigate('balanceSheet')}
                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-left"
              >
                &bull; Neraca Keuangan
              </button>
              <button
                onClick={() => onNavigate('cashFlow')}
                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-left"
              >
                &bull; Arus Kas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
