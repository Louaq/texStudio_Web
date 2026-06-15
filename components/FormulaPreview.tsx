"use client";

import { useMemo } from "react";
import katex from "katex";

interface Props {
  latex: string;
  /** true=独立公式($$), false=行内公式($) */
  displayMode?: boolean;
}

/** 用 KaTeX 把 LaTeX 渲染为可视公式; 出错时回退显示原始文本 */
export function FormulaPreview({ latex, displayMode = true }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: "html",
      });
    } catch {
      return "";
    }
  }, [latex, displayMode]);

  if (!html) {
    return (
      <div className="flex h-[88px] items-center justify-center text-sm text-rose-500">
        无法渲染该公式预览。
      </div>
    );
  }

  return (
    <div
      className="flex h-[88px] items-center justify-center overflow-auto text-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
