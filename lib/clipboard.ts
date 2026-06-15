/**
 * 复制工具 —— 把 LaTeX 公式复制到剪贴板。
 *
 * - 复制 LaTeX: 纯文本，按所选模式包裹分隔符：
 *     行内公式 -> $...$        独立公式 -> $$...$$
 * - 复制 Word 公式: 复制 MathML，粘贴到 Word / WPS 后会自动转换为可二次编辑的公式。
 *   (LaTeX --temml--> MathML，带命名空间，便于 Word 识别)
 */
import temml from "temml";

/** 公式排版模式 */
export type MathMode = "inline" | "display";

/** 按模式给裸 LaTeX 包裹分隔符 */
export function wrapLatex(latex: string, mode: MathMode): string {
  const body = latex.trim();
  return mode === "display" ? `$$${body}$$` : `$${body}$`;
}

/** LaTeX -> 带命名空间的 MathML (供 Word 识别为公式) */
export function latexToMathML(latex: string, mode: MathMode = "display"): string {
  return temml.renderToString(latex, {
    throwOnError: false,
    xml: true,
    displayMode: mode === "display",
  });
}

/** 复制纯文本到剪贴板 */
export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

/** 按模式复制 LaTeX（带 $ / $$ 分隔符） */
export async function copyLatex(latex: string, mode: MathMode): Promise<void> {
  await copyText(wrapLatex(latex, mode));
}

/**
 * 复制为 Word 公式：把 MathML 写入剪贴板。
 * 优先用 ClipboardItem 写入 (兼容性更好)，失败时回退到纯文本写入。
 */
export async function copyAsWordFormula(latex: string, mode: MathMode = "display"): Promise<void> {
  const mathml = latexToMathML(latex, mode);
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const item = new ClipboardItem({
        "text/plain": new Blob([mathml], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
      return;
    }
  } catch {
    // 退回到 writeText
  }
  await navigator.clipboard.writeText(mathml);
}
