import React from 'react';
import { 
  FileCode2,
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Scale, 
  TrendingUp, 
  Landmark, 
  Coins, 
  Building, 
  Package, 
  GitMerge, 
  Settings2 
} from 'lucide-react';
import { UnitType } from '../types/accounting';

export type TabKey = 
  | 'modularViewer'
  | 'blueprint'
  | 'dashboard'
  | 'journal'
  | 'ledger'
  | 'trialBalance'
  | 'profitLoss'
  | 'balanceSheet'
  | 'cashFlow'
  | 'fixedAssets'
  | 'inventory'
  | 'consolidation'
  | 'coa';

interface NavigationProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  activeUnit: UnitType;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, activeUnit }) => {
  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; hide?: boolean }[] = [
    {
      key: 'modularViewer',
      label: 'Modul JS Vanilla (Pilihan A)',
      icon: FileCode2,
      badge: 'Hasil Refactor'
    },
    {
      key: 'blueprint',
      label: 'Blueprint Open Source',
      icon: Sparkles,
      badge: 'Solusi Komunitas'
    },

    {
      key: 'dashboard',
      label: 'Ringkasan',
      icon: LayoutDashboard
    },
    {
      key: 'journal',
      label: 'Jurnal Umum',
      icon: BookOpen,
      hide: activeUnit === 'KONSOL'
    },
    {
      key: 'ledger',
      label: 'Buku Besar',
      icon: Layers,
      hide: activeUnit === 'KONSOL'
    },
    {
      key: 'trialBalance',
      label: 'Neraca Saldo',
      icon: Scale,
      hide: activeUnit === 'KONSOL'
    },
    {
      key: 'profitLoss',
      label: 'Laba Rugi',
      icon: TrendingUp
    },
    {
      key: 'balanceSheet',
      label: 'Neraca Keuangan',
      icon: Landmark
    },
    {
      key: 'cashFlow',
      label: 'Arus Kas',
      icon: Coins,
      hide: activeUnit === 'KONSOL'
    },
    {
      key: 'fixedAssets',
      label: 'BP Aset Tetap',
      icon: Building,
      hide: activeUnit === 'KONSOL'
    },
    {
      key: 'inventory',
      label: 'BP Persediaan',
      icon: Package,
      hide: activeUnit === 'USP'
    },
    {
      key: 'consolidation',
      label: 'Konsolidasi',
      icon: GitMerge,
      hide: activeUnit !== 'KONSOL'
    },
    {
      key: 'coa',
      label: 'Master Akun (COA)',
      icon: Settings2
    }
  ];

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-[95px] z-20 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-1">
          {tabs.filter(t => !t.hide).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isBlueprint = tab.key === 'blueprint';

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? isBlueprint
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-neutral-900 text-white shadow-xs'
                    : isBlueprint
                    ? 'text-rose-700 hover:bg-rose-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isBlueprint ? 'text-rose-600' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
