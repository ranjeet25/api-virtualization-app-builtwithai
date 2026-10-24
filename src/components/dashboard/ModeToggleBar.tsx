'use client';

import React from 'react';
import { ServiceMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Radio, ShieldAlert, GitFork } from 'lucide-react';

interface ModeToggleBarProps {
  currentMode: ServiceMode;
  onChange: (mode: ServiceMode) => void;
  size?: 'sm' | 'md';
}

export const ModeToggleBar: React.FC<ModeToggleBarProps> = ({
  currentMode,
  onChange,
  size = 'md',
}) => {
  const modes: { id: ServiceMode; label: string; icon: React.ElementType }[] = [
    { id: 'PROXY', label: 'PROXY', icon: Radio },
    { id: 'MOCK', label: 'MOCK', icon: ShieldAlert },
    { id: 'FALLBACK', label: 'AUTO-FALLBACK', icon: GitFork },
  ];

  return (
    <div className="inline-flex items-center p-0.5 rounded bg-[#090d16] border border-border">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;

        let activeStyles = '';
        if (isActive) {
          if (m.id === 'PROXY') {
            activeStyles =
              'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)] font-semibold';
          } else if (m.id === 'MOCK') {
            activeStyles =
              'bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)] font-bold';
          } else {
            activeStyles =
              'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)] font-semibold';
          }
        } else {
          activeStyles = 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent';
        }

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              'flex items-center gap-1.5 rounded font-mono uppercase tracking-wider transition-all duration-150 select-none',
              size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-[11px]',
              activeStyles
            )}
          >
            <Icon
              className={cn(
                'shrink-0',
                size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5',
                isActive && m.id === 'PROXY' && 'text-emerald-400 animate-pulse',
                isActive && m.id === 'MOCK' && 'text-rose-400',
                isActive && m.id === 'FALLBACK' && 'text-amber-400'
              )}
            />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
