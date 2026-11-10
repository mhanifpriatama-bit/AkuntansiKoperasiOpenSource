import React from 'react';
import { AccountCOA, CalculatedBalances, CooperativeProfile, UnitType } from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { CheckCircle2, AlertTriangle, Landmark } from 'lucide-react';

interface BalanceSheetViewProps {
  balances: CalculatedBalances;
  coa: AccountCOA[];
  activeUnit: UnitType;
  periodMonth: number;
  periodYear: number;
  profile: CooperativeProfile;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({
  balances,
  coa,
  activeUnit,
  periodMonth,
  periodYear,
  profile
}) => {
  const getName = (code: string) => (coa.find(a => a.code === code)?.name || '');

  // ASET LANCAR: 1.1.x
  const currentAssetCodes = Object.keys(balances.cum).filter(c => c.startsWith('1.1.'));
  // ASET TETAP: 1.3.x (except 1.3.9.x accum)
  const fixedAssetCodes = Object.keys(balances.cum).filter(c => c.startsWith('1.3.') && !c.startsWith('1.3.9.'));
  // AKUMULASI PENYUSUTAN: 1.3.9.x
  const accumDeprecCodes = Object.keys(balances.cum).filter(c => c.startsWith('1.3.9.'));
  // ASET LAINNYA: 1.2.x, 1.4.x, 1.5.x, 1.9.x
  const otherAssetCodes = Object.keys(balances.cum).filter(c => 
    c.startsWith('1.2.') || c.startsWith('1.4.') || c.startsWith('1.5.') || c.startsWith('1.9.')
  );

  // KEWAJIBAN JANGKA PENDEK: 2.1.x
  const currentLiabCodes = Object.keys(balances.cum).filter(c => c.startsWith('2.1.'));
  // KEWAJIBAN JANGKA PANJANG: 2.2.x
  const longTermLiabCodes = Object.keys(balances.cum).filter(c => c.startsWith('2.2.'));
  // EKUITAS: 3.x
  const equityCodes = Object.keys(balances.cum).filter(c => c.startsWith('3.'));

  // Calculate totals
  const totalCurrentAssets = currentAssetCodes.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const totalFixedAssetsGross = fixedAssetCodes.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const totalAccumDeprec = accumDeprecCodes.reduce((sum, c) => sum + Math.abs(balances.cum[c] || 0), 0);
  const totalFixedAssetsNet = totalFixedAssetsGross - totalAccumDeprec;
  const totalOtherAssets = otherAssetCodes.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const totalAssets = totalCurrentAssets + totalFixedAssetsNet + totalOtherAssets;

  const totalCurrentLiab = currentLiabCodes.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const totalLongTermLiab = longTermLiabCodes.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const totalLiabilities = totalCurrentLiab + totalLongTermLiab;

  const totalEquityBase = equityCodes.reduce((sum, c) => sum + (balances.cum[c] || 0), 0);
  const currentShu = balances.shuTotal;
  const totalEquity = totalEquityBase + currentShu;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const difference = Math.round(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = Math.abs(difference) === 0;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs text-center">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
          {profile.name} &bull; {profile.village}
        </h2>
        <h1 className="text-lg font-extrabold text-neutral-900 mt-0.5">
          LAPORAN POSISI KEUANGAN (NERACA)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {activeUnit === 'USP' ? 'Unit Simpan Pinjam' : activeUnit === 'Sembako' ? 'Unit Sembako, Pupuk & Gas' : 'Konsolidasi Seluruh Unit'} &bull; Per {MONTH_NAMES[periodMonth - 1]} {periodYear} (dalam Rupiah)
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
          {isBalanced ? (
            <span className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5 px-3 py-0.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Neraca Seimbang (Aktiva = Pasiva)
            </span>
          ) : (
            <span className="text-rose-700 bg-rose-50 border-rose-200 flex items-center gap-1.5 px-3 py-0.5 rounded-full">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Terdapat Selisih Neraca: Rp {formatRupiah(difference)}
            </span>
          )}
        </div>
      </div>

      {/* Two Column Balance Sheet or Tabular */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SISI KIRI: ASET (AKTIVA) */}
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-neutral-900 text-white font-bold text-xs px-4 py-2.5 uppercase tracking-wider flex items-center justify-between">
              <span>ASET (AKTIVA)</span>
              <span className="text-neutral-400 font-mono">BAGIAN I</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-neutral-100">
                  {/* Aset Lancar Header */}
                  <tr className="bg-rose-50/70 font-bold text-rose-900">
                    <td colSpan={2} className="py-2 px-3">A. Aset Lancar</td>
                    <td className="py-2 px-3 text-right"></td>
                  </tr>
                  {currentAssetCodes.map(c => (
                    <tr key={c} className="hover:bg-neutral-50/60">
                      <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                      <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-neutral-800">
                        {formatRupiah(balances.cum[c])}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-100/60 font-semibold text-neutral-900 border-t border-neutral-200">
                    <td colSpan={2} className="py-2 px-3 text-right">Total Aset Lancar:</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(totalCurrentAssets)}</td>
                  </tr>

                  {/* Aset Tetap Header */}
                  <tr className="bg-rose-50/70 font-bold text-rose-900 border-t-2 border-rose-100">
                    <td colSpan={2} className="py-2 px-3">B. Aset Tetap</td>
                    <td className="py-2 px-3 text-right"></td>
                  </tr>
                  {fixedAssetCodes.map(c => (
                    <tr key={c} className="hover:bg-neutral-50/60">
                      <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                      <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-neutral-800">
                        {formatRupiah(balances.cum[c])}
                      </td>
                    </tr>
                  ))}
                  {accumDeprecCodes.map(c => (
                    <tr key={c} className="hover:bg-neutral-50/60 text-neutral-500 italic">
                      <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                      <td className="py-1.5 px-3">{getName(c)}</td>
                      <td className="py-1.5 px-3 text-right font-mono">
                        ({formatRupiah(Math.abs(balances.cum[c] || 0))})
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-100/60 font-semibold text-neutral-900 border-t border-neutral-200">
                    <td colSpan={2} className="py-2 px-3 text-right">Total Nilai Buku Aset Tetap:</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(totalFixedAssetsNet)}</td>
                  </tr>

                  {/* Aset Lainnya Header */}
                  {otherAssetCodes.length > 0 && (
                    <>
                      <tr className="bg-rose-50/70 font-bold text-rose-900 border-t-2 border-rose-100">
                        <td colSpan={2} className="py-2 px-3">C. Aset Lain-Lain</td>
                        <td className="py-2 px-3 text-right"></td>
                      </tr>
                      {otherAssetCodes.map(c => (
                        <tr key={c} className="hover:bg-neutral-50/60">
                          <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                          <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-neutral-800">
                            {formatRupiah(balances.cum[c])}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-neutral-100/60 font-semibold text-neutral-900 border-t border-neutral-200">
                        <td colSpan={2} className="py-2 px-3 text-right">Total Aset Lain-Lain:</td>
                        <td className="py-2 px-3 text-right font-mono">{formatRupiah(totalOtherAssets)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Aset */}
          <div className="bg-rose-900 text-white font-extrabold text-xs px-4 py-3 flex items-center justify-between border-t-2 border-rose-950">
            <span className="uppercase tracking-wider">JUMLAH TOTAL AKTIVA (ASET):</span>
            <span className="font-mono text-sm">Rp {formatRupiah(totalAssets, false)}</span>
          </div>
        </div>

        {/* SISI KANAN: KEWAJIBAN & EKUITAS (PASIVA) */}
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-neutral-900 text-white font-bold text-xs px-4 py-2.5 uppercase tracking-wider flex items-center justify-between">
              <span>KEWAJIBAN & EKUITAS (PASIVA)</span>
              <span className="text-neutral-400 font-mono">BAGIAN II</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-neutral-100">
                  {/* Kewajiban Jangka Pendek */}
                  <tr className="bg-amber-50/70 font-bold text-amber-950">
                    <td colSpan={2} className="py-2 px-3">A. Kewajiban Jangka Pendek</td>
                    <td className="py-2 px-3 text-right"></td>
                  </tr>
                  {currentLiabCodes.map(c => (
                    <tr key={c} className="hover:bg-neutral-50/60">
                      <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                      <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-neutral-800">
                        {formatRupiah(balances.cum[c])}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-100/60 font-semibold text-neutral-900 border-t border-neutral-200">
                    <td colSpan={2} className="py-2 px-3 text-right">Total Kewajiban Jangka Pendek:</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(totalCurrentLiab)}</td>
                  </tr>

                  {/* Kewajiban Jangka Panjang */}
                  {longTermLiabCodes.length > 0 && (
                    <>
                      <tr className="bg-amber-50/70 font-bold text-amber-950 border-t-2 border-amber-100">
                        <td colSpan={2} className="py-2 px-3">B. Kewajiban Jangka Panjang</td>
                        <td className="py-2 px-3 text-right"></td>
                      </tr>
                      {longTermLiabCodes.map(c => (
                        <tr key={c} className="hover:bg-neutral-50/60">
                          <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                          <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-neutral-800">
                            {formatRupiah(balances.cum[c])}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-neutral-100/60 font-semibold text-neutral-900 border-t border-neutral-200">
                        <td colSpan={2} className="py-2 px-3 text-right">Total Kewajiban Jangka Panjang:</td>
                        <td className="py-2 px-3 text-right font-mono">{formatRupiah(totalLongTermLiab)}</td>
                      </tr>
                    </>
                  )}

                  {/* Ekuitas */}
                  <tr className="bg-emerald-50/70 font-bold text-emerald-950 border-t-2 border-emerald-100">
                    <td colSpan={2} className="py-2 px-3">C. Ekuitas (Modal Anggota & Koperasi)</td>
                    <td className="py-2 px-3 text-right"></td>
                  </tr>
                  {equityCodes.map(c => (
                    <tr key={c} className="hover:bg-neutral-50/60">
                      <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">{c}</td>
                      <td className="py-1.5 px-3 text-neutral-800">{getName(c)}</td>
                      <td className="py-1.5 px-3 text-right font-mono text-neutral-800">
                        {formatRupiah(balances.cum[c])}
                      </td>
                    </tr>
                  ))}
                  {/* Sisa Hasil Usaha Berjalan */}
                  <tr className="hover:bg-emerald-50/40 font-semibold text-emerald-900">
                    <td className="py-1.5 px-3 w-24 text-neutral-400 font-mono text-[11px]">3.9.SHU</td>
                    <td className="py-1.5 px-3">SHU Berjalan Periode {periodYear} s.d. bulan ini</td>
                    <td className="py-1.5 px-3 text-right font-mono">
                      {formatRupiah(currentShu)}
                    </td>
                  </tr>
                  <tr className="bg-neutral-100/60 font-semibold text-neutral-900 border-t border-neutral-200">
                    <td colSpan={2} className="py-2 px-3 text-right">Total Ekuitas & SHU Berjalan:</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(totalEquity)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Kewajiban & Ekuitas */}
          <div className="bg-neutral-900 text-white font-extrabold text-xs px-4 py-3 flex items-center justify-between border-t-2 border-neutral-950">
            <span className="uppercase tracking-wider">TOTAL KEWAJIBAN & EKUITAS:</span>
            <span className="font-mono text-sm">Rp {formatRupiah(totalLiabilitiesAndEquity, false)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
