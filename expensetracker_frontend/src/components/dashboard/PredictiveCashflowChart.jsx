import React, { useState } from 'react';

export const PredictiveCashflowChart = () => {
  const [activePoint, setActivePoint] = useState({
    month: 'Apr',
    inflow: 8150.00,
    outflow: 4202.00,
    x: 48, // percent
    yTop: 42,
    yBottom: 68
  });

  const monthsData = [
    { month: 'Jan', inflow: 5800, outflow: 3400, x: 8, yTop: 60, yBottom: 78 },
    { month: 'Feb', inflow: 6400, outflow: 3900, x: 22, yTop: 54, yBottom: 72 },
    { month: 'Mar', inflow: 7100, outflow: 4100, x: 35, yTop: 48, yBottom: 70 },
    { month: 'Apr', inflow: 8150, outflow: 4202, x: 48, yTop: 38, yBottom: 66 },
    { month: 'May', inflow: 9800, outflow: 4600, x: 62, yTop: 26, yBottom: 64 },
    { month: 'Jun', inflow: 8900, outflow: 4300, x: 75, yTop: 32, yBottom: 65 },
    { month: 'Jul', inflow: 10450, outflow: 4800, x: 92, yTop: 20, yBottom: 60 },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 transition-all border border-slate-200/80 dark:border-[#30363D]">
      
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
            Predictive Cash-Flow & Inflow/Outflow
          </h3>
          <div className="flex items-center space-x-3 mt-1 text-xs">
            <span className="flex items-center space-x-1 font-mono text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4382DF] inline-block" />
              <span>#4382DF (Inflow)</span>
            </span>
            <span className="flex items-center space-x-1 font-mono text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#AACCD6] inline-block" />
              <span>#AACCD6 (Outflow)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Model:</span>
          <span className="bg-[#AACCD6]/20 text-[#112E81] px-2 py-0.5 rounded-md font-semibold text-[11px] border border-[#AACCD6]/50">
            LSTM Neural Net v4.2
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-64 sm:h-72 select-none">
        
        {/* Y-Axis scale numbers */}
        <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pr-2 text-right pointer-events-none">
          <span>$12,000</span>
          <span>$10,000</span>
          <span>$8,000</span>
          <span>$6,000</span>
          <span>$4,000</span>
          <span>$2,000</span>
          <span>$0</span>
        </div>

        {/* Main Chart Graphic */}
        <div className="ml-13 sm:ml-14 h-[calc(100%-24px)] relative">
          
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="w-full border-b border-dashed border-slate-200 dark:border-[#30363D]" />
            <div className="w-full border-b border-dashed border-slate-200 dark:border-[#30363D]" />
            <div className="w-full border-b border-dashed border-slate-200 dark:border-[#30363D]" />
            {/* Forecast Threshold Line */}
            <div className="w-full border-b-2 border-dashed border-slate-300 dark:border-[#4382DF]/30 relative">
              <span className="absolute right-2 -top-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-[#1C2333]/90 px-1 rounded">
                Forecast Threshold
              </span>
            </div>
            <div className="w-full border-b border-dashed border-slate-200 dark:border-[#30363D]" />
            <div className="w-full border-b border-dashed border-slate-200 dark:border-[#30363D]" />
            <div className="w-full border-b border-slate-200 dark:border-[#30363D]" />
          </div>

          {/* SVG Smooth Curves */}
          <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="primaryAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4382DF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#AACCD6" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="secondaryAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#AACCD6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#AACCD6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Inflow Filled Area (#4382DF) */}
            <path
              d="M 0 130 
                 C 70 120, 110 90, 180 80 
                 C 230 70, 260 55, 310 40 
                 C 360 25, 410 45, 450 30 
                 C 475 22, 490 15, 500 10 
                 L 500 200 L 0 200 Z"
              fill="url(#primaryAreaGradient)"
            />

            {/* Inflow Smooth Stroke (#4382DF) */}
            <path
              d="M 0 130 
                 C 70 120, 110 90, 180 80 
                 C 230 70, 260 55, 310 40 
                 C 360 25, 410 45, 450 30 
                 C 475 22, 490 15, 500 10"
              fill="none"
              stroke="#4382DF"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Outflow Smooth Stroke (#AACCD6) */}
            <path
              d="M 0 160 
                 C 60 150, 120 145, 180 140 
                 C 240 135, 300 130, 360 125 
                 C 420 120, 460 125, 500 115"
              fill="none"
              stroke="#AACCD6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Selected Active Marker vertical indicator line */}
            <line
              x1={`${(activePoint.x / 100) * 500}`}
              y1="10"
              x2={`${(activePoint.x / 100) * 500}`}
              y2="200"
              stroke="#4382DF"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />

            {/* Active Points */}
            <circle
              cx={`${(activePoint.x / 100) * 500}`}
              cy={`${(activePoint.yTop / 100) * 200}`}
              r="5"
              fill="#4382DF"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <circle
              cx={`${(activePoint.x / 100) * 500}`}
              cy={`${(activePoint.yBottom / 100) * 200}`}
              r="4.5"
              fill="#AACCD6"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>

          {/* Interactive Floating Tooltip matching Reference screenshot */}
          <div
            className="absolute -top-3 z-30 transition-all duration-200 pointer-events-none -translate-x-1/2"
            style={{ left: `${activePoint.x}%` }}
          >
            <div className="bg-white/95 dark:bg-[#1C2333]/95 backdrop-blur-md rounded-lg shadow-xl border border-[#4382DF]/40 p-2 text-center whitespace-nowrap">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {activePoint.month} Forecast
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold mt-0.5">
                <span className="text-[#AACCD6] font-extrabold">${activePoint.outflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-[#4382DF] font-extrabold">${activePoint.inflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Clickable month hover zones */}
          <div className="absolute inset-0 flex justify-between z-20">
            {monthsData.map((d) => (
              <div
                key={d.month}
                onMouseEnter={() => setActivePoint(d)}
                onClick={() => setActivePoint(d)}
                className="flex-1 h-full cursor-pointer hover:bg-slate-50/10 dark:hover:bg-white/5 transition-colors"
                title={`${d.month}: Inflow $${d.inflow} | Outflow $${d.outflow}`}
              />
            ))}
          </div>

        </div>

        {/* X-Axis Month labels */}
        <div className="ml-13 sm:ml-14 h-6 flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
          {monthsData.map((d) => (
            <span
              key={d.month}
              className={`cursor-pointer transition-colors ${
                activePoint.month === d.month ? 'text-[#4382DF] font-bold' : 'hover:text-[#112E81] dark:hover:text-[#AACCD6]'
              }`}
              onClick={() => setActivePoint(d)}
            >
              {d.month}
            </span>
          ))}
        </div>

      </div>

    </div>
  );
};
