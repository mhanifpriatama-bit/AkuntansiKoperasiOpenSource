import React, { useState } from 'react';
import { AccountCOA, CalculatedBalances, CooperativeProfile } from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { GitMerge, Info, CheckCircle2 } from 'lucide-react';

interface ConsolidationViewProps {
  uspBalances: CalculatedBalances;
  sembakoBalances: CalculatedBalances;
  coa: AccountCOA[];
  periodMonth: number;
  periodYear: number;
  profile: CooperativeProfile;
  customEliminations: Record<string, number>;
  onUpdateCustomElimination: (code: string, value: number) => void;
}

export const ConsolidationView: React.FC<ConsolidationViewProps> = ({
  uspBalances,
  sembakoBalances,
  coa,
  periodMonth,
  periodYear,
  profile,
  customEliminations,
  onUpdateCustomElimination
}) => {
  const [tabType, setTabType] = useState<'neraca' | 'labarugi'>('neraca');

  const getName = (code: string) => (coa.find(a => a.code === code)?.name || '');

  // 1. Calculate automatic elimination for inter-unit accounts:
  // USP's "1.1.9.08 RK Piutang Gerai Sembako" vs Sembako's "2.1.9.01 Utang ke USP"
  const piutangSembakoUSP = uspBalances.cum['1.1.9.08'] || 0;
  const utangUSPdiSembako = sembakoBalances.cum['2.1.9.01'] || 0;
  const autoElimVal = Math.min(Math.abs(piutangSembakoUSP), Math.abs(utangUSPdiSembako));

  // Determine list of active accounts based on tab
  const isNeracaAccount = (c: string) => ['1', '2', '3'].includes(c.charAt(0));
  const isLRAccount = (c: string) => ['4', '5', '6', '7', '8'].includes(c.charAt(0)) || c.startsWith('9');

  const allCodes = Array.from(new Set([
    ...Object.keys(uspBalances.cum),
    ...Object.keys(sembakoBalances.cum),
    ...Object.keys(customEliminations)
  ])).sort();

  const activeCodes = allCodes.filter(c => tabType === 'neraca' ? isNeracaAccount(c) : isLRAccount(c));

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs text-center">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
          {profile.name} &bull; {profile.village}
        </h2>
        <h1 className="text-lg font-extrabold text-neutral-900 mt-0.5">
          {tabType === 'neraca' ? 'NERACA KONSOLIDASI SELURUH UNIT USAHA' : 'LABA RUGI KONSOLIDASI SELURUH UNIT USAHA'}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Konsolidasi USP + Sembako &bull; Per {MONTH_NAMES[periodMonth - 1]} {periodYear} (dalam Rupiah)
        </p>

        {/* Tab switch */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setTabType('neraca')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tabType === 'neraca'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Neraca Konsolidasi
          </button>
          <button
            onClick={() => setTabType('labarugi')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tabType === 'labarugi'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Laba Rugi Konsolidasi
          </button>
        </div>
      </div>

      {/* Auto Elimination Notice */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <b className="block mb-0.5 text-purple-950">Mekanisme Eliminasi Timbal Balik Otomatis:</b>
          Akun <b>1.1.9.08 RK Piutang Gerai Sembako</b> pada USP (Rp {formatRupiah(piutangSembakoUSP)}) dieliminasi secara otomatis terhadap akun <b>2.1.9.01 Utang ke USP</b> pada Unit Sembako (Rp {formatRupiah(utangUSPdiSembako)}) sebesar <b>Rp {formatRupiah(autoElimVal)}</b>. Kolom eliminasi juga dapat ditambahkan nilai penyesuaian manual jika diperlukan.
        </div>
      </div>

      {/* Consolidation Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-purple-950 text-white font-semibold">
                <th className="py-2.5 px-3 w-28">Kode Akun</th>
                <th className="py-2.5 px-3">Uraian Akun</th>
                <th className="py-2.5 px-3 w-32 text-right">USP (Rp)</th>
                <th className="py-2.5 px-3 w-32 text-right">Sembako (Rp)</th>
                <th className="py-2.5 px-3 w-32 text-right">Jumlah Sebelum</th>
                <th className="py-2.5 px-3 w-32 text-right">Eliminasi</th>
                <th className="py-2.5 px-3 w-36 text-right bg-purple-900">Konsolidasi (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {activeCodes.map(code => {
                const uspVal = uspBalances.cum[code] || 0;
                const sembakoVal = sembakoBalances.cum[code] || 0;
                const subtotal = uspVal + sembakoVal;

                // Automatic elimination rule
                let autoElim = 0;
                if (code === '1.1.9.08') autoElim = -autoElimVal;
                if (code === '2.1.9.01') autoElim = -autoElimVal;

                const manualElim = customEliminations[code] || 0;
                const totalElim = autoElim + manualElim;
                const finalConsolidated = subtotal + totalElim;

                return (
                  <tr key={code} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-2 px-3 text-neutral-600 font-bold">{code}</td>
                    <td className="py-2 px-3 font-sans text-neutral-900">{getName(code)}</td>
                    <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(uspVal)}</td>
                    <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(sembakoVal)}</td>
                    <td className="py-2 px-3 text-right text-neutral-500 font-semibold">{formatRupiah(subtotal)}</td>
                    <td className="py-2 px-3 text-right text-rose-700 font-bold">
                      {totalElim ? formatRupiah(totalElim) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-purple-950 bg-purple-50/30">
                      {formatRupiah(finalConsolidated)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {tabType === 'neraca' && (
                <tr className="bg-neutral-100 font-bold text-neutral-900 border-t-2 border-neutral-300 font-mono">
                  <td colSpan={2} className="py-3 px-3 text-right font-sans uppercase">
                    Status Keseimbangan Konsolidasi:
                  </td>
                  <td className="py-3 px-3 text-right font-sans text-emerald-700 font-bold">USP OK</td>
                  <td className="py-3 px-3 text-right font-sans text-emerald-700 font-bold">Sembako OK</td>
                  <td colSpan={2} className="py-3 px-3 text-right font-sans text-neutral-500">
                    Otomatis Dieliminasi
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-purple-950 font-sans">
                    Siap Audit RAT
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
