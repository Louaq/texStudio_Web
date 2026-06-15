"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { UploadArea } from "@/components/UploadArea";
import { ResultPanel } from "@/components/ResultPanel";
import { SettingsModal } from "@/components/SettingsModal";
import { getSettings, isConfigured } from "@/lib/settings";
import type { RecognitionModel, RecognitionResult, RecognizeResponse } from "@/lib/types";

const MODEL_LABEL: Record<RecognitionModel, string> = {
  turbo: "轻量",
  standard: "标准",
};

export default function HomePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configured, setConfigured] = useState(true); // 初始假定已配置，避免 SSR 闪烁
  const [model, setModel] = useState<RecognitionModel>("turbo");

  // 首次挂载读取 Cookie 配置
  useEffect(() => {
    const s = getSettings();
    setConfigured(s.token.length > 0);
    setModel(s.model);
  }, []);

  // 释放上一张图片的 object URL, 避免内存泄漏
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const refreshSettings = useCallback(() => {
    const s = getSettings();
    setConfigured(s.token.length > 0);
    setModel(s.model);
  }, []);

  // 清除已识别结果与上传的图片，回到初始状态
  const handleClear = useCallback(() => {
    setResult(null);
    setError(null);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  }, []);

  const handleSelect = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    // 未配置 Token 时，直接打开设置而不调用接口
    if (!isConfigured()) {
      setSettingsOpen(true);
      return;
    }

    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const resp = await fetch("/api/recognize", { method: "POST", body: form });
      const data = (await resp.json()) as RecognizeResponse;
      if (data.ok) {
        setResult(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header configured={configured} onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {!configured && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
            <span>尚未配置 SimpleTex Token，无法识别，请先在设置中填写。</span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              去设置
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
          {/* 识别对象 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-7 items-center justify-between">
              <h2 className="text-[15px] font-medium text-slate-800">识别对象</h2>
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-xs text-slate-500 transition hover:text-brand-600"
              >
                识别模型：{MODEL_LABEL[model]} ⌄
              </button>
            </div>
            <UploadArea onSelect={handleSelect} busy={busy} previewUrl={previewUrl} />
          </section>

          {/* 识别结果 */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-7 items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-medium text-slate-800">识别结果</h2>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                  类型：公式
                </span>
              </div>
              {(result || previewUrl) && (
                <button
                  onClick={handleClear}
                  disabled={busy}
                  className="text-xs text-slate-400 transition hover:text-rose-500 disabled:opacity-50"
                >
                  清除
                </button>
              )}
            </div>

            {/* 固定高度容器, 与上传区一致, 避免占位 ↔ 结果 之间发生重排 */}
            <div className="h-[420px]">
              {result ? (
                <ResultPanel key={result.requestId ?? result.latex} result={result} />
              ) : error ? (
                <div className="flex h-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-center text-sm text-rose-600">
                  {error}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
                  {busy ? "正在识别…" : "识别结果将显示在这里"}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-slate-400">
        textStudio · 公式识别由 SimpleTex 提供
      </footer>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refreshSettings}
      />
    </div>
  );
}
