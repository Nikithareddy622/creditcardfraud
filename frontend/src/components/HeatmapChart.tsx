import React from 'react';
import { Globe } from 'lucide-react';

interface HeatmapItem {
  country: string;
  count: number;
}

interface HeatmapChartProps {
  data: HeatmapItem[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Geographic Fraud Intensity Heatmap</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item, idx) => {
          const intensityRatio = item.count / maxCount;
          let colorBg = 'bg-blue-500/10 border-blue-500/20 text-blue-300';
          let barBg = 'bg-blue-500';

          if (intensityRatio > 0.7) {
            colorBg = 'bg-red-500/15 border-red-500/30 text-red-300';
            barBg = 'bg-red-500';
          } else if (intensityRatio > 0.4) {
            colorBg = 'bg-amber-500/15 border-amber-500/30 text-amber-300';
            barBg = 'bg-amber-500';
          }

          return (
            <div key={idx} className={`p-3 rounded-xl border ${colorBg} transition-all duration-200`}>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span>{item.country}</span>
                <span className="font-mono">{item.count} alerts</span>
              </div>
              <div className="w-full bg-gray-900/60 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barBg} transition-all duration-500`}
                  style={{ width: `${Math.max(intensityRatio * 100, 12)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
