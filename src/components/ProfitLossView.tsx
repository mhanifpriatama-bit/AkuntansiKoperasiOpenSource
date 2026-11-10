import React from 'react';
import { AccountCOA, CalculatedBalances, CooperativeProfile, UnitType } from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { TrendingUp } from 'lucide-react';

interface ProfitLossViewProps {
  balances: CalculatedBalances;
  coa: AccountCOA[];
  activeUnit: UnitType;
  periodMonth: number;
  periodYear: number;
  profile: CooperativeProfile;
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({
  balances,
  coa,
  activeUnit,
  periodMonth,
  periodYear,
  profile
}) => {
  // Helper to get account name
  const getName = (code: string) => (coa.find(a => a.code === code)?.name || '');

  // Helper to extract list of accounts
  const getSubtotal = (codes: string[], map: Record<string, number>) => {
    return codes.reduce((sum, c) => sum + (map[c] || 0), 0);
  };

  // Group accounts
  // Revenues: 4.x and 9.1.x
  const revenueCodes = Object.keys(balances.cum).filter(c => c.startsWith('4.'));
  const hppCodes = Object.keys(balances.cum).filter(c => c.startsWith('5.'));
  const expenseCodes = Object.keys(balances.cum).filter(c => c.startsWith('6.'));
  const otherRevenueCodes = Object.keys(balances.cum).filter(c => c.startsWith('9.1.'));
  const otherExpenseCodes = Object.keys(balances.cum).filter(c => c.startsWith('9.2.'));
  const taxCodes = Object.keys(balances.cum).filter(c => c.startsWith('9.3.'));

  // Totals for Month
  const revMonth = getSubtotal(revenueCodes, balances.mon);
  const hppMonth = getSubtotal(hppCodes, balances.mon);
  const grossProfitMonth = revMonth - hppMonth;
  const expMonth = getSubtotal(expenseCodes, balances.mon);
  const opIncomeMonth = grossProfitMonth - expMonth;
  const otherRevMonth = getSubtotal(otherRevenueCodes, balances.mon);
  const otherExpMonth = getSubtotal(otherExpenseCodes, balances.mon);
  const taxMonth = getSubtotal(taxCodes, balances.mon);
  const netShuMonth = opIncomeMonth + otherRevMonth - otherExpMonth - taxMonth;

  // Totals for YTD
  const revYtd = getSubtotal(revenueCodes, balances.cum);
  const hppYtd = getSubtotal(hppCodes, balances.cum);
  const grossProfitYtd = revYtd - hppYtd;
  const expYtd = getSubtotal(expenseCodes, balances.cum);
  const opIncomeYtd = grossProfitYtd - expYtd;
  const otherRevYtd = getSubtotal(otherRevenueCodes, balances.cum);
  const otherExpYtd = getSubtotal(otherExpenseCodes, balances.cum);
  const taxYtd = getSubtotal(taxCodes, balances.cum);
  const netShuYtd = opIncomeYtd + otherRevYtd - otherExpYtd - taxYtd;

  const renderSection = (
    title: string,
    codes: string[],
    subtotalMonth: number,
    subtotalYtd: number,
    subtotalLabel: string
  ) => {
    return (
      <>
        <tr className="bg-rose-50/80 font-bold text-rose-900 border-t border-rose-200">
          <td colSpan={2} className="py-2 px-3">{title}</td>
          <td className="py-2 px-3 text-right"></td>
          <td className="py-2 px-3 text-right"></td>
        </tr>
        {codes.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-2 px-6 text-neutral-400 italic">
              Tidak ada akun transaksi pada kelompok ini
            </td>
          </tr>
        ) : (
          codes.map(c => {
            const mVal = balances.mon[c] || 0;
            const yVal = balances.cum[c] || 0;
            return (
              <tr key={c} className="hover:bg-neutral-50/60 transition-colors">
                <td className="py-1.5 px-3 w-28 text-neutral-500 font-mono text-[11px]">{c}</td>
                <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                <td className="py-1.5 px-3 text-right font-mono text-neutral-800">{formatRupiah(mVal)}</td>
                <td className="py-1.5 px-3 text-right font-mono text-neutral-800">{formatRupiah(yVal)}</td>
              </tr>
            );
          })
        )}
        <tr className="bg-neutral-100/70 font-semibold text-neutral-900 border-t border-neutral-200">
          <td colSpan={2} className="py-2 px-3 text-right">{subtotalLabel}:</td>
          <td className="py-2 px-3 text-right font-mono">{formatRupiah(subtotalMonth)}</td>
          <td className="py-2 px-3 text-right font-mono">{formatRupiah(subtotalYtd)}</td>
        </tr>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs text-center">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
          {profile.name} &bull; {profile.village}
        </h2>
        <h1 className="text-lg font-extrabold text-neutral-900 mt-0.5">
          LAPORAN LABA RUGI (HASIL USAHA)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {activeUnit === 'USP' ? 'Unit Simpan Pinjam' : activeUnit === 'Sembako' ? 'Unit Sembako, Pupuk & Gas' : 'Konsolidasi Seluruh Unit'} &bull; Periode Berakhir s.d. {MONTH_NAMES[periodMonth - 1]} {periodYear}
        </p>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-rose-900 text-white font-semibold">
                <th className="py-2.5 px-3 w-28">Kode Akun</th>
                <th className="py-2.5 px-3">Uraian Akun</th>
                <th className="py-2.5 px-3 w-36 text-right">Bulan Ini ({MONTH_NAMES[periodMonth - 1]})</th>
                <th className="py-2.5 px-3 w-36 text-right">s.d. Bulan Ini (YTD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {/* Pendapatan */}
              {renderSection('I. PENDAPATAN USAHA', revenueCodes, revMonth, revYtd, 'Total Pendapatan Usaha')}

              {/* HPP (if any, like toko sembako) */}
              {hppCodes.length > 0 && (
                <>
                  {renderSection('II. HARGA POKOK PENJUALAN', hppCodes, hppMonth, hppYtd, 'Total HPP')}
                  <tr className="bg-amber-50/70 font-bold text-amber-950 border-t-2 border-amber-200">
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase">Laba (Rugi) Kotor:</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(grossProfitMonth)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(grossProfitYtd)}</td>
                  </tr>
                </>
              )}

              {/* Beban Usaha */}
              {renderSection('III. BEBAN-BEBAN USAHA & OPERASIONAL', expenseCodes, expMonth, expYtd, 'Total Beban Usaha')}

              {/* Laba Operasi */}
              <tr className="bg-neutral-100 font-bold text-neutral-900 border-t-2 border-neutral-300">
                <td colSpan={2} className="py-2.5 px-3 text-right uppercase">Laba (Rugi) Operasi:</td>
                <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(opIncomeMonth)}</td>
                <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(opIncomeYtd)}</td>
              </tr>

              {/* Pendapatan & Beban Lain */}
              {(otherRevenueCodes.length > 0 || otherExpenseCodes.length > 0) && (
                <>
                  {renderSection('IV. PENDAPATAN LAIN-LAIN', otherRevenueCodes, otherRevMonth, otherRevYtd, 'Total Pendapatan Lain')}
                  {renderSection('V. BEBAN LAIN-LAIN', otherExpenseCodes, otherExpMonth, otherExpYtd, 'Total Beban Lain')}
                </>
              )}

              {/* Pajak */}
              {taxCodes.length > 0 && renderSection('VI. BEBAN PAJAK', taxCodes, taxMonth, taxYtd, 'Total Beban Pajak')}

              {/* SISA HASIL USAHA BERSIH */}
              <tr className="bg-rose-950 text-white font-extrabold text-sm border-t-4 border-rose-700">
                <td colSpan={2} className="py-3 px-4 uppercase tracking-wide">
                  SISA HASIL USAHA (SHU) BERSIH:
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-300">
                  {formatRupiah(netShuMonth)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-300">
                  {formatRupiah(netShuYtd)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
