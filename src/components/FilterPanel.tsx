"use client";

import { useState } from "react";
import {
  Fund,
  FilterState,
  AssetClass,
  ASSET_CLASS_COLORS,
  ASSET_CLASS_LABELS,
} from "@/types/fund";

interface FilterPanelProps {
  funds: Fund[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

function getAllChains(funds: Fund[]): string[] {
  const chains = new Set<string>();
  funds.forEach((f) => f.chains.forEach((c) => chains.add(c)));
  return Array.from(chains).sort();
}

function getAllProviders(funds: Fund[]): string[] {
  const providers = new Set<string>();
  funds.forEach((f) => providers.add(f.tokenizationProvider));
  return Array.from(providers).sort();
}

const ALL_ASSET_CLASSES: AssetClass[] = [
  "money-market",
  "us-treasuries",
  "private-credit",
  "private-equity",
  "commodities",
  "equity",
  "bonds",
];

export default function FilterPanel({
  funds,
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const chains = getAllChains(funds);
  const providers = getAllProviders(funds);

  const hasActiveFilters =
    filters.assetClasses.size > 0 ||
    filters.chains.size > 0 ||
    filters.providers.size > 0;

  function toggleAssetClass(ac: AssetClass) {
    const next = new Set(filters.assetClasses);
    if (next.has(ac)) next.delete(ac);
    else next.add(ac);
    onFiltersChange({ ...filters, assetClasses: next });
  }

  function toggleChain(chain: string) {
    const next = new Set(filters.chains);
    if (next.has(chain)) next.delete(chain);
    else next.add(chain);
    onFiltersChange({ ...filters, chains: next });
  }

  function toggleProvider(provider: string) {
    const next = new Set(filters.providers);
    if (next.has(provider)) next.delete(provider);
    else next.add(provider);
    onFiltersChange({ ...filters, providers: next });
  }

  function clearAll() {
    onFiltersChange({
      assetClasses: new Set(),
      chains: new Set(),
      providers: new Set(),
    });
  }

  return (
    <div className="absolute top-20 left-4 md:left-6 z-10 w-56 md:w-64">
      <div
        className="rounded-xl border"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <button
            className="flex items-center gap-2 text-sm font-semibold text-white"
            onClick={() => setExpanded(!expanded)}
          >
            <span>Filters</span>
            {hasActiveFilters && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                {filters.assetClasses.size + filters.chains.size + filters.providers.size}
              </span>
            )}
            <span className="text-gray-500 text-xs ml-auto">{expanded ? "▲" : "▼"}</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {expanded && (
          <div className="p-3 space-y-4">
            {/* Asset Class */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Asset Class
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ASSET_CLASSES.map((ac) => {
                  const color = ASSET_CLASS_COLORS[ac];
                  const active = filters.assetClasses.has(ac);
                  return (
                    <button
                      key={ac}
                      onClick={() => toggleAssetClass(ac)}
                      className="text-xs px-2 py-1 rounded-full border transition-all font-medium"
                      style={{
                        borderColor: color,
                        color: active ? "#000" : color,
                        background: active ? color : "transparent",
                        opacity: active ? 1 : 0.7,
                      }}
                    >
                      {ASSET_CLASS_LABELS[ac]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chains */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Chain
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chains.map((chain) => {
                  const active = filters.chains.has(chain);
                  return (
                    <button
                      key={chain}
                      onClick={() => toggleChain(chain)}
                      className="text-xs px-2 py-1 rounded-full border transition-all"
                      style={{
                        borderColor: active ? "#fff" : "rgba(255,255,255,0.2)",
                        color: active ? "#fff" : "#9ca3af",
                        background: active ? "rgba(255,255,255,0.15)" : "transparent",
                      }}
                    >
                      {chain}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Tokenization Provider
              </div>
              <div className="flex flex-wrap gap-1.5">
                {providers.map((provider) => {
                  const active = filters.providers.has(provider);
                  return (
                    <button
                      key={provider}
                      onClick={() => toggleProvider(provider)}
                      className="text-xs px-2 py-1 rounded-full border transition-all"
                      style={{
                        borderColor: active ? "#a855f7" : "rgba(168,85,247,0.3)",
                        color: active ? "#a855f7" : "#9ca3af",
                        background: active ? "rgba(168,85,247,0.15)" : "transparent",
                      }}
                    >
                      {provider}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="mt-3 rounded-xl border p-3"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Size = AUM
        </div>
        <div className="text-xs text-gray-500">
          Crystal size scales logarithmically with assets under management.
        </div>
      </div>
    </div>
  );
}
