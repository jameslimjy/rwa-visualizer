export type AssetClass =
  | "money-market"
  | "us-treasuries"
  | "private-credit"
  | "private-equity"
  | "commodities"
  | "equity"
  | "bonds";

export interface FundUtility {
  label: string;
  description: string;
}

export interface Fund {
  id: string;
  name: string;
  fullName: string;
  issuer: string;
  aum: number;
  assetClass: AssetClass;
  chains: string[];
  tokenizationProvider: string;
  utilities: FundUtility[];
  website: string;
  description: string;
}

export interface FilterState {
  assetClasses: Set<AssetClass>;
  chains: Set<string>;
  providers: Set<string>;
}

export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  "money-market": "#00d4ff",
  "us-treasuries": "#4ade80",
  "private-credit": "#f97316",
  "private-equity": "#a855f7",
  commodities: "#eab308",
  equity: "#ec4899",
  bonds: "#6366f1",
};

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  "money-market": "Money Market",
  "us-treasuries": "US Treasuries",
  "private-credit": "Private Credit",
  "private-equity": "Private Equity",
  commodities: "Commodities",
  equity: "Equity",
  bonds: "Bonds",
};

export function formatAUM(aum: number): string {
  if (aum >= 1_000_000_000) {
    return `$${(aum / 1_000_000_000).toFixed(1)}B`;
  }
  if (aum >= 1_000_000) {
    return `$${(aum / 1_000_000).toFixed(0)}M`;
  }
  return `$${(aum / 1_000).toFixed(0)}K`;
}

export function getCrystalScale(aum: number): number {
  return Math.log10(aum / 1_000_000) * 0.4 + 0.3;
}
