import React from 'react';
import { cn } from '@/lib/utils';
import { Protocol, ServiceMode } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'proxy' | 'mock' | 'fallback' | 'rest' | 'soap' | 'outline' | 'muted';
  className?: string;
  size?: 'sm' | 'md' | 'xs';
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  size = 'xs',
  withDot = false,
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 font-medium leading-none tracking-wider',
    sm: 'text-[11px] px-2.5 py-0.5 font-medium leading-tight',
    md: 'text-xs px-3 py-1 font-medium',
  };

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    proxy: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30',
    mock: 'bg-rose-950/40 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    fallback: 'bg-amber-950/40 text-amber-400 border border-amber-500/30',
    rest: 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 font-semibold',
    soap: 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-semibold',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
    muted: 'bg-slate-900/60 text-slate-400 border border-slate-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono uppercase transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {withDot && (
        <span className="relative flex h-1.5 w-1.5">
          {variant === 'proxy' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          {variant === 'mock' && (
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          )}
          {variant === 'fallback' && (
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-1.5 w-1.5',
              variant === 'proxy' && 'bg-emerald-400',
              variant === 'mock' && 'bg-rose-500',
              variant === 'fallback' && 'bg-amber-400',
              variant === 'rest' && 'bg-indigo-400',
              variant === 'soap' && 'bg-cyan-400',
              variant === 'default' && 'bg-slate-400'
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};

export const ModeBadge: React.FC<{ mode: ServiceMode; className?: string }> = ({ mode, className }) => {
  if (mode === 'PROXY') {
    return (
      <Badge variant="proxy" withDot className={className}>
        Proxy Live
      </Badge>
    );
  }
  if (mode === 'MOCK') {
    return (
      <Badge variant="mock" withDot className={className}>
        Mock Active
      </Badge>
    );
  }
  return (
    <Badge variant="fallback" withDot className={className}>
      Auto-Fallback
    </Badge>
  );
};

export const ProtocolBadge: React.FC<{ protocol: Protocol; className?: string }> = ({ protocol, className }) => {
  return (
    <Badge variant={protocol === 'REST' ? 'rest' : 'soap'} className={className}>
      {protocol}
    </Badge>
  );
};

export const HttpMethodBadge: React.FC<{ method: string; className?: string }> = ({ method, className }) => {
  const m = method.toUpperCase();
  let color = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  if (m === 'POST') color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (m === 'PUT') color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  if (m === 'DELETE') color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  if (m === 'PATCH') color = 'bg-purple-500/10 text-purple-400 border-purple-500/30';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider',
        color,
        className
      )}
    >
      {m}
    </span>
  );
};

export const StatusCodeBadge: React.FC<{ code: number; className?: string }> = ({ code, className }) => {
  let color = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
  if (code >= 300 && code < 400) color = 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30';
  if (code >= 400 && code < 500) color = 'bg-amber-950/40 text-amber-400 border-amber-500/30';
  if (code >= 500) color = 'bg-rose-950/40 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono text-[11px] font-bold px-2 py-0.5 rounded border',
        color,
        className
      )}
    >
      {code}
    </span>
  );
};
