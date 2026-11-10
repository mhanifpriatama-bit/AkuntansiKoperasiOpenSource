import React from 'react';
import { CalculatedBalances, CooperativeProfile, UnitType } from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { CheckCircle2, AlertTriangle, Coins } from 'lucide-react';

interface CashFlowViewProps {
  balances: CalculatedBalances;
  activeUnit: UnitType;
  periodMonth: number;
  periodYear: number;
  profile: CooperativeProfile;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  balances,
  activeUnit,
  periodMonth,
  periodYear,
  profile
}) => {
  const k = balances.kom || {};

  // 1. Aktivitas Operasi
  const opIn1 = k['Penerimaan Kas dari Pelayanan kepada Anggota'] || 0;
  const opIn2 = k['Penerimaan Kas dari Non Anggota'] || 0;
  const opIn3 = k['Penerimaan Pendapatan Lain-lain'] || 0;
  const totalOpIn = opIn1 + opIn2 + opIn3;

  const opOut1 = k['Pembelian Harga Pokok Barang'] || 0;
  const opOut2 = k['Pembayaran Beban Administrasi'] || 0;
  const opOut3 = k['Pembayaran Beban Pemasaran'] || 0;
  const opOut4 = k['Pengeluaran Beban Lain-lain'] || 0;
  const opOut5 = k['Pembayaran Beban Telepon'] || 0;
  const opOut6 = k['Pembayaran Pajak'] || 0;
  const totalOpOut = opOut1 + opOut2 + opOut3 + opOut4 + opOut5 + opOut6;

  const netOperatingCash = totalOpIn - totalOpOut;

  // 2. Aktivitas Investasi
  const invIn1 = k['Penjualan Aset Tetap'] || 0;
  const invIn2 = k['Penjualan Investasi'] || 0;
  const totalInvIn = invIn1 + invIn2;

  const invOut1 = k['Pembelian Aset Tetap'] || 0;
  const invOut2 = k['Pengeluaran Investasi'] || 0;
  const totalInvOut = invOut1 + invOut2;

  const netInvestingCash = totalInvIn - totalInvOut;

  // 3. Aktivitas Pendanaan
  const finIn1 = k['Simpanan Anggota'] || 0;
  const finIn2 = k['Simpanan Lainnya'] || 0;
  const finIn3 = k['Hibah'] || 0;
  const finIn4 = k['Pinjaman Jangka Panjang'] || 0;
  const finIn5 = k['Pinjaman Jangka Pendek'] || 0;
  const totalFinIn = finIn1 + finIn2 + finIn3 + finIn4 + finIn5;

  const finOut1 = k['Pembayaran Pinjaman Jangka Panjang'] || 0;
  const finOut2 = k['Pembayaran Pinjaman Jangka Pendek'] || 0;
  const finOut3 = k['Pembagian SHU'] || 0;
  const totalFinOut = finOut1 + finOut2 + finOut3;

  const netFinancingCash = totalFinIn - totalFinOut;

  // Totals
  const netChangeInCash = netOperatingCash + netInvestingCash + netFinancingCash;
  const openingCash = balances.openCash || 0;
  const closingCashCalculated = openingCash + netChangeInCash;

  // Physical cash and bank in balance sheet
  const cashAccounts = Object.keys(balances.cum).filter(c => c.startsWith('1.1.1.'));
  const physicalCashBalanceSheet = cashAccounts.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const selisih = Math.round(closingCashCalculated - physicalCashBalanceSheet);
  const isMatch = Math.abs(selisih) === 0;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs text-center">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
          {profile.name} &bull; {profile.village}
        </h2>
        <h1 className="text-lg font-extrabold text-neutral-900 mt-0.5">
          LAPORAN ARUS KAS (METODE LANGSUNG)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {activeUnit === 'USP' ? 'Unit Simpan Pinjam' : activeUnit === 'Sembako' ? 'Unit Sembako, Pupuk & Gas' : 'Konsolidasi Seluruh Unit'} &bull; Periode s.d. {MONTH_NAMES[periodMonth - 1]} {periodYear}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
          {isMatch ? (
            <span className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5 px-3 py-0.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sesuai dengan Total Kas di Neraca (Rp {formatRupiah(physicalCashBalanceSheet)})
            </span>
          ) : (
            <span className="text-rose-700 bg-rose-50 border-rose-200 flex items-center gap-1.5 px-3 py-0.5 rounded-full">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Selisih terhadap Kas di Neraca: Rp {formatRupiah(selisih)} (periksa komponen arus kas jurnal)
            </span>
          )}
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-rose-900 text-white font-semibold">
                <th className="py-2.5 px-4">Uraian Arus Kas</th>
                <th className="py-2.5 px-4 w-48 text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {/* OPERASI */}
              <tr className="bg-rose-50/70 font-bold text-rose-900">
                <td colSpan={2} className="py-2 px-4 uppercase">I. Arus Kas dari Aktivitas Operasi</td>
              </tr>
              <tr className="font-semibold text-neutral-700 bg-neutral-50/40">
                <td className="py-1.5 px-6">Arus Kas Masuk:</td>
                <td></td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Penerimaan Kas dari Pelayanan kepada Anggota</td>
                <td className="py-1 px-4 text-right font-mono">{formatRupiah(opIn1)}</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Penerimaan Kas dari Non Anggota</td>
                <td className="py-1 px-4 text-right font-mono">{formatRupiah(opIn2)}</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Penerimaan Pendapatan Lain-lain</td>
                <td className="py-1 px-4 text-right font-mono">{formatRupiah(opIn3)}</td>
              </tr>
              <tr className="bg-neutral-100/60 font-medium text-neutral-800">
                <td className="py-1.5 px-8">Jumlah Arus Kas Masuk Operasi:</td>
                <td className="py-1.5 px-4 text-right font-mono font-semibold">{formatRupiah(totalOpIn)}</td>
              </tr>

              <tr className="font-semibold text-neutral-700 bg-neutral-50/40">
                <td className="py-1.5 px-6">Arus Kas Keluar:</td>
                <td></td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembelian Harga Pokok Barang / Persediaan</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(opOut1)})</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembayaran Beban Administrasi & Umum</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(opOut2)})</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembayaran Beban Pemasaran</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(opOut3)})</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembayaran Beban Listrik, Telepon & Utilitas</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(opOut5)})</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembayaran Pajak</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(opOut6)})</td>
              </tr>
              <tr className="bg-neutral-100/60 font-medium text-neutral-800">
                <td className="py-1.5 px-8">Jumlah Arus Kas Keluar Operasi:</td>
                <td className="py-1.5 px-4 text-right font-mono font-semibold">({formatRupiah(totalOpOut)})</td>
              </tr>
              <tr className="bg-neutral-100 font-bold text-neutral-900 border-t border-neutral-300">
                <td className="py-2 px-6">Arus Kas Bersih dari Aktivitas Operasi:</td>
                <td className="py-2 px-4 text-right font-mono">{formatRupiah(netOperatingCash)}</td>
              </tr>

              {/* INVESTASI */}
              <tr className="bg-rose-50/70 font-bold text-rose-900 border-t-2 border-rose-200">
                <td colSpan={2} className="py-2 px-4 uppercase">II. Arus Kas dari Aktivitas Investasi</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Penjualan Aset Tetap</td>
                <td className="py-1 px-4 text-right font-mono">{formatRupiah(invIn1)}</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembelian Aset Tetap</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(invOut1)})</td>
              </tr>
              <tr className="bg-neutral-100 font-bold text-neutral-900 border-t border-neutral-300">
                <td className="py-2 px-6">Arus Kas Bersih dari Aktivitas Investasi:</td>
                <td className="py-2 px-4 text-right font-mono">{formatRupiah(netInvestingCash)}</td>
              </tr>

              {/* PENDANAAN */}
              <tr className="bg-rose-50/70 font-bold text-rose-900 border-t-2 border-rose-200">
                <td colSpan={2} className="py-2 px-4 uppercase">III. Arus Kas dari Aktivitas Pendanaan</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Penerimaan Simpanan Anggota (Pokok/Wajib/Sukarela)</td>
                <td className="py-1 px-4 text-right font-mono">{formatRupiah(finIn1)}</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Penerimaan Hibah / Modal Tambahan</td>
                <td className="py-1 px-4 text-right font-mono">{formatRupiah(finIn3)}</td>
              </tr>
              <tr className="hover:bg-neutral-50/50">
                <td className="py-1 px-8 text-neutral-600">Pembayaran Pinjaman / Bagi Hasil SHU</td>
                <td className="py-1 px-4 text-right font-mono">({formatRupiah(finOut1 + finOut3)})</td>
              </tr>
              <tr className="bg-neutral-100 font-bold text-neutral-900 border-t border-neutral-300">
                <td className="py-2 px-6">Arus Kas Bersih dari Aktivitas Pendanaan:</td>
                <td className="py-2 px-4 text-right font-mono">{formatRupiah(netFinancingCash)}</td>
              </tr>

              {/* TOTAL KENAIKAN & SALDO */}
              <tr className="bg-neutral-800 text-white font-bold border-t-2 border-neutral-900">
                <td className="py-2.5 px-4 uppercase tracking-wide">Kenaikan (Penurunan) Kas Bersih:</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatRupiah(netChangeInCash)}</td>
              </tr>
              <tr className="bg-neutral-50 font-semibold text-neutral-800">
                <td className="py-2 px-4">Saldo Kas dan Bank Awal Periode:</td>
                <td className="py-2 px-4 text-right font-mono">{formatRupiah(openingCash)}</td>
              </tr>
              <tr className="bg-rose-950 text-white font-extrabold text-sm border-t-2 border-rose-700">
                <td className="py-3 px-4 uppercase tracking-wide">Saldo Kas dan Bank Akhir Periode:</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-300">
                  Rp {formatRupiah(closingCashCalculated, false)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
