import React, { useState } from 'react';
import { AccountCOA, InventoryItem, InventoryMutation } from '../types/accounting';
import { calculateInventory, formatRupiah, parseNumberId } from '../services/accountingEngine';
import { MONTH_NAMES } from '../data/initialData';
import { Plus, Trash2, Package, Layers, FileSpreadsheet } from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  mutations: InventoryMutation[];
  coa: AccountCOA[];
  periodMonth: number;
  periodYear: number;
  onUpdateItems: (items: InventoryItem[]) => void;
  onUpdateMutations: (mutations: InventoryMutation[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  mutations,
  coa,
  periodMonth,
  periodYear,
  onUpdateItems,
  onUpdateMutations
}) => {
  const [subTab, setSubTab] = useState<'master' | 'mutasi' | 'kartu' | 'rekap'>('rekap');
  const [selectedItemCode, setSelectedItemCode] = useState<string>(items[0]?.k || '');

  const { itemSummaries, stockCards, accountTotals, totalValue } = calculateInventory(
    items,
    mutations,
    periodMonth,
    periodYear
  );

  const inventoryAccounts = coa.filter(a => a.code.startsWith('1.1.4.'));

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      k: 'BRG-' + String(items.length + 1).padStart(3, '0'),
      n: 'Barang Dagangan Baru',
      akun: '1.1.4.02',
      satuan: 'Pcs'
    };
    onUpdateItems([...items, newItem]);
  };

  const handleItemChange = (code: string, field: keyof InventoryItem, value: any) => {
    const updated = items.map(it => {
      if (it.k === code) {
        return { ...it, [field]: value };
      }
      return it;
    });
    onUpdateItems(updated);
  };

  const handleDeleteItem = (code: string) => {
    if (confirm('Hapus barang ini dari Master Barang?')) {
      onUpdateItems(items.filter(it => it.k !== code));
    }
  };

  const handleAddMutation = () => {
    const newMut: InventoryMutation = {
      id: 'mut_' + Date.now(),
      d: `${periodYear}-${String(periodMonth).padStart(2, '0')}-01`,
      no: 'MUT-' + String(mutations.length + 1).padStart(2, '0'),
      k: items[0]?.k || '',
      j: 'Masuk',
      q: 10,
      h: 0,
      ket: 'Penerimaan stok baru'
    };
    onUpdateMutations([...mutations, newMut]);
  };

  const handleMutationChange = (id: string, field: keyof InventoryMutation, value: any) => {
    const updated = mutations.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onUpdateMutations(updated);
  };

  const handleDeleteMutation = (id: string) => {
    if (confirm('Hapus transaksi mutasi stok ini?')) {
      onUpdateMutations(mutations.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('rekap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'rekap' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Rekapitulasi Persediaan
          </button>
          <button
            onClick={() => setSubTab('kartu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'kartu' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Kartu Stok (Moving Average)
          </button>
          <button
            onClick={() => setSubTab('mutasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'mutasi' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Mutasi Stok ({mutations.length})
          </button>
          <button
            onClick={() => setSubTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'master' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Master Barang ({items.length})
          </button>
        </div>

        {subTab === 'master' && (
          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Barang</span>
          </button>
        )}

        {subTab === 'mutasi' && (
          <button
            onClick={handleAddMutation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Mutasi Stok</span>
          </button>
        )}
      </div>

      {/* 1. Rekapitulasi Persediaan */}
      {subTab === 'rekap' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 bg-neutral-50/50 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Rekapitulasi Nilai Persediaan Barang Dagangan
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Metode Penilaian: Rata-Rata Bergerak (Moving Average Cost) &bull; Periode {MONTH_NAMES[periodMonth - 1]} {periodYear}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-500 block">Total Nilai Persediaan:</span>
                <span className="font-mono text-sm font-bold text-neutral-900">
                  Rp {formatRupiah(totalValue, false)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-rose-900 text-white font-semibold">
                    <th className="py-2.5 px-3">Kode & Nama Barang</th>
                    <th className="py-2.5 px-3 w-28">Akun Buku Besar</th>
                    <th className="py-2.5 px-3 w-24 text-right">Saldo Awal</th>
                    <th className="py-2.5 px-3 w-24 text-right">Masuk</th>
                    <th className="py-2.5 px-3 w-24 text-right">Keluar</th>
                    <th className="py-2.5 px-3 w-24 text-right">Saldo Akhir</th>
                    <th className="py-2.5 px-3 w-32 text-right">Harga Rata-Rata</th>
                    <th className="py-2.5 px-3 w-36 text-right">Nilai Akhir (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {Object.values(itemSummaries).map(summary => (
                    <tr key={summary.item.k} className="hover:bg-neutral-50/60">
                      <td className="py-2 px-3 font-sans font-medium text-neutral-900">
                        <span className="font-mono text-neutral-500 mr-2">{summary.item.k}</span>
                        {summary.item.n}
                      </td>
                      <td className="py-2 px-3 text-neutral-600 font-sans">{summary.item.akun}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">{summary.openingQty}</td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-semibold">{summary.inQty}</td>
                      <td className="py-2 px-3 text-right text-rose-700 font-semibold">{summary.outQty}</td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">{summary.closingQty}</td>
                      <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(summary.avgPrice)}</td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">{formatRupiah(summary.closingValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-neutral-900 font-mono">
                    <td colSpan={7} className="py-3 px-3 text-right font-sans uppercase">
                      Total Nilai Persediaan Dagangan:
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-800">
                      {formatRupiah(totalValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Kartu Stok */}
      {subTab === 'kartu' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-700">Pilih Barang:</span>
            <select
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              className="text-xs font-semibold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5"
            >
              {items.map(it => (
                <option key={it.k} value={it.k}>
                  {it.k} - {it.n} ({it.satuan || 'Pcs'})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-rose-900 text-white font-semibold">
                    <th className="py-2.5 px-3 w-28">Tanggal</th>
                    <th className="py-2.5 px-3 w-28">No Bukti</th>
                    <th className="py-2.5 px-3 w-28">Jenis</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                    <th className="py-2.5 px-3 w-20 text-right">Masuk</th>
                    <th className="py-2.5 px-3 w-28 text-right">Harga Masuk</th>
                    <th className="py-2.5 px-3 w-20 text-right">Keluar</th>
                    <th className="py-2.5 px-3 w-28 text-right">HPP Keluar</th>
                    <th className="py-2.5 px-3 w-24 text-right">Saldo Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Harga Rata²</th>
                    <th className="py-2.5 px-3 w-32 text-right">Nilai Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {(stockCards[selectedItemCode] || []).length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-neutral-400 font-sans">
                        Belum ada mutasi stok untuk barang ini.
                      </td>
                    </tr>
                  ) : (
                    (stockCards[selectedItemCode] || []).map((card, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/60">
                        <td className="py-2 px-3 font-sans text-neutral-600">{card.date}</td>
                        <td className="py-2 px-3 text-neutral-800 uppercase">{card.no}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            card.type === 'Masuk' ? 'bg-emerald-100 text-emerald-800' :
                            card.type === 'Keluar' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {card.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans text-neutral-700">{card.note}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-semibold">{card.inQty || '-'}</td>
                        <td className="py-2 px-3 text-right text-neutral-600">{card.inPrice ? formatRupiah(card.inPrice) : '-'}</td>
                        <td className="py-2 px-3 text-right text-rose-700 font-semibold">{card.outQty || '-'}</td>
                        <td className="py-2 px-3 text-right text-neutral-600">{card.outCost ? formatRupiah(card.outCost) : '-'}</td>
                        <td className="py-2 px-3 text-right font-bold text-neutral-900">{card.balanceQty}</td>
                        <td className="py-2 px-3 text-right text-neutral-800">{formatRupiah(card.avgPrice)}</td>
                        <td className="py-2 px-3 text-right font-bold text-neutral-900">{formatRupiah(card.balanceValue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mutasi Stok Grid */}
      {subTab === 'mutasi' && (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-rose-900 text-white font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-32">Tanggal</th>
                  <th className="py-2.5 px-3 w-28">No Bukti</th>
                  <th className="py-2.5 px-3 w-48">Barang</th>
                  <th className="py-2.5 px-3 w-28">Jenis Mutasi</th>
                  <th className="py-2.5 px-3 w-24 text-right">Jumlah (Qty)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Harga Masuk (Rp)</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-2 w-10 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {mutations.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-3 text-center text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-1 px-2">
                      <input
                        type="date"
                        value={m.d}
                        onChange={(e) => handleMutationChange(m.id, 'd', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={m.no}
                        onChange={(e) => handleMutationChange(m.id, 'no', e.target.value)}
                        className="w-full px-2 py-1 font-mono uppercase bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={m.k}
                        onChange={(e) => handleMutationChange(m.id, 'k', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded font-medium"
                      >
                        {items.map(it => (
                          <option key={it.k} value={it.k}>{it.k} - {it.n}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={m.j}
                        onChange={(e) => handleMutationChange(m.id, 'j', e.target.value as any)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      >
                        <option value="Saldo Awal">Saldo Awal</option>
                        <option value="Masuk">Masuk</option>
                        <option value="Keluar">Keluar</option>
                      </select>
                    </td>
                    <td className="py-1 px-2 text-right">
                      <input
                        type="number"
                        value={m.q}
                        onChange={(e) => handleMutationChange(m.id, 'q', Number(e.target.value))}
                        className="w-full px-2 py-1 text-right font-mono bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        disabled={m.j === 'Keluar'}
                        value={m.h ? Number(m.h).toLocaleString('id-ID') : ''}
                        placeholder={m.j === 'Keluar' ? '(otomatis HPP)' : '0'}
                        onChange={(e) => handleMutationChange(m.id, 'h', parseNumberId(e.target.value))}
                        className="w-full px-2 py-1 text-right font-mono bg-transparent border border-transparent hover:border-neutral-200 rounded disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={m.ket}
                        onChange={(e) => handleMutationChange(m.id, 'ket', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2 text-center">
                      <button
                        onClick={() => handleDeleteMutation(m.id)}
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

      {/* 4. Master Barang */}
      {subTab === 'master' && (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-rose-900 text-white font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-36">Kode Barang</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Nama Barang</th>
                  <th className="py-2.5 px-3 w-48">Akun Persediaan (Buku Besar)</th>
                  <th className="py-2.5 px-3 w-28">Satuan</th>
                  <th className="py-2.5 px-2 w-10 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((it, idx) => (
                  <tr key={it.k} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-3 text-center text-neutral-400 font-mono">{idx + 1}</td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={it.k}
                        onChange={(e) => handleItemChange(it.k, 'k', e.target.value)}
                        className="w-full px-2 py-1 font-mono uppercase bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={it.n}
                        onChange={(e) => handleItemChange(it.k, 'n', e.target.value)}
                        className="w-full px-2 py-1 font-medium text-neutral-900 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={it.akun}
                        onChange={(e) => handleItemChange(it.k, 'akun', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded font-medium"
                      >
                        {inventoryAccounts.map(a => (
                          <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={it.satuan || ''}
                        placeholder="Pcs, Kg, Sak..."
                        onChange={(e) => handleItemChange(it.k, 'satuan', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-neutral-200 rounded"
                      />
                    </td>
                    <td className="py-1 px-2 text-center">
                      <button
                        onClick={() => handleDeleteItem(it.k)}
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
    </div>
  );
};
