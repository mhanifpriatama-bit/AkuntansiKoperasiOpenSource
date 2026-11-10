import React, { useState } from 'react';
import { FixedAsset, JournalRow, UnitType } from '../types/accounting';
import { ASSET_CATEGORIES, MONTH_NAMES } from '../data/initialData';
import { calculateDepreciation, formatRupiah, parseNumberId } from '../services/accountingEngine';
import { Plus, Trash2, Calculator, Check, Sparkles, Building } from 'lucide-react';

interface FixedAssetsViewProps {
  assets: FixedAsset[];
  activeUnit: UnitType;
  periodMonth: number;
  periodYear: number;
  onUpdateAssets: (assets: FixedAsset[]) => void;
  onGenerateDepreciationJournal: (entries: JournalRow[]) => void;
}

export const FixedAssetsView: React.FC<FixedAssetsViewProps> = ({
  assets,
  activeUnit,
  periodMonth,
  periodYear,
  onUpdateAssets,
  onGenerateDepreciationJournal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'jadwal'>('daftar');
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  const { items, totals, categorySummary } = calculateDepreciation(assets, periodMonth, periodYear);

  const handleAddAsset = () => {
    const newAsset: FixedAsset = {
      id: 'ast_' + Date.now(),
      kode: 'AST-' + String(assets.length + 1).padStart(2, '0'),
      nama: '',
      kat: 'Inventaris',
      tgl: `${periodYear}-${String(periodMonth).padStart(2, '0')}-01`,
      hp: 0,
      res: 0,
      umur: 4,
      met: 'Garis Lurus'
    };
    onUpdateAssets([...assets, newAsset]);
  };

  const handleAssetChange = (id: string, field: keyof FixedAsset, value: any) => {
    const updated = assets.map(a => {
      if (a.id === id) {
        return { ...a, [field]: value };
      }
      return a;
    });
    onUpdateAssets(updated);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Hapus aset ini dari buku pembantu?')) {
      onUpdateAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleGenerateJournal = () => {
    const expenseGroups: Record<string, number> = {};

    items.forEach(res => {
      if (!res.isActive || res.monthlyExpense <= 0) return;
      const cat = ASSET_CATEGORIES[res.asset.kat];
      if (!cat || !cat.expense || !cat.accum) return;

      const key = `${cat.expense}|${cat.accum}`;
      expenseGroups[key] = (expenseGroups[key] || 0) + res.monthlyExpense;
    });

    if (Object.keys(expenseGroups).length === 0) {
      alert('Tidak ada beban penyusutan untuk bulan ini.');
      return;
    }

    const dateStr = `${periodYear}-${String(periodMonth).padStart(2, '0')}-28`;
    const noBukti = `DEP-${periodYear}${String(periodMonth).padStart(2, '0')}`;
    const ket = `Penyusutan Aset Tetap Bulan ${MONTH_NAMES[periodMonth - 1]} ${periodYear}`;

    const newRows: JournalRow[] = [];
    Object.entries(expenseGroups).forEach(([key, amount]) => {
      const [expCode, accumCode] = key.split('|');
      const val = Math.round(amount);

      newRows.push({
        id: 'dep_db_' + Date.now() + Math.random().toString(36).substring(2, 5),
        d: dateStr,
        no: noBukti,
        ak: expCode,
        db: val,
        kr: 0,
        ket,
        kom: ''
      });

      newRows.push({
        id: 'dep_kr_' + Date.now() + Math.random().toString(36).substring(2, 5),
        d: dateStr,
        no: noBukti,
        ak: accumCode,
        db: 0,
        kr: val,
        ket,
        kom: ''
      });
    });

    onGenerateDepreciationJournal(newRows);
    setGeneratedMessage(`Berhasil membuat ${newRows.length} baris jurnal penyusutan (No Bukti: ${noBukti})`);
    setTimeout(() => setGeneratedMessage(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation & Generator Header */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('daftar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'daftar'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Daftar Aset Tetap ({assets.length})
          </button>
          <button
            onClick={() => setActiveSubTab('jadwal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'jadwal'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Jadwal & Nilai Buku Penyusutan
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'daftar' && (
            <button
              onClick={handleAddAsset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aset</span>
            </button>
          )}

          <button
            onClick={handleGenerateJournal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Generate Jurnal Penyusutan Bulan Ini</span>
          </button>
        </div>
      </div>

      {generatedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{generatedMessage} &mdash; dapat diperiksa di tab Jurnal Umum.</span>
        </div>
      )}

      {/* View 1: Daftar Aset */}
      {activeSubTab === 'daftar' && (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-rose-900 text-white font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-28">Kode Aset</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Nama Aset</th>
                  <th className="py-2.5 px-3 w-36">Kategori</th>
                  <th className="py-2.5 px-3 w-32">Tgl Perolehan</th>
                  <th className="py-2.5 px-3 w-32 text-right">Harga Perolehan (Rp)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Nilai Residu (Rp)</th>
                  <th className="py-2.5 px-3 w-20 text-center">Umur (Thn)</th>
                  <th className="py-2.5 px-3 w-32">Metode</th>
                  <th className="py-2.5 px-2 w-10 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {assets.map((asset, idx) => (
                  <tr key={asset.id} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-3 text-center text-neutral-400">{idx + 1}</td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={asset.kode}
                        onChange={(e) => handleAssetChange(asset.id, 'kode', e.target.value)}
                        className="w-full px-2 py-1 font-mono uppercase bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={asset.nama}
                        placeholder="Nama aset / barang..."
                        onChange={(e) => handleAssetChange(asset.id, 'nama', e.target.value)}
                        className="w-full px-2 py-1 font-medium text-neutral-900 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={asset.kat}
                        onChange={(e) => handleAssetChange(asset.id, 'kat', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded text-neutral-800"
                      >
                        {Object.keys(ASSET_CATEGORIES).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="date"
                        value={asset.tgl}
                        onChange={(e) => handleAssetChange(asset.id, 'tgl', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={asset.hp ? Number(asset.hp).toLocaleString('id-ID') : ''}
                        onChange={(e) => handleAssetChange(asset.id, 'hp', parseNumberId(e.target.value))}
                        className="w-full px-2 py-1 text-right font-mono bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={asset.res ? Number(asset.res).toLocaleString('id-ID') : ''}
                        onChange={(e) => handleAssetChange(asset.id, 'res', parseNumberId(e.target.value))}
                        className="w-full px-2 py-1 text-right font-mono bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2 text-center">
                      <input
                        type="number"
                        value={asset.umur}
                        onChange={(e) => handleAssetChange(asset.id, 'umur', Number(e.target.value))}
                        className="w-16 px-1 py-1 text-center font-mono bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={asset.met}
                        onChange={(e) => handleAssetChange(asset.id, 'met', e.target.value as any)}
                        className="w-full px-2 py-1 text-neutral-700 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      >
                        <option value="Garis Lurus">Garis Lurus</option>
                        <option value="Saldo Menurun">Saldo Menurun</option>
                      </select>
                    </td>
                    <td className="py-1 px-2 text-center">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Jadwal Penyusutan */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 bg-neutral-50/60 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Jadwal & Akumulasi Penyusutan Aset Tetap
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Periode {MONTH_NAMES[periodMonth - 1]} {periodYear} (Dihitung otomatis per bulan sejak perolehan)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-rose-900 text-white font-semibold">
                    <th className="py-2.5 px-3">Kode & Nama Aset</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 w-24">Tgl Beli</th>
                    <th className="py-2.5 px-3 w-28 text-right">Harga Perolehan</th>
                    <th className="py-2.5 px-3 w-28 text-right">Beban Bulan Ini</th>
                    <th className="py-2.5 px-3 w-28 text-right">Beban Thn Berjalan</th>
                    <th className="py-2.5 px-3 w-32 text-right">Akumulasi Penyusutan</th>
                    <th className="py-2.5 px-3 w-32 text-right">Nilai Buku</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {items.map(res => (
                    <tr key={res.asset.id} className="hover:bg-neutral-50/60">
                      <td className="py-2 px-3 font-sans font-medium text-neutral-900">
                        <span className="font-mono text-neutral-500 mr-2">{res.asset.kode}</span>
                        {res.asset.nama}
                      </td>
                      <td className="py-2 px-3 font-sans text-neutral-600">{res.asset.kat}</td>
                      <td className="py-2 px-3 text-neutral-500">{res.asset.tgl}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(res.cost)}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(res.monthlyExpense)}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(res.ytdExpense)}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(res.accumulated)}</td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">{formatRupiah(res.bookValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-neutral-900 font-mono">
                    <td colSpan={3} className="py-3 px-3 text-right font-sans uppercase">Total Keseluruhan:</td>
                    <td className="py-3 px-3 text-right">{formatRupiah(totals.cost)}</td>
                    <td className="py-3 px-3 text-right">{formatRupiah(totals.monthly)}</td>
                    <td className="py-3 px-3 text-right">{formatRupiah(totals.ytd)}</td>
                    <td className="py-3 px-3 text-right">{formatRupiah(totals.accum)}</td>
                    <td className="py-3 px-3 text-right font-bold text-rose-800">{formatRupiah(totals.bookValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Category Summary */}
          <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs p-4">
            <h4 className="text-xs font-bold text-neutral-800 mb-3 uppercase tracking-wider">
              Rekapitulasi Nilai Buku per Kategori Aset
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {Object.entries(categorySummary).map(([cat, summary]) => (
                <div key={cat} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="font-bold text-neutral-900 mb-1">{cat}</div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Perolehan:</span>
                    <span className="font-mono">Rp {formatRupiah(summary.cost)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Akumulasi:</span>
                    <span className="font-mono text-rose-700">Rp {formatRupiah(summary.accum)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900 text-xs border-t border-neutral-200 pt-1 mt-1">
                    <span>Nilai Buku:</span>
                    <span className="font-mono text-emerald-700">Rp {formatRupiah(summary.bookValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
