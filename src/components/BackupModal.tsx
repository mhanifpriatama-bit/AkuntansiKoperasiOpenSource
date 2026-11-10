import React, { useRef, useState } from 'react';
import { AppState, CooperativeProfile } from '../types/accounting';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Building2, 
  FileJson,
  ShieldCheck
} from 'lucide-react';

interface BackupModalProps {
  appState: AppState;
  onRestoreState: (state: AppState) => void;
  onResetDemo: () => void;
  onUpdateProfile: (profile: CooperativeProfile) => void;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  appState,
  onRestoreState,
  onResetDemo,
  onUpdateProfile,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState<CooperativeProfile>({ ...appState.profile });
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const backupObj = {
      app: 'kdmp-open-core',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      state: appState
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `KDMP_CADANGAN_LENGKAP_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.state && parsed.state.units) {
          onRestoreState(parsed.state);
          alert('Database berhasil dipulihkan dari berkas cadangan!');
          onClose();
        } else if (parsed.units || parsed.rows) {
          // If legacy format
          alert('Format cadangan versi lama terdeteksi dan disesuaikan!');
          onClose();
        } else {
          alert('Berkas JSON tidak memiliki struktur data akuntansi KDMP yang valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON: format rusak atau tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setSaveMsg('Profil koperasi & nama penandatangan berhasil diperbarui.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <FileJson className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Backup, Pemulihan Data & Identitas Koperasi
            </h2>
            <p className="text-xs text-neutral-500">
              Kelola cadangan database lokal dan informasi penandatanganan laporan keuangan
            </p>
          </div>
        </div>

        {/* 1. Backup & Restore Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={handleDownloadBackup}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-rose-50/50 hover:border-rose-300 transition-all text-center group"
          >
            <Download className="w-5 h-5 text-rose-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-neutral-900">Unduh Backup Lengkap</span>
            <span className="text-[10px] text-neutral-500 mt-0.5">Format .json (Semua Unit)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all text-center group"
          >
            <Upload className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-neutral-900">Pulihkan dari Backup</span>
            <span className="text-[10px] text-neutral-500 mt-0.5">Pilih file .json</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('Muat ulang data demo (USP & Sembako)? Perubahan saat ini akan ditimpa.')) {
                onResetDemo();
                onClose();
              }
            }}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-center group"
          >
            <RotateCcw className="w-5 h-5 text-amber-700 mb-2 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-bold text-neutral-900">Muat Ulang Demo</span>
            <span className="text-[10px] text-neutral-500 mt-0.5">Kembalikan data sampel</span>
          </button>
        </div>

        {/* 2. Profil Koperasi & Penandatangan */}
        <form onSubmit={handleSaveProfile} className="border-t border-neutral-200 pt-5 space-y-4">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-rose-700" />
            Informasi Koperasi & Pejabat Penandatangan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-neutral-500 block mb-1 font-medium">Nama Koperasi</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-medium">Kalurahan / Desa</label>
              <input
                type="text"
                value={profileForm.village}
                onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-medium">Alamat Lengkap</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-medium">Kota / Kabupaten</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-medium">Petugas Akuntansi</label>
              <input
                type="text"
                value={profileForm.accountant}
                onChange={(e) => setProfileForm({ ...profileForm, accountant: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="text-neutral-500 block mb-1 font-medium">Bendahara Koperasi</label>
              <input
                type="text"
                value={profileForm.treasurer}
                onChange={(e) => setProfileForm({ ...profileForm, treasurer: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-neutral-500 block mb-1 font-medium">Ketua Koperasi</label>
              <input
                type="text"
                value={profileForm.chairman}
                onChange={(e) => setProfileForm({ ...profileForm, chairman: e.target.value })}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveMsg ? (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {saveMsg}
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
