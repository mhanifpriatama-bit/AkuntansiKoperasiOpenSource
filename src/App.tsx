import React, { useState, useEffect } from 'react';
import { 
  AppState, 
  CooperativeProfile, 
  FixedAsset, 
  InventoryItem, 
  InventoryMutation, 
  JournalRow, 
  UnitType 
} from './types/accounting';
import { 
  INITIAL_COA, 
  INITIAL_PROFILE, 
  SAMPLE_ASSETS, 
  SAMPLE_INVENTORY_ITEMS, 
  SAMPLE_INVENTORY_MUTATIONS, 
  SAMPLE_SEMBAKO_ROWS, 
  SAMPLE_USP_ROWS, 
  MONTH_NAMES 
} from './data/initialData';
import { calculateBalances } from './services/accountingEngine';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { JournalView } from './components/JournalView';
import { LedgerView } from './components/LedgerView';
import { TrialBalanceView } from './components/TrialBalanceView';
import { ProfitLossView } from './components/ProfitLossView';
import { BalanceSheetView } from './components/BalanceSheetView';
import { CashFlowView } from './components/CashFlowView';
import { FixedAssetsView } from './components/FixedAssetsView';
import { InventoryView } from './components/InventoryView';
import { ConsolidationView } from './components/ConsolidationView';
import { CoaView } from './components/CoaView';
import { OpenSourceBlueprintView } from './components/OpenSourceBlueprintView';
import { ModularRefactorViewer } from './components/ModularRefactorViewer';
import { BackupModal } from './components/BackupModal';

const STORAGE_KEY = 'kdmp_accounting_state_v2';

export default function App() {
  const getInitialState = (): AppState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not parse saved state:', e);
    }

    return {
      periodMonth: 11,
      periodYear: 2026,
      activeUnit: 'USP',
      profile: INITIAL_PROFILE,
      units: {
        USP: {
          rows: SAMPLE_USP_ROWS,
          assets: SAMPLE_ASSETS,
          inventoryItems: [],
          inventoryMutations: []
        },
        Sembako: {
          rows: SAMPLE_SEMBAKO_ROWS,
          assets: SAMPLE_ASSETS.filter(a => a.kat === 'Bangunan'),
          inventoryItems: SAMPLE_INVENTORY_ITEMS,
          inventoryMutations: SAMPLE_INVENTORY_MUTATIONS
        }
      },
      coa: INITIAL_COA,
      customEliminations: {
        neraca: {},
        labaRugiMonth: {},
        labaRugiYtd: {}
      }
    };
  };

  const [state, setState] = useState<AppState>(getInitialState);
  const [activeTab, setActiveTab] = useState<TabKey>('modularViewer');
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  const activeUnit = state.activeUnit;
  const currentUnitData = activeUnit === 'Sembako' ? state.units.Sembako : state.units.USP;

  // Calculate balances for USP, Sembako, and Consolidated
  const uspBalances = calculateBalances(
    state.units.USP.rows,
    state.periodMonth,
    state.periodYear,
    state.coa
  );

  const sembakoBalances = calculateBalances(
    state.units.Sembako.rows,
    state.periodMonth,
    state.periodYear,
    state.coa
  );

  // Combined rows for consolidation
  const combinedRows = [...state.units.USP.rows, ...state.units.Sembako.rows];
  const konsolBalances = calculateBalances(
    combinedRows,
    state.periodMonth,
    state.periodYear,
    state.coa
  );

  const currentBalances = activeUnit === 'KONSOL' 
    ? konsolBalances 
    : activeUnit === 'Sembako' 
    ? sembakoBalances 
    : uspBalances;

  const journalDifference = Math.round(currentBalances.totalDebit - currentBalances.totalCredit);
  const isJournalBalanced = Math.abs(journalDifference) === 0;

  // Handlers
  const handleUpdateJournalRows = (newRows: JournalRow[]) => {
    setState(prev => {
      const unitKey = prev.activeUnit === 'Sembako' ? 'Sembako' : 'USP';
      return {
        ...prev,
        units: {
          ...prev.units,
          [unitKey]: {
            ...prev.units[unitKey],
            rows: newRows
          }
        }
      };
    });
  };

  const handleUpdateAssets = (newAssets: FixedAsset[]) => {
    setState(prev => {
      const unitKey = prev.activeUnit === 'Sembako' ? 'Sembako' : 'USP';
      return {
        ...prev,
        units: {
          ...prev.units,
          [unitKey]: {
            ...prev.units[unitKey],
            assets: newAssets
          }
        }
      };
    });
  };

  const handleGenerateDepreciationJournal = (entries: JournalRow[]) => {
    setState(prev => {
      const unitKey = prev.activeUnit === 'Sembako' ? 'Sembako' : 'USP';
      return {
        ...prev,
        units: {
          ...prev.units,
          [unitKey]: {
            ...prev.units[unitKey],
            rows: [...prev.units[unitKey].rows, ...entries]
          }
        }
      };
    });
  };

  const handleUpdateInventoryItems = (items: InventoryItem[]) => {
    setState(prev => ({
      ...prev,
      units: {
        ...prev.units,
        Sembako: {
          ...prev.units.Sembako,
          inventoryItems: items
        }
      }
    }));
  };

  const handleUpdateInventoryMutations = (mutations: InventoryMutation[]) => {
    setState(prev => ({
      ...prev,
      units: {
        ...prev.units,
        Sembako: {
          ...prev.units.Sembako,
          inventoryMutations: mutations
        }
      }
    }));
  };

  const handleUpdateCoa = (newCoa: any[]) => {
    setState(prev => ({ ...prev, coa: newCoa }));
  };

  const handleUpdateCustomElimination = (code: string, value: number) => {
    setState(prev => ({
      ...prev,
      customEliminations: {
        ...prev.customEliminations,
        neraca: {
          ...prev.customEliminations.neraca,
          [code]: value
        }
      }
    }));
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      periodMonth: 11,
      periodYear: 2026,
      activeUnit: 'USP',
      profile: INITIAL_PROFILE,
      units: {
        USP: {
          rows: SAMPLE_USP_ROWS,
          assets: SAMPLE_ASSETS,
          inventoryItems: [],
          inventoryMutations: []
        },
        Sembako: {
          rows: SAMPLE_SEMBAKO_ROWS,
          assets: SAMPLE_ASSETS.filter(a => a.kat === 'Bangunan'),
          inventoryItems: SAMPLE_INVENTORY_ITEMS,
          inventoryMutations: SAMPLE_INVENTORY_MUTATIONS
        }
      },
      coa: INITIAL_COA,
      customEliminations: {
        neraca: {},
        labaRugiMonth: {},
        labaRugiYtd: {}
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 font-sans antialiased flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* Top Application Header */}
      <Header
        profile={state.profile}
        activeUnit={state.activeUnit}
        setActiveUnit={(u) => {
          setState(prev => ({ ...prev, activeUnit: u }));
          if (u === 'KONSOL' && ['journal', 'ledger', 'trialBalance', 'fixedAssets'].includes(activeTab)) {
            setActiveTab('consolidation');
          }
        }}
        periodMonth={state.periodMonth}
        setPeriodMonth={(m) => setState(prev => ({ ...prev, periodMonth: m }))}
        periodYear={state.periodYear}
        setPeriodYear={(y) => setState(prev => ({ ...prev, periodYear: y }))}
        isJournalBalanced={isJournalBalanced}
        journalDifference={journalDifference}
        onOpenBackup={() => setIsBackupOpen(true)}
        onPrint={handlePrint}
      />

      {/* Navigation Tab Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUnit={state.activeUnit}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modular Vanilla JS View */}
        {activeTab === 'modularViewer' && (
          <ModularRefactorViewer />
        )}

        {/* Open Source Community Blueprint View */}
        {activeTab === 'blueprint' && (
          <OpenSourceBlueprintView />
        )}

        {/* Financial Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            activeUnit={state.activeUnit}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            balances={currentBalances}
            uspBalances={uspBalances}
            sembakoBalances={sembakoBalances}
            profile={state.profile}
            recentRows={currentUnitData.rows}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* General Journal */}
        {activeTab === 'journal' && (
          <JournalView
            rows={currentUnitData.rows}
            coa={state.coa}
            activeUnit={state.activeUnit}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            onUpdateRows={handleUpdateJournalRows}
          />
        )}

        {/* General Ledger */}
        {activeTab === 'ledger' && (
          <LedgerView
            rows={currentUnitData.rows}
            coa={state.coa}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
          />
        )}

        {/* Trial Balance */}
        {activeTab === 'trialBalance' && (
          <TrialBalanceView
            balances={currentBalances}
            coa={state.coa}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            profile={state.profile}
          />
        )}

        {/* Profit and Loss */}
        {activeTab === 'profitLoss' && (
          <ProfitLossView
            balances={currentBalances}
            coa={state.coa}
            activeUnit={state.activeUnit}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            profile={state.profile}
          />
        )}

        {/* Balance Sheet */}
        {activeTab === 'balanceSheet' && (
          <BalanceSheetView
            balances={currentBalances}
            coa={state.coa}
            activeUnit={state.activeUnit}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            profile={state.profile}
          />
        )}

        {/* Cash Flow */}
        {activeTab === 'cashFlow' && (
          <CashFlowView
            balances={currentBalances}
            activeUnit={state.activeUnit}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            profile={state.profile}
          />
        )}

        {/* Fixed Assets */}
        {activeTab === 'fixedAssets' && (
          <FixedAssetsView
            assets={currentUnitData.assets}
            activeUnit={state.activeUnit}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            onUpdateAssets={handleUpdateAssets}
            onGenerateDepreciationJournal={handleGenerateDepreciationJournal}
          />
        )}

        {/* Inventory */}
        {activeTab === 'inventory' && (
          <InventoryView
            items={state.units.Sembako.inventoryItems}
            mutations={state.units.Sembako.inventoryMutations}
            coa={state.coa}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            onUpdateItems={handleUpdateInventoryItems}
            onUpdateMutations={handleUpdateInventoryMutations}
          />
        )}

        {/* Consolidation */}
        {activeTab === 'consolidation' && (
          <ConsolidationView
            uspBalances={uspBalances}
            sembakoBalances={sembakoBalances}
            coa={state.coa}
            periodMonth={state.periodMonth}
            periodYear={state.periodYear}
            profile={state.profile}
            customEliminations={state.customEliminations.neraca}
            onUpdateCustomElimination={handleUpdateCustomElimination}
          />
        )}

        {/* Master Chart of Accounts */}
        {activeTab === 'coa' && (
          <CoaView
            coa={state.coa}
            allRows={combinedRows}
            onUpdateCoa={handleUpdateCoa}
          />
        )}

        {/* Official Signatures for Audits and Prints */}
        {['trialBalance', 'profitLoss', 'balanceSheet', 'cashFlow', 'consolidation'].includes(activeTab) && (
          <div className="mt-10 pt-6 border-t border-neutral-200 print:block">
            <div className="text-right text-xs text-neutral-600 mb-6 font-medium">
              {state.profile.city}, {new Date(state.periodYear, state.periodMonth, 0).getDate()} {MONTH_NAMES[state.periodMonth - 1]} {state.periodYear}
            </div>

            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <span className="text-neutral-500 font-medium block">Petugas Akuntansi:</span>
                <div className="h-16" />
                <span className="font-bold text-neutral-900 border-b border-neutral-900 pb-0.5">
                  {state.profile.accountant || '.........................'}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-medium block">Bendahara Koperasi:</span>
                <div className="h-16" />
                <span className="font-bold text-neutral-900 border-b border-neutral-900 pb-0.5">
                  {state.profile.treasurer || '.........................'}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-medium block">Ketua Koperasi:</span>
                <div className="h-16" />
                <span className="font-bold text-neutral-900 border-b border-neutral-900 pb-0.5">
                  {state.profile.chairman || '.........................'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Backup and Profile Modal */}
      {isBackupOpen && (
        <BackupModal
          appState={state}
          onRestoreState={(restored) => setState(restored)}
          onResetDemo={handleResetDemo}
          onUpdateProfile={(p) => setState(prev => ({ ...prev, profile: p }))}
          onClose={() => setIsBackupOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200/80 py-4 text-center text-xs text-neutral-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {state.profile.name} &bull; {state.profile.village} ({state.profile.city})
          </span>
          <span className="text-neutral-400">
            KDMP Open Core v2.0 &bull; Siap Dikembangkan Bersama Komunitas Open Source
          </span>
        </div>
      </footer>
    </div>
  );
}
