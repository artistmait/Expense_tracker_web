import { ArrowUpRight, Plus } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export function StocksPortfolio({ stocks, onAddStock }) {
  const totalStockValue = stocks.reduce((acc, s) => acc + (s.shares * s.currentPrice), 0);
  const totalStockCost = stocks.reduce((acc, s) => acc + (s.shares * s.avgPrice), 0);
  const totalGain = totalStockValue - totalStockCost;
  const totalGainPercent = ((totalGain / totalStockCost) * 100).toFixed(2);

  return (
    <Card
      title="Stock Portfolio & Wealth Assets"
      subtitle="Real-time market valuation and asset allocation"
      action={
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={onAddStock}
        >
          Add Ticker
        </Button>
      }
    >
      {/* Portfolio Value Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white mb-6">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Stock Equity</span>
          <p className="text-xl font-bold mt-0.5 text-white">
            ${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Unrealized P&L</span>
          <p className="text-xl font-bold mt-0.5 text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            +${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total ROI</span>
          <p className="text-xl font-bold mt-0.5 text-[#4BB8FA]">
            +{totalGainPercent}%
          </p>
        </div>
      </div>

      {/* Asset Allocation Distribution Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Portfolio Distribution</span>
          <span className="text-slate-400 font-normal">Equities & ETFs</span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden flex gap-0.5 bg-slate-100">
          <div className="h-full bg-[#2C5EAD] transition-all" style={{ width: '32%' }} title="NVDA: 32%" />
          <div className="h-full bg-[#1591DC] transition-all" style={{ width: '25%' }} title="AAPL: 25%" />
          <div className="h-full bg-[#4BB8FA] transition-all" style={{ width: '22%' }} title="MSFT: 22%" />
          <div className="h-full bg-[#C4E2F5] transition-all" style={{ width: '21%' }} title="VOO: 21%" />
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2C5EAD]" /> NVDA (32%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1591DC]" /> AAPL (25%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4BB8FA]" /> MSFT (22%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C4E2F5]" /> VOO (21%)</span>
        </div>
      </div>

      {/* Stock Ticker List */}
      <div className="divide-y divide-slate-100">
        {stocks.map((stock) => {
          const isPositive = stock.isPositive;
          const totalHoldingValue = stock.shares * stock.currentPrice;

          return (
            <div
              key={stock.symbol}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
            >
              {/* Ticker & Shares */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C4E2F5]/50 border border-[#1591DC]/30 flex items-center justify-center font-bold text-xs text-[#2C5EAD]">
                  {stock.symbol}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {stock.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {stock.shares} shares @ ${stock.avgPrice.toFixed(2)} avg
                  </p>
                </div>
              </div>

              {/* Sparkline & Current Price */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-16 h-6 flex items-end gap-0.5">
                  {stock.sparkline.map((p, idx) => (
                    <div
                      key={idx}
                      className={`w-2 rounded-t-xs ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ height: `${((p - Math.min(...stock.sparkline) + 10) / (Math.max(...stock.sparkline) - Math.min(...stock.sparkline) + 15)) * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Price & Delta */}
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">
                  ${stock.currentPrice.toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1 text-[11px] font-semibold mt-0.5">
                  <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                    {isPositive ? '+' : ''}{stock.changePercent}%
                  </span>
                  <span className="text-slate-400 font-normal">
                    (${totalHoldingValue.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
