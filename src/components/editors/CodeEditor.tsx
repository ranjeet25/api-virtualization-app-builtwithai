'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Wand2, FileCode, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'json' | 'xml';
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
  templates?: { label: string; content: string }[];
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false,
  minHeight = '240px',
  className,
  templates = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate on value change
  useEffect(() => {
    if (!value.trim()) {
      setValidationError(null);
      return;
    }

    if (language === 'json') {
      try {
        JSON.parse(value);
        setValidationError(null);
      } catch (err: any) {
        setValidationError(err.message || 'Malformed JSON');
      }
    } else {
      // Basic XML tag mismatch check
      const openTags = (value.match(/<[a-zA-Z0-9_:-]+(?:\s+[^>]*)?>/g) || []).filter(
        (t) => !t.endsWith('/>') && !t.startsWith('<?') && !t.startsWith('<!--')
      );
      const closeTags = value.match(/<\/[a-zA-Z0-9_:-]+>/g) || [];
      if (openTags.length > 0 && closeTags.length === 0) {
        setValidationError('Missing closing XML tags');
      } else {
        setValidationError(null);
      }
    }
  }, [value, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    if (language === 'json') {
      try {
        const parsed = JSON.parse(value);
        onChange(JSON.stringify(parsed, null, 2));
      } catch {}
    } else {
      // Basic XML indent formatting
      let formatted = '';
      let indent = 0;
      const lines = value.replace(/>\s*</g, '>\n<').split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        formatted += '  '.repeat(indent) + trimmed + '\n';
        if (
          trimmed.startsWith('<') &&
          !trimmed.startsWith('</') &&
          !trimmed.endsWith('/>') &&
          !trimmed.startsWith('<?') &&
          !trimmed.startsWith('<!--')
        ) {
          indent++;
        }
      });
      onChange(formatted.trim());
    }
  };

  // Line numbering
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 6);

  return (
    <div className={cn('flex flex-col rounded border border-border bg-[#070b12] overflow-hidden', className)}>
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#090d16] border-b border-border text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <FileCode className={cn('w-3.5 h-3.5', language === 'json' ? 'text-indigo-400' : 'text-cyan-400')} />
            <span className="uppercase font-bold">{language} Payload</span>
          </div>

          {/* Validation badge */}
          {validationError ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" />
              <span>Syntax Error</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              <Check className="w-3 h-3" />
              <span>Valid {language.toUpperCase()}</span>
            </span>
          )}
        </div>

        {/* Toolbar action buttons */}
        <div className="flex items-center gap-1.5">
          {templates.length > 0 && !readOnly && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-slate-900 border border-border text-[11px] font-mono text-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>
                Insert Preset Template...
              </option>
              {templates.map((tpl, i) => (
                <option key={i} value={tpl.content}>
                  {tpl.label}
                </option>
              ))}
            </select>
          )}

          {!readOnly && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleFormat}
              className="text-slate-400 hover:text-white"
              title="Prettify formatting"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              <span>Format</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="text-slate-400 hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex flex-1 overflow-auto font-mono text-[12px] leading-relaxed" style={{ minHeight }}>
        {/* Line Numbers Gutter */}
        <div
          aria-hidden="true"
          className="select-none py-2 px-2.5 text-right bg-[#060a10] border-r border-border text-slate-600 font-mono text-[11px]"
          style={{ minWidth: '40px' }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-[20px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className={cn(
            'flex-1 w-full bg-transparent text-slate-200 p-2 font-mono text-[12px] leading-[20px] resize-none focus:outline-none focus:ring-0 border-0',
            readOnly ? 'cursor-default text-slate-300' : 'cursor-text'
          )}
          style={{ minHeight }}
        />
      </div>

      {validationError && (
        <div className="px-3 py-1 bg-rose-950/60 border-t border-rose-500/30 text-[11px] font-mono text-rose-300 truncate">
          Error: {validationError}
        </div>
      )}
    </div>
  );
};
