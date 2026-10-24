'use client';

import React, { useState } from 'react';
import { Service } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Flame, X, ShieldAlert, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChaosModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceId: string, enabled: boolean, rate: number, statusCode: number) => void;
}

export const ChaosModal: React.FC<ChaosModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(service.chaosEnabled);
  const [rate, setRate] = useState(service.chaosRate);
  const [statusCode, setStatusCode] = useState(service.chaosStatusCode);

  if (!isOpen) return null;

  const statusCodes = [
    { code: 500, label: '500 Internal Server Error' },
    { code: 502, label: '502 Bad Gateway' },
    { code: 503, label: '503 Service Unavailable' },
    { code: 504, label: '504 Gateway Timeout' },
    { code: 429, label: '429 Rate Limit Exceeded' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0f172a] border border-border-highlight rounded shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Chaos Fault Injector</h3>
            <p className="text-xs text-slate-400 font-mono">{service.name}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Inject non-deterministic failure states and synthetic server faults directly into the inbound proxy stream to test circuit breakers and fallback resilience.
        </p>

        {/* Master Chaos Toggle */}
        <div className="p-3 bg-[#090d16] rounded border border-border flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className={cn('w-4 h-4', enabled ? 'text-rose-400' : 'text-slate-500')} />
            <span className="text-xs font-semibold text-slate-200">Enable Synthetic Chaos</span>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              enabled ? 'bg-rose-600' : 'bg-slate-700'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                enabled ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Chaos Rate Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-xs font-mono">
            <span className="text-slate-400">FAULT INJECTION PROBABILITY:</span>
            <span className="text-rose-400 font-bold">{rate}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            disabled={!enabled}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>5% (Low Jitter)</span>
            <span>50% (Flapping)</span>
            <span>100% (Hard Outage)</span>
          </div>
        </div>

        {/* Status Code Choice */}
        <div className="mb-6">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Fault Status Code to Return:
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {statusCodes.map((item) => (
              <button
                key={item.code}
                type="button"
                disabled={!enabled}
                onClick={() => setStatusCode(item.code)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition-colors text-left border disabled:opacity-50',
                  statusCode === item.code
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/50 font-bold'
                    : 'bg-[#090d16] text-slate-300 border-border hover:bg-slate-800/60'
                )}
              >
                <span>{item.label}</span>
                {statusCode === item.code && <Check className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={enabled ? 'destructive' : 'primary'}
            size="sm"
            onClick={() => {
              onSave(service.id, enabled, rate, statusCode);
              onClose();
            }}
          >
            Apply Chaos Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
