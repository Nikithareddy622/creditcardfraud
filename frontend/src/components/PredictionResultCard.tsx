import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Activity, ListChecks } from 'lucide-react';
import { FraudPredictionResult } from '../types';

interface PredictionResultCardProps {
  result: FraudPredictionResult;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({ result }) => {
  const isFraud = result.prediction === 'Fraud' || result.prediction === 'Fraudulent' || result.riskScore >= 50;

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-2xl transition-all duration-300 ${
        isFraud
          ? 'bg-gradient-to-b from-red-950/40 via-gray-900 to-gray-950 border-red-500/40 shadow-red-900/20'
          : 'bg-gradient-to-b from-emerald-950/40 via-gray-900 to-gray-950 border-emerald-500/40 shadow-emerald-900/20'
      }`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              isFraud
                ? 'bg-red-600/20 border-red-500/40 text-red-400'
                : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
            }`}
          >
            {isFraud ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-black ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                {isFraud ? '⚠ Fraudulent Transaction Detected' : '✓ Legitimate Transaction'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              AI Behavioral Fraud Engine Assessment • Score: {result.riskScore}/100
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border tracking-wider ${getRiskBadgeColor(result.riskLevel)}`}>
            {result.riskLevel} Risk Tier
          </span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-gray-800">
        <div className="bg-gray-950/70 p-3.5 rounded-xl border border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Risk Score</p>
          <p className={`text-xl font-black mt-1 ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
            {result.riskScore} <span className="text-xs text-gray-500 font-normal">/ 100</span>
          </p>
        </div>

        <div className="bg-gray-950/70 p-3.5 rounded-xl border border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fraud Probability</p>
          <p className="text-xl font-black text-white mt-1">
            {(result.fraudProbability * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-gray-950/70 p-3.5 rounded-xl border border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Model Confidence</p>
          <p className="text-xl font-black text-blue-400 mt-1">
            {result.confidence}%
          </p>
        </div>

        <div className="bg-gray-950/70 p-3.5 rounded-xl border border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Recommended Action</p>
          <p className={`text-xs font-bold mt-2 ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
            {result.recommendedAction}
          </p>
        </div>
      </div>

      {/* AI Explanation / Reason List */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
          <ListChecks className="w-4 h-4 text-blue-400" />
          <span>AI Explanation & Behavioral Anomaly Breakdown</span>
        </div>

        <ul className="space-y-2">
          {result.reason.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-xs text-gray-300 bg-gray-950/50 p-2.5 rounded-xl border border-gray-800/80"
            >
              {isFraud ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
