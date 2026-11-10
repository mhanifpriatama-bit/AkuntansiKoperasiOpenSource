import React, { useState } from 'react';
import { AccountCOA, JournalRow } from '../types/accounting';
import { formatRupiah, getAccountNormal, ymOf } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { Layers, Search } from 'lucide-react';

interface LedgerViewProps {
  rows: JournalRow[];
  coa: AccountCOA[];
  periodMonth: number;
  periodYear: number;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  rows,
  coa,
  periodMonth,
  periodYear
}) => {
  const [selectedCode, setSelectedCode] = useState<string>('1.1.1.01');

  const selectedAccount = coa.find(a => a.code === selectedCode) || coa[0];
  const normal = getAccountNormal(selectedCode, coa);
  const isNormalDebit = normal === 'Debit';
  const sign = isNormalDebit ? 1 : -1;

  const currentPeriod = periodYear * 12 + periodMonth;
  const isPandL = ['4', '5', '6', '7', '8'].includes(selectedCode.charAt(0)) || selectedCode.startsWith('9');

  // Filter rows matching selected account
  const matchingRows = rows
    .filter(r => (r.ak || '').startsWith(selectedCode) && r.d)
    .sort((a, b) => a.d.localeCompare(b.d));

  let openingBalance = 0;
  let runningBalance = 0;
  const periodTransactions: {
    d: string;
    no: string;
    ket: string;
    db: number;
    kr: number;
    balance: number;
  }[] = [];

  matchingRows.forEach(r => {
    const rowPeriod = ymOf(r.d);
    const rowYear = parseInt(r.d.split('-')[0], 10);

    // If P&L account, only accumulate within current year
    if (isPandL && rowYear !== periodYear) return;
    if (rowPeriod > currentPeriod) return;

    const dVal = Number(r.db) || 0;
    const kVal = Number(r.kr) || 0;
    const change = sign * (dVal - kVal);

    if (rowPeriod < currentPeriod) {
      openingBalance += change;
      runningBalance = openingBalance;
    } else if (rowPeriod === currentPeriod) {
      runningBalance += change;
      periodTransactions.push({
        d: r.d,
        no: r.no,
        ket: r.ket,
        db: dVal,
        kr: kVal,
        balance: runningBalance
      });
    }
  });

  const totalPeriodDebit = periodTransactions.reduce((sum, t) => sum + t.db, 0);
  const totalPeriodCredit = periodTransactions.reduce((sum, t) => sum + t.kr, 0);

  return (
    <div className="space-y-4">
      {/* Account Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-700" />
          <span className="text-xs font-semibold text-neutral-700">Pilih Akun Buku Besar:</span>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 focus:bg-white focus:outline-rose-500"
          >
            {coa.map(a => (
              <option key={a.code} value={a.code}>
                {a.code} - {a.name} ({a.normal})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-neutral-500">
          Periode: <b className="text-neutral-900">{MONTH_NAMES[periodMonth - 1]} {periodYear}</b> &bull; Saldo Normal: <b className="text-neutral-900">{normal}</b>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Buku Besar: {selectedCode} - {selectedAccount?.name}
            </h3>
            <p className="text-[11px] text-neutral-500">
              Rincian mutasi debit/kredit dan saldo berjalan per transaksi
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-neutral-500 block">Saldo Akhir Periode:</span>
            <span className="font-mono text-sm font-bold text-neutral-900">
              Rp {formatRupiah(runningBalance, false)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-neutral-100/80 text-neutral-700 font-semibold border-b border-neutral-200">
                <th className="py-2.5 px-3 w-28">Tanggal</th>
                <th className="py-2.5 px-3 w-28">No Bukti</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3 w-32 text-right">Debit (Rp)</th>
                <th className="py-2.5 px-3 w-32 text-right">Kredit (Rp)</th>
                <th className="py-2.5 px-3 w-36 text-right">Saldo Berjalan (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {/* Saldo awal row */}
              <tr className="bg-neutral-50/60 font-semibold text-neutral-700 font-sans">
                <td className="py-2 px-3">-</td>
                <td className="py-2 px-3">-</td>
                <td className="py-2 px-3 italic font-sans">Saldo Awal Periode s.d. awal bulan</td>
                <td className="py-2 px-3 text-right font-mono">-</td>
                <td className="py-2 px-3 text-right font-mono">-</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                  {formatRupiah(openingBalance)}
                </td>
              </tr>

              {periodTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-400 font-sans">
                    Tidak ada mutasi transaksi pada akun ini di periode {MONTH_NAMES[periodMonth - 1]} {periodYear}.
                  </td>
                </tr>
              ) : (
                periodTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-2 px-3 text-neutral-600 font-sans">{tx.d}</td>
                    <td className="py-2 px-3 text-neutral-800 uppercase">{tx.no || '-'}</td>
                    <td className="py-2 px-3 text-neutral-800 font-sans">{tx.ket}</td>
                    <td className="py-2 px-3 text-right text-neutral-800">
                      {tx.db ? formatRupiah(tx.db) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-800">
                      {tx.kr ? formatRupiah(tx.kr) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-neutral-900">
                      {formatRupiah(tx.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-50 font-semibold border-t border-neutral-200">
                <td colSpan={3} className="py-2.5 px-3 text-right text-neutral-700 font-sans font-bold">
                  Total Mutasi Bulan Ini:
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                  {formatRupiah(totalPeriodDebit)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                  {formatRupiah(totalPeriodCredit)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800">
                  {formatRupiah(runningBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
