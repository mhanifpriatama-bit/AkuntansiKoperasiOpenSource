import React, { useState } from 'react';
import { AccountCOA, JournalRow, NormalBalance } from '../types/accounting';
import { Plus, Search, Trash2, Download, Upload, CheckCircle2 } from 'lucide-react';

interface CoaViewProps {
  coa: AccountCOA[];
  allRows: JournalRow[];
  onUpdateCoa: (newCoa: AccountCOA[]) => void;
}

export const CoaView: React.FC<CoaViewProps> = ({ coa, allRows, onUpdateCoa }) => {
  const [search, setSearch] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNormal, setNewNormal] = useState<NormalBalance>('Debit');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Compute usage map
  const usageMap: Record<string, number> = {};
  allRows.forEach(r => {
    const c = (r.ak || '').split(' ')[0];
    if (c) usageMap[c] = (usageMap[c] || 0) + 1;
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim();
    const name = newName.trim();

    if (!code || !name) {
      alert('Kode akun dan nama akun wajib diisi.');
      return;
    }

    if (coa.some(a => a.code === code)) {
      alert(`Kode akun ${code} sudah ada di dalam sistem.`);
      return;
    }

    const updated = [...coa, { code, name, normal: newNormal }].sort((a, b) =>
      a.code.localeCompare(b.code)
    );

    onUpdateCoa(updated);
    setNewCode('');
    setNewName('');
    setSuccessMsg(`Akun ${code} - ${name} berhasil ditambahkan.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteAccount = (code: string) => {
    const usage = usageMap[code] || 0;
    if (usage > 0) {
      alert(`Akun ${code} tidak dapat dihapus karena sudah dipakai dalam ${usage} baris transaksi jurnal.`);
      return;
    }

    if (confirm(`Hapus akun ${code}?`)) {
      onUpdateCoa(coa.filter(a => a.code !== code));
    }
  };

  const handleExportCoa = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(coa, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `KDMP_Master_COA_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredCoa = coa.filter(a => {
    const q = search.toLowerCase();
    return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Account */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-3">
          Tambah Akun Baru ke Master Bagan Akun (COA)
        </h3>

        <form onSubmit={handleAddAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Kode Akun (misal: 6.1.9.25)
            </label>
            <input
              type="text"
              placeholder="1.1.1.99"
              value={newCode}
              onChange={(e) => {
                setNewCode(e.target.value);
                const first = e.target.value.charAt(0);
                if (['1', '5', '6', '8'].includes(first)) setNewNormal('Debit');
                else if (['2', '3', '4'].includes(first)) setNewNormal('Kredit');
              }}
              className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Nama Akun Standar Koperasi
            </label>
            <input
              type="text"
              placeholder="Contoh: Beban Pemeliharaan Server & Web"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Saldo Normal
            </label>
            <div className="flex gap-2">
              <select
                value={newNormal}
                onChange={(e) => setNewNormal(e.target.value as NormalBalance)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500 font-semibold text-neutral-800"
              >
                <option value="Debit">Debit</option>
                <option value="Kredit">Kredit</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shrink-0"
              >
                Tambah
              </button>
            </div>
          </div>
        </form>

        {successMsg && (
          <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Account Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 bg-neutral-50/50 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari kode atau nama akun..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-rose-500"
              />
            </div>
            <span className="text-xs text-neutral-500">
              Total: <b>{filteredCoa.length}</b> akun
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCoa}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor COA (.json)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-rose-900 text-white font-semibold">
                <th className="py-2.5 px-4 w-32">Kode Akun</th>
                <th className="py-2.5 px-4">Nama Akun</th>
                <th className="py-2.5 px-4 w-32">Saldo Normal</th>
                <th className="py-2.5 px-4 w-36 text-center">Dipakai di Jurnal</th>
                <th className="py-2.5 px-4 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCoa.map(a => {
                const count = usageMap[a.code] || 0;
                return (
                  <tr key={a.code} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-4 font-mono font-bold text-neutral-800">{a.code}</td>
                    <td className="py-2 px-4 text-neutral-900 font-medium">{a.name}</td>
                    <td className="py-2 px-4 font-semibold text-neutral-700">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        a.normal === 'Debit' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {a.normal}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center font-mono">
                      {count > 0 ? (
                        <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-800 font-bold">
                          {count} baris
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">Belum dipakai</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {count === 0 && (
                        <button
                          onClick={() => handleDeleteAccount(a.code)}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Hapus akun belum dipakai"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
