import React from 'react';
import { AccountCOA, CalculatedBalances, CooperativeProfile } from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TrialBalanceViewProps {
  balances: CalculatedBalances;
  coa: AccountCOA[];
  periodMonth: number;
  periodYear: number;
  profile: CooperativeProfile;
}

export const TrialBalanceView: React.FC<TrialBalanceViewProps> = ({
  balances,
  coa,
  periodMonth,
  periodYear,
  profile
}) => {
  let totalDebitCol = 0;
  let totalCreditCol = 0;

  // Filter accounts that have accumulated balance or transactions
  const activeAccounts = coa.filter(a => {
    const cVal = balances.cum[a.code];
    const drVal = balances.dr[a.code];
    const krVal = balances.kr[a.code];
    return cVal !== undefined || drVal !== undefined || krVal !== undefined;
  });

  activeAccounts.forEach(a => {
    const dVal = balances.dr[a.code] || 0;
    const kVal = balances.kr[a.code] || 0;
    totalDebitCol += dVal;
    totalCreditCol += kVal;
  });

  const isBalanced = Math.abs(totalDebitCol - totalCreditCol) < 0.5;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs text-center">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
          {profile.name} &bull; {profile.village}
        </h2>
        <h1 className="text-lg font-extrabold text-neutral-900 mt-0.5">
          NERACA SALDO (TRIAL BALANCE)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Per {MONTH_NAMES[periodMonth - 1]} {periodYear} (dalam Rupiah)
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
          {isBalanced ? (
            <span className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5 px-3 py-0.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Neraca Saldo Seimbang (Balance)
            </span>
          ) : (
            <span className="text-rose-700 bg-rose-50 border-rose-200 flex items-center gap-1.5 px-3 py-0.5 rounded-full">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Terdapat Selisih: Rp {formatRupiah(totalDebitCol - totalCreditCol)}
            </span>
          )}
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-rose-900 text-white font-semibold">
                <th className="py-2.5 px-3 w-28">Kode Akun</th>
                <th className="py-2.5 px-3">Nama Akun</th>
                <th className="py-2.5 px-3 w-32 text-right">Debit (Rp)</th>
                <th className="py-2.5 px-3 w-32 text-right">Kredit (Rp)</th>
                <th className="py-2.5 px-3 w-36 text-right">Saldo Akhir (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {activeAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-sans">
                    Belum ada akun yang memiliki saldo atau mutasi pada periode ini.
                  </td>
                </tr>
              ) : (
                activeAccounts.map(a => {
                  const dVal = balances.dr[a.code] || 0;
                  const kVal = balances.kr[a.code] || 0;
                  const cVal = balances.cum[a.code] || 0;

                  return (
                    <tr key={a.code} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-2 px-3 text-neutral-700 font-bold">{a.code}</td>
                      <td className="py-2 px-3 text-neutral-900 font-sans">{a.name}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">
                        {dVal ? formatRupiah(dVal) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-800">
                        {kVal ? formatRupiah(kVal) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">
                        {formatRupiah(cVal)} <span className="text-[10px] text-neutral-500 font-sans">{a.normal === 'Debit' ? 'D' : 'K'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 text-neutral-900 font-bold border-t-2 border-neutral-300">
                <td colSpan={2} className="py-3 px-3 text-right font-sans uppercase">
                  Jumlah Total:
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatRupiah(totalDebitCol)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatRupiah(totalCreditCol)}
                </td>
                <td className="py-3 px-3 text-right font-sans text-xs text-neutral-500">
                  {isBalanced ? 'Seimbang' : 'Tidak Seimbang'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
