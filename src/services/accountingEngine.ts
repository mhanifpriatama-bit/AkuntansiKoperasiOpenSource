import { ASSET_CATEGORIES } from '../data/initialData';
import { AccountCOA, CalculatedBalances, FixedAsset, InventoryItem, InventoryMutation, JournalRow } from '../types/accounting';

export function formatRupiah(val: number | undefined | null, showDashForZero: boolean = true): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  const rounded = Math.round(val);
  if (Math.abs(rounded) < 0.5 && showDashForZero) return '-';
  if (rounded < 0) {
    return `(${Math.abs(rounded).toLocaleString('id-ID')})`;
  }
  return rounded.toLocaleString('id-ID');
}

export function parseNumberId(str: string | number | undefined | null): number {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = String(str).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned.replace(/[^0-9.-]/g, '')) || 0;
}

export function getAccountNormal(code: string, coa: AccountCOA[]): 'Debit' | 'Kredit' {
  const acc = coa.find(a => a.code === code);
  if (acc) return acc.normal;
  const first = code.charAt(0);
  if (['1', '5', '6', '8'].includes(first) || (first === '9' && code.charAt(2) !== '1')) {
    return 'Debit';
  }
  return 'Kredit';
}

export function ymOf(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split('-');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 12 + parseInt(parts[1], 10);
}

export function calculateBalances(
  rows: JournalRow[],
  targetMonth: number,
  targetYear: number,
  coa: AccountCOA[]
): CalculatedBalances {
  const targetPeriod = targetYear * 12 + targetMonth;

  const cum: Record<string, number> = {};
  const cumA: Record<string, number> = {};
  const mon: Record<string, number> = {};
  const dr: Record<string, number> = {};
  const kr: Record<string, number> = {};
  const kom: Record<string, number> = {};
  let openCash = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  rows.forEach(r => {
    if (!r.d) return;
    const parts = r.d.split('-');
    const rowYear = parseInt(parts[0], 10);
    const rowMonth = parseInt(parts[1], 10);
    const rowPeriod = rowYear * 12 + rowMonth;

    if (rowPeriod > targetPeriod) return;

    const code = (r.ak || '').split(' ')[0].trim();
    const dVal = Number(r.db) || 0;
    const kVal = Number(r.kr) || 0;

    // Total debit credit only within current period
    if (rowPeriod === targetPeriod) {
      totalDebit += dVal;
      totalCredit += kVal;
    }

    if (!code) return;
    const normal = getAccountNormal(code, coa);
    const pos = normal === 'Debit' ? dVal - kVal : kVal - dVal;

    cumA[code] = (cumA[code] || 0) + pos;

    const firstChar = code.charAt(0);
    // Balance sheet accounts (1, 2, 3) carry over; P&L accounts (4..9) accumulate in current year only
    if (['1', '2', '3'].includes(firstChar) || rowYear === targetYear) {
      cum[code] = (cum[code] || 0) + pos;
      dr[code] = (dr[code] || 0) + dVal;
      kr[code] = (kr[code] || 0) + kVal;
    }

    if (rowPeriod === targetPeriod) {
      mon[code] = (mon[code] || 0) + pos;
    }

    if (r.kom && rowYear === targetYear) {
      kom[r.kom] = (kom[r.kom] || 0) + pos;
    }

    if (code.startsWith('1.1.1.') && (rowYear < targetYear || /saldo awal/i.test(r.ket || ''))) {
      openCash += pos;
    }
  });

  // Calculate Net Income (SHU)
  const calcShuFromMap = (map: Record<string, number>) => {
    let shu = 0;
    Object.keys(map).forEach(c => {
      const x = c.charAt(0);
      const isRevenue = x === '4' || x === '7' || c.startsWith('9.1');
      const isExpense = ['5', '6', '8'].includes(x) || c.startsWith('9.2') || c.startsWith('9.3');
      if (isRevenue) shu += map[c] || 0;
      else if (isExpense) shu -= map[c] || 0;
    });
    return shu;
  };

  const shuTotal = calcShuFromMap(cumA);
  const shuMonth = calcShuFromMap(mon);

  return {
    cum,
    cumA,
    mon,
    dr,
    kr,
    kom,
    openCash,
    totalDebit,
    totalCredit,
    shuTotal,
    shuMonth
  };
}

export interface DepreciationResult {
  asset: FixedAsset;
  isActive: boolean;
  cost: number;
  monthlyExpense: number;
  ytdExpense: number;
  accumulated: number;
  bookValue: number;
  status: string;
}

export function calculateDepreciation(
  assets: FixedAsset[],
  targetMonth: number,
  targetYear: number
): {
  items: DepreciationResult[];
  totals: { cost: number; monthly: number; ytd: number; accum: number; bookValue: number };
  categorySummary: Record<string, { cost: number; monthly: number; ytd: number; accum: number; bookValue: number }>;
} {
  const currentPeriod = targetYear * 12 + targetMonth;
  const yearStartPeriod = targetYear * 12;

  const items: DepreciationResult[] = [];
  const totals = { cost: 0, monthly: 0, ytd: 0, accum: 0, bookValue: 0 };
  const categorySummary: Record<string, { cost: number; monthly: number; ytd: number; accum: number; bookValue: number }> = {};

  const calcAccumAt = (a: FixedAsset, period: number): number => {
    const cost = a.hp || 0;
    const residual = Math.min(a.res || 0, cost);
    const monthsLife = Math.round((a.umur || 0) * 12);
    const cat = ASSET_CATEGORIES[a.kat];

    if (!a.tgl || !cost || monthsLife <= 0 || !cat || !cat.accum) return 0;

    const acqPeriod = ymOf(a.tgl);
    const endPeriod = a.lepas ? Math.min(period, ymOf(a.lepas)) : period;
    const elapsed = Math.max(0, Math.min(endPeriod - acqPeriod + 1, monthsLife));

    if (a.met === 'Saldo Menurun') {
      const rate = 2 / (monthsLife / 12) / 12;
      return cost - Math.max(residual, cost * Math.pow(1 - rate, elapsed));
    }
    // Straight line
    return ((cost - residual) * elapsed) / monthsLife;
  };

  assets.forEach(a => {
    const acqPeriod = ymOf(a.tgl);
    const isAcquired = !!a.tgl && acqPeriod <= currentPeriod;
    const isDisposedBefore = !!a.lepas && ymOf(a.lepas) < currentPeriod;
    const isActive = isAcquired && !isDisposedBefore;

    const prevAccum = isActive ? Math.round(calcAccumAt(a, currentPeriod - 1)) : 0;
    const currAccum = isActive ? Math.round(calcAccumAt(a, currentPeriod)) : 0;
    const monthlyExpense = currAccum - prevAccum;
    const yearStartAccum = isActive ? Math.round(calcAccumAt(a, yearStartPeriod)) : 0;
    const ytdExpense = isActive ? prevAccum - yearStartAccum : 0;
    const bookValue = isActive ? (a.hp || 0) - currAccum : 0;

    let status = 'Aktif';
    if (!a.tgl) status = '-';
    else if (acqPeriod > currentPeriod) status = 'Belum diperoleh';
    else if (isDisposedBefore) status = 'Dilepas';

    const res: DepreciationResult = {
      asset: a,
      isActive,
      cost: isActive ? a.hp || 0 : 0,
      monthlyExpense,
      ytdExpense,
      accumulated: currAccum,
      bookValue,
      status
    };

    items.push(res);

    if (isActive) {
      totals.cost += res.cost;
      totals.monthly += res.monthlyExpense;
      totals.ytd += res.ytdExpense;
      totals.accum += res.accumulated;
      totals.bookValue += res.bookValue;

      const katName = a.kat || 'Lainnya';
      if (!categorySummary[katName]) {
        categorySummary[katName] = { cost: 0, monthly: 0, ytd: 0, accum: 0, bookValue: 0 };
      }
      categorySummary[katName].cost += res.cost;
      categorySummary[katName].monthly += res.monthlyExpense;
      categorySummary[katName].ytd += res.ytdExpense;
      categorySummary[katName].accum += res.accumulated;
      categorySummary[katName].bookValue += res.bookValue;
    }
  });

  return { items, totals, categorySummary };
}

export interface StockCardRow {
  date: string;
  no: string;
  type: string;
  note: string;
  inQty: number;
  inPrice: number;
  outQty: number;
  outCost: number;
  balanceQty: number;
  avgPrice: number;
  balanceValue: number;
}

export interface InventoryCalculation {
  itemSummaries: Record<string, {
    item: InventoryItem;
    openingQty: number;
    inQty: number;
    inValue: number;
    outQty: number;
    outValue: number;
    closingQty: number;
    closingValue: number;
    avgPrice: number;
  }>;
  stockCards: Record<string, StockCardRow[]>;
  accountTotals: Record<string, number>;
  totalValue: number;
}

export function calculateInventory(
  items: InventoryItem[],
  mutations: InventoryMutation[],
  targetMonth: number,
  targetYear: number
): InventoryCalculation {
  const currentPeriod = targetYear * 12 + targetMonth;
  const currentPeriodDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-31`;

  const itemMap: Record<string, {
    item: InventoryItem;
    q: number;
    v: number;
    inQtyMonth: number;
    inValMonth: number;
    outQtyMonth: number;
    outValMonth: number;
    openingQty: number;
  }> = {};

  const stockCards: Record<string, StockCardRow[]> = {};

  items.forEach(it => {
    itemMap[it.k] = {
      item: it,
      q: 0,
      v: 0,
      inQtyMonth: 0,
      inValMonth: 0,
      outQtyMonth: 0,
      outValMonth: 0,
      openingQty: 0
    };
    stockCards[it.k] = [];
  });

  const sortedMutations = [...mutations]
    .filter(m => m.d && m.d <= currentPeriodDate && m.k)
    .sort((a, b) => a.d.localeCompare(b.d));

  sortedMutations.forEach(m => {
    const entry = itemMap[m.k];
    if (!entry) return;

    const rowPeriod = ymOf(m.d);
    const qty = Number(m.q) || 0;
    const unitPrice = Number(m.h) || 0;

    let inQty = 0;
    let outQty = 0;
    let cost = 0;

    if (m.j === 'Keluar') {
      const avg = entry.q > 0 ? entry.v / entry.q : 0;
      cost = qty * avg;
      entry.q -= qty;
      entry.v -= cost;
      outQty = qty;
    } else {
      cost = qty * unitPrice;
      entry.q += qty;
      entry.v += cost;
      inQty = qty;
    }

    const currentAvg = entry.q > 0 ? entry.v / entry.q : 0;

    stockCards[m.k].push({
      date: m.d,
      no: m.no,
      type: m.j,
      note: m.ket,
      inQty,
      inPrice: inQty ? unitPrice : 0,
      outQty,
      outCost: outQty ? cost : 0,
      balanceQty: entry.q,
      avgPrice: currentAvg,
      balanceValue: entry.v
    });

    if (rowPeriod < currentPeriod) {
      entry.openingQty = entry.q;
    } else if (rowPeriod === currentPeriod) {
      if (outQty) {
        entry.outQtyMonth += outQty;
        entry.outValMonth += cost;
      } else {
        entry.inQtyMonth += inQty;
        entry.inValMonth += cost;
      }
    }
  });

  const itemSummaries: InventoryCalculation['itemSummaries'] = {};
  const accountTotals: Record<string, number> = {};
  let totalValue = 0;

  Object.values(itemMap).forEach(e => {
    const avgPrice = e.q > 0 ? e.v / e.q : 0;
    itemSummaries[e.item.k] = {
      item: e.item,
      openingQty: e.openingQty,
      inQty: e.inQtyMonth,
      inValue: e.inValMonth,
      outQty: e.outQtyMonth,
      outValue: e.outValMonth,
      closingQty: e.q,
      closingValue: e.v,
      avgPrice
    };

    const accCode = e.item.akun || '1.1.4.01';
    accountTotals[accCode] = (accountTotals[accCode] || 0) + e.v;
    totalValue += e.v;
  });

  return {
    itemSummaries,
    stockCards,
    accountTotals,
    totalValue
  };
}
