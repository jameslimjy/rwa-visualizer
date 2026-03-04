"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import InfoPanel from "@/components/InfoPanel";
import { Fund, FilterState } from "@/types/fund";
import fundsData from "@/data/funds.json";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Dynamically import the 3D scene to avoid SSR issues with Three.js
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

  const handleSelectFund = useCallback((fund: Fund | null) => {
    setSelectedFund(fund);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFund(null);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Canvas - fills entire viewport */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Scene
            funds={funds}
            selectedFund={selectedFund}
            filters={filters}
            onSelectFund={handleSelectFund}
          />
        </ErrorBoundary>
      </div>

      {/* UI Overlays */}
      <Header funds={funds} />

      <FilterPanel
        funds={funds}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <InfoPanel fund={selectedFund} onClose={handleClosePanel} />

      {/* Hint text - bottom center */}
      {!selectedFund && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <p className="text-gray-600 text-xs text-center">
            Click a crystal to explore · Drag to orbit · Scroll to zoom
          </p>
        </div>
      )}
    </main>
  );
}
