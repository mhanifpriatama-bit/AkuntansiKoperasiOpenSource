export type NormalBalance = 'Debit' | 'Kredit';

export interface AccountCOA {
  code: string;
  name: string;
  normal: NormalBalance;
  category?: string;
}

export interface JournalRow {
  id: string;
  d: string; // YYYY-MM-DD
  no: string; // Bukti transaksi
  ak: string; // "1.1.1.01 Kas Tunai"
  db: number;
  kr: number;
  ket: string;
  kom?: string; // Komponen arus kas
}

export type UnitType = 'USP' | 'Sembako' | 'KONSOL';

export interface FixedAsset {
  id: string;
  kode: string;
  nama: string;
  kat: string; // Tanah, Bangunan, Peralatan dan Mesin, Meubelair, Rak, Inventaris, Kendaraan, Tabung Gas
  tgl: string; // YYYY-MM-DD
  hp: number; // Harga perolehan
  res: number; // Nilai residu
  umur: number; // Umur ekonomis tahun
  met: 'Garis Lurus' | 'Saldo Menurun';
  lepas?: string; // Tgl pelepasan
}

export interface InventoryItem {
  k: string; // Kode barang
  n: string; // Nama barang
  akun: string; // Akun Buku Besar, e.g. "1.1.4.01"
  satuan?: string;
}

export interface InventoryMutation {
  id: string;
  d: string;
  no: string;
  k: string; // Kode barang
  j: 'Saldo Awal' | 'Masuk' | 'Keluar';
  q: number; // Kuantitas
  h: number; // Harga per unit (masuk/saldo awal)
  ket: string;
}

export interface CooperativeProfile {
  name: string;
  village: string;
  address: string;
  city: string;
  accountant: string;
  treasurer: string;
  chairman: string;
  logoUrl?: string;
}

export interface UnitData {
  rows: JournalRow[];
  assets: FixedAsset[];
  inventoryItems: InventoryItem[];
  inventoryMutations: InventoryMutation[];
  eliminasi?: Record<string, number>;
}

export interface AppState {
  periodMonth: number;
  periodYear: number;
  activeUnit: UnitType;
  profile: CooperativeProfile;
  units: {
    USP: UnitData;
    Sembako: UnitData;
  };
  coa: AccountCOA[];
  customEliminations: {
    neraca: Record<string, number>;
    labaRugiMonth: Record<string, number>;
    labaRugiYtd: Record<string, number>;
  };
}

export interface CalculatedBalances {
  cum: Record<string, number>;
  cumA: Record<string, number>;
  mon: Record<string, number>;
  dr: Record<string, number>;
  kr: Record<string, number>;
  kom: Record<string, number>;
  openCash: number;
  totalDebit: number;
  totalCredit: number;
  shuTotal: number;
  shuMonth: number;
}
