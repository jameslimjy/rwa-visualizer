"use client";

import {
  Fund,
  ASSET_CLASS_COLORS,
  ASSET_CLASS_LABELS,
  formatAUM,
} from "@/types/fund";

interface InfoPanelProps {
  fund: Fund | null;
  onClose: () => void;
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627eea",
  Polygon: "#8247e5",
  Avalanche: "#e84142",
  Solana: "#9945ff",
  Stellar: "#7ae2d4",
  Arbitrum: "#28a0f0",
  Optimism: "#ff0420",
  Aptos: "#2dd8a3",
  Base: "#0052ff",
  Tron: "#ff0013",
  Hedera: "#3ec8c8",
  Figure: "#5b21b6",
};

const UTILITY_ICONS: Record<string, string> = {
  default: "◆",
  collateral: "🏦",
  swap: "⇄",
  redeem: "↩",
  transfer: "↗",
  trade: "📈",
  yield: "💰",
  settle: "✓",
  mint: "⊕",
};

function getUtilityIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("collateral")) return "🏦";
  if (lower.includes("swap") || lower.includes("uniswap")) return "⇄";
  if (lower.includes("redeem")) return "↩";
  if (lower.includes("transfer") || lower.includes("p2p")) return "↗";
  if (lower.includes("trade") || lower.includes("market")) return "📈";
  if (lower.includes("yield") || lower.includes("earn")) return "💰";
  if (lower.includes("settle")) return "✓";
  if (lower.includes("mint")) return "⊕";
  if (lower.includes("24/7")) return "🔄";
  return "◆";
}

export default function InfoPanel({ fund, onClose }: InfoPanelProps) {
  if (!fund) return null;

  const color = ASSET_CLASS_COLORS[fund.assetClass];

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="fixed inset-0 z-20 md:hidden"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.5)" }}
      />

      <div
        className="fixed right-0 top-0 bottom-0 z-30 w-full md:w-96 overflow-y-auto"
        style={{
          background: "var(--panel-bg)",
          borderLeft: "1px solid var(--panel-border)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ background: color }} />

        <div className="p-5 md:p-6">
          {/* Close + Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 mr-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-2xl md:text-3xl font-black tracking-tight"
                  style={{ color }}
                >
                  {fund.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                >
                  {ASSET_CLASS_LABELS[fund.assetClass]}
                </span>
              </div>
              <div className="text-sm text-gray-400 leading-tight">{fund.fullName}</div>
              <div className="text-xs text-gray-500 mt-0.5">{fund.issuer}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors text-xl leading-none mt-1 flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* AUM */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: `${color}11`, border: `1px solid ${color}33` }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              Assets Under Management
            </div>
            <div className="text-3xl font-black tabular-nums" style={{ color }}>
              {formatAUM(fund.aum)}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            {fund.description}
          </p>

          {/* Chains */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Deployed on
            </div>
            <div className="flex flex-wrap gap-2">
              {fund.chains.map((chain) => (
                <span
                  key={chain}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: `${CHAIN_COLORS[chain] ?? "#ffffff"}22`,
                    color: CHAIN_COLORS[chain] ?? "#ffffff",
                    border: `1px solid ${CHAIN_COLORS[chain] ?? "#ffffff"}44`,
                  }}
                >
                  {chain}
                </span>
              ))}
            </div>
          </div>

          {/* Tokenization Provider */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Tokenization Provider
            </div>
            <span
              className="text-sm px-3 py-1.5 rounded-lg font-medium inline-block"
              style={{
                background: "rgba(168,85,247,0.15)",
                color: "#a855f7",
                border: "1px solid rgba(168,85,247,0.3)",
              }}
            >
              {fund.tokenizationProvider}
            </span>
          </div>

          {/* Utilities */}
          {fund.utilities.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Special Features
              </div>
              <div className="space-y-2">
                {fund.utilities.map((utility) => (
                  <div
                    key={utility.label}
                    className="rounded-lg p-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base leading-none">
                        {getUtilityIcon(utility.label)}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {utility.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed pl-6">
                      {utility.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link */}
          <a
            href={fund.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: color,
              color: "#000000",
            }}
          >
            Visit Official Site
            <span>↗</span>
          </a>

          <p className="text-xs text-gray-600 mt-3 text-center">
            Data approximate. Not financial advice.
          </p>
        </div>
      </div>
    </>
  );
}
