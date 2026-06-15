"use client";

import { useEffect, useRef, useState } from "react";
import type { RecognitionResult } from "@/lib/types";
import { FormulaPreview } from "./FormulaPreview";
import { copyLatex, copyAsWordFormula, type MathMode } from "@/lib/clipboard";

interface Props {
  result: RecognitionResult;
}

export function ResultPanel({ result }: Props) {
  const [latex, setLatex] = useState(result.latex);

  const confPct = Math.round((result.conf ?? 0) * 100);
  const barColor =
    confPct >= 80 ? "bg-emerald-500" : confPct >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 公式预览 */}
      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2">
        <FormulaPreview latex={latex} />
      </div>

      {/* 复制 */}
      <div className="flex flex-wrap items-center gap-2">
        <CopyMenu label="复制 LaTeX" onCopy={(mode) => copyLatex(latex, mode)} />
        <CopyButton label="复制 MathML（Word）" onCopy={() => copyAsWordFormula(latex, "display")} />
      </div>

      {/* LaTeX 源码 */}
      <textarea
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:border-brand-400"
      />

      {/* 置信度 */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>识别置信度</span>
          <span>{confPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${confPct}%` }} />
        </div>
      </div>
    </div>
  );
}

/** 普通复制按钮：点击直接复制 */
function CopyButton({ label, onCopy }: { label: string; onCopy: () => Promise<void> }) {
  const [done, setDone] = useState(false);
  const click = async () => {
    await onCopy();
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <button
      onClick={click}
      className="rounded-md border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
    >
      {done ? "已复制" : label}
    </button>
  );
}

const OPTIONS: { mode: MathMode; label: string; delim: string }[] = [
  { mode: "inline", label: "行内", delim: "$…$" },
  { mode: "display", label: "独立", delim: "$$…$$" },
];

/** 带下拉的复制按钮：点击展开 行内 $…$ / 独立 $$…$$，选中即复制 */
function CopyMenu({
  label,
  onCopy,
}: {
  label: string;
  onCopy: (mode: MathMode) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = async (mode: MathMode) => {
    setOpen(false);
    await onCopy(mode);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
      >
        {done ? "已复制" : label}
        <Chevron className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {OPTIONS.map((o) => (
            <button
              key={o.mode}
              onClick={() => pick(o.mode)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <span>{o.label}</span>
              <span className="font-mono text-xs text-slate-400">{o.delim}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
