"use client";

import { Fund, formatAUM } from "@/types/fund";

interface HeaderProps {
  funds: Fund[];
  dataLoaded?: boolean;
}

export default function Header({ funds, dataLoaded }: HeaderProps) {
  const totalAUM = funds.reduce((sum, f) => sum + f.aum, 0);

  return (
    <header className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 md:p-6 pointer-events-none">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
          Tokenized RWA Visualizer
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-0.5">
          Top 20 institutional tokenized funds on public blockchains
        </p>
      </div>

      <div className="text-right">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5 flex items-center justify-end gap-2">
          Total AUM
          {dataLoaded && (
            <span style={{ color: '#22c55e', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                           border: '1px solid #22c55e', borderRadius: 3, padding: '1px 4px' }}>
              LIVE
            </span>
          )}
        </div>
        <div className="text-xl md:text-2xl font-bold text-cyan-400 tabular-nums">
          {formatAUM(totalAUM)}
        </div>
        <div className="text-xs text-gray-500">{funds.length} funds tracked</div>
      </div>
    </header>
  );
}
