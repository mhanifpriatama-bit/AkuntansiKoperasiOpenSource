import React from 'react';
import { MONTH_NAMES } from '../data/initialData';
import { CooperativeProfile, UnitType } from '../types/accounting';
import { Building2, Calendar, CheckCircle2, AlertTriangle, Printer, Download, Upload, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '../services/accountingEngine';

interface HeaderProps {
  profile: CooperativeProfile;
  activeUnit: UnitType;
  setActiveUnit: (unit: UnitType) => void;
  periodMonth: number;
  setPeriodMonth: (m: number) => void;
  periodYear: number;
  setPeriodYear: (y: number) => void;
  isJournalBalanced: boolean;
  journalDifference: number;
  onOpenBackup: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeUnit,
  setActiveUnit,
  periodMonth,
  setPeriodMonth,
  periodYear,
  setPeriodYear,
  isJournalBalanced,
  journalDifference,
  onOpenBackup,
  onPrint
}) => {
  return (
    <header className="bg-white border-b border-rose-200 shadow-xs sticky top-0 z-30">
      {/* Top Banner with branding and units */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-neutral-100">
          {/* Logo & Cooperative Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-700 to-rose-900 flex items-center justify-center text-white shadow-sm ring-2 ring-rose-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                  {profile.name}
                </h1>
                <span className="text-[11px] font-semibold tracking-wide bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                  {profile.village}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Sistem Akuntansi Terpadu Koperasi Desa &bull; Standar SAK-EP / Permenkop
              </p>
            </div>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center bg-neutral-100/90 p-1 rounded-xl border border-neutral-200/80">
            <button
              onClick={() => setActiveUnit('USP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeUnit === 'USP'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Unit Simpan Pinjam
            </button>
            <button
              onClick={() => setActiveUnit('Sembako')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeUnit === 'Sembako'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Unit Sembako & Gas
            </button>
            <button
              onClick={() => setActiveUnit('KONSOL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeUnit === 'KONSOL'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Konsolidasi (Admin)
            </button>
          </div>
        </div>

        {/* Sub-bar: Period & Controls */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Period controls */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Periode:
            </span>
            <select
              value={periodMonth}
              onChange={(e) => setPeriodMonth(Number(e.target.value))}
              aria-label="Pilih Bulan Periode"
              className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 font-semibold text-neutral-800 focus:outline-rose-500 focus:bg-white"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={periodYear}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              aria-label="Tahun Periode"
              className="w-18 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 font-semibold text-neutral-800 text-center focus:outline-rose-500 focus:bg-white"
            />

            {/* Balance Status Badge */}
            {activeUnit !== 'KONSOL' && (
              <div
                className={`ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  isJournalBalanced
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {isJournalBalanced ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Jurnal Balance</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Selisih: {formatRupiah(journalDifference)}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-colors"
              title="Cetak tampilan laporan atau simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-500" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onOpenBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-neutral-300" />
              <span>Backup & Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
