"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import InfoPanel from "@/components/InfoPanel";
import { Fund, FilterState, formatAUM } from "@/types/fund";
import fundsData from "@/data/funds.json";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div
          className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "#00d4ff", borderTopColor: "transparent" }}
        />
        <p className="text-gray-500 text-sm">Loading visualization...</p>
      </div>
    </div>
  ),
});

const funds = fundsData as Fund[];

const initialFilters: FilterState = {
  assetClasses: new Set(),
  chains: new Set(),
  providers: new Set(),
};

export default function Home() {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hoveredFund, setHoveredFund] = useState<{ fund: Fund; chain: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleSelectFund = useCallback((fund: Fund | null) => {
    setSelectedFund(fund);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFund(null);
  }, []);

  const handleHoverFund = useCallback((data: { fund: Fund; chain: string } | null) => {
    setHoveredFund(data);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-black"
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* 3D Canvas — fills entire viewport */}
      <div className="absolute inset-0">
        <Scene
          funds={funds}
          selectedFund={selectedFund}
          filters={filters}
          onSelectFund={handleSelectFund}
          onHoverFund={handleHoverFund}
        />
      </div>

      {/* UI Overlays */}
      <Header funds={funds} />

      <FilterPanel
        funds={funds}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <InfoPanel fund={selectedFund} onClose={handleClosePanel} />

      {/* Arc hover tooltip */}
      {hoveredFund && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x + 14,
            top: mousePos.y - 10,
            background: 'rgba(5,10,26,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '10px 14px',
            color: 'white',
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 100,
            maxWidth: 220,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14 }}>{hoveredFund.fund.name}</div>
          <div style={{ color: '#9ca3af', marginBottom: 6 }}>{hoveredFund.fund.issuer}</div>
          <div>💰 {formatAUM(hoveredFund.fund.aum)}</div>
          <div>⛓️ {hoveredFund.chain}</div>
          <div>🏷️ {hoveredFund.fund.assetClass.replace(/-/g, ' ')}</div>
          <div>🔧 {hoveredFund.fund.tokenizationProvider}</div>
          {hoveredFund.fund.utilities[0] && (
            <div style={{ color: '#60a5fa', marginTop: 4 }}>
              ✨ {hoveredFund.fund.utilities[0].label}
            </div>
          )}
        </div>
      )}

      {/* Hint text */}
      {!selectedFund && !hoveredFund && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <p className="text-gray-600 text-xs text-center">
            Hover an arc for fund info · Click to explore · Drag to orbit · Scroll to zoom
          </p>
        </div>
      )}
    </main>
  );
}
