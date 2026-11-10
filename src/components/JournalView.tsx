import React, { useState } from 'react';
import { AccountCOA, JournalRow, UnitType } from '../types/accounting';
import { CASH_FLOW_COMPONENTS, MONTH_NAMES } from '../data/initialData';
import { formatRupiah, parseNumberId, ymOf } from '../services/accountingEngine';
import { Plus, Trash2, Search, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

interface JournalViewProps {
  rows: JournalRow[];
  coa: AccountCOA[];
  activeUnit: UnitType;
  periodMonth: number;
  periodYear: number;
  onUpdateRows: (newRows: JournalRow[]) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  rows,
  coa,
  activeUnit,
  periodMonth,
  periodYear,
  onUpdateRows
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriodOnly, setFilterPeriodOnly] = useState(true);

  const currentPeriodKey = periodYear * 12 + periodMonth;

  // Filter rows
  const visibleRows = rows.filter(r => {
    if (filterPeriodOnly && r.d && ymOf(r.d) !== currentPeriodKey) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNo = (r.no || '').toLowerCase().includes(q);
      const matchAk = (r.ak || '').toLowerCase().includes(q);
      const matchKet = (r.ket || '').toLowerCase().includes(q);
      return matchNo || matchAk || matchKet;
    }
    return true;
  });

  // Calculate totals
  const totalDebit = visibleRows.reduce((sum, r) => sum + (Number(r.db) || 0), 0);
  const totalCredit = visibleRows.reduce((sum, r) => sum + (Number(r.kr) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.5;

  const handleAddRow = (count: number = 1) => {
    const defaultDate = `${periodYear}-${String(periodMonth).padStart(2, '0')}-01`;
    const newItems: JournalRow[] = [];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: 'jr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        d: defaultDate,
        no: '',
        ak: '',
        db: 0,
        kr: 0,
        ket: '',
        kom: ''
      });
    }
    onUpdateRows([...rows, ...newItems]);
  };

  const handleRowChange = (id: string, field: keyof JournalRow, value: any) => {
    const updated = rows.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  const handleDeleteRow = (id: string) => {
    if (confirm('Hapus baris jurnal ini?')) {
      onUpdateRows(rows.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAddRow(1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris</span>
          </button>
          <button
            onClick={() => handleAddRow(5)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium"
          >
            +5 Baris
          </button>

          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-600 ml-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterPeriodOnly}
              onChange={(e) => setFilterPeriodOnly(e.target.checked)}
              className="rounded text-rose-700 focus:ring-rose-500"
            />
            <span>Hanya Periode {MONTH_NAMES[periodMonth - 1]} {periodYear}</span>
          </label>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari akun, no bukti, keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
          />
        </div>
      </div>

      {/* Datalist for Accounts */}
      <datalist id="coa-list">
        {coa.map(a => (
          <option key={a.code} value={`${a.code} ${a.name}`} />
        ))}
      </datalist>

      {/* Journal Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-rose-900 text-white font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-32">Tanggal</th>
                <th className="py-2.5 px-3 w-28">No Bukti</th>
                <th className="py-2.5 px-3 min-w-[220px]">Kode & Nama Akun</th>
                <th className="py-2.5 px-3 w-32 text-right">Debit (Rp)</th>
                <th className="py-2.5 px-3 w-32 text-right">Kredit (Rp)</th>
                <th className="py-2.5 px-3 min-w-[200px]">Keterangan</th>
                <th className="py-2.5 px-3 min-w-[180px]">Komponen Arus Kas</th>
                <th className="py-2.5 px-2 w-10 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400 text-xs">
                    Tidak ada baris transaksi pada periode atau kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, index) => {
                  const hasInvalidAccount = row.ak && !coa.some(a => row.ak.startsWith(a.code));

                  return (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-neutral-50 transition-colors ${hasInvalidAccount ? 'bg-rose-50/70' : ''}`}
                    >
                      <td className="py-1.5 px-3 text-center text-neutral-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Date */}
                      <td className="py-1 px-2">
                        <input
                          type="date"
                          value={row.d}
                          onChange={(e) => handleRowChange(row.id, 'd', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-800"
                        />
                      </td>

                      {/* No Bukti */}
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={row.no}
                          placeholder="e.g. BKM-01"
                          onChange={(e) => handleRowChange(row.id, 'no', e.target.value)}
                          className="w-full px-2 py-1 font-mono uppercase bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-800"
                        />
                      </td>

                      {/* Account */}
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          list="coa-list"
                          value={row.ak}
                          placeholder="Pilih akun..."
                          onChange={(e) => handleRowChange(row.id, 'ak', e.target.value)}
                          className="w-full px-2 py-1 font-medium bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-900"
                        />
                      </td>

                      {/* Debit */}
                      <td className="py-1 px-2 text-right">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={row.db ? Number(row.db).toLocaleString('id-ID') : ''}
                          placeholder="0"
                          onChange={(e) => handleRowChange(row.id, 'db', parseNumberId(e.target.value))}
                          className="w-full px-2 py-1 text-right font-mono bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-900"
                        />
                      </td>

                      {/* Credit */}
                      <td className="py-1 px-2 text-right">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={row.kr ? Number(row.kr).toLocaleString('id-ID') : ''}
                          placeholder="0"
                          onChange={(e) => handleRowChange(row.id, 'kr', parseNumberId(e.target.value))}
                          className="w-full px-2 py-1 text-right font-mono bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-900"
                        />
                      </td>

                      {/* Note */}
                      <td className="py-1 px-2">
                        <input
                          type="text"
                          value={row.ket}
                          placeholder="Keterangan transaksi..."
                          onChange={(e) => handleRowChange(row.id, 'ket', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-700"
                        />
                      </td>

                      {/* Cash flow component */}
                      <td className="py-1 px-2">
                        <select
                          value={row.kom || ''}
                          onChange={(e) => handleRowChange(row.id, 'kom', e.target.value)}
                          className="w-full px-2 py-1 text-[11px] bg-transparent border border-transparent hover:border-neutral-200 focus:border-rose-400 focus:bg-white rounded text-neutral-700"
                        >
                          <option value="">(Bukan kas / otomatis)</option>
                          {CASH_FLOW_COMPONENTS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-1 px-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Balance Summary */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-neutral-500 mr-2">Total Debit:</span>
              <span className="font-mono font-bold text-neutral-900">Rp {formatRupiah(totalDebit, false)}</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-2">Total Kredit:</span>
              <span className="font-mono font-bold text-neutral-900">Rp {formatRupiah(totalCredit, false)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBalanced ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Jurnal Balance (Seimbang)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Selisih: Rp {formatRupiah(totalDebit - totalCredit)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
