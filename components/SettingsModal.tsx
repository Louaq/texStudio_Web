"use client";

import { useEffect, useState } from "react";
import type { RecognitionModel } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/settings";

interface Props {
  open: boolean;
  onClose: () => void;
  /** 保存后回调 (用于刷新配置状态) */
  onSaved?: () => void;
}

const MODELS: { value: RecognitionModel; label: string; hint: string }[] = [
  { value: "turbo", label: "轻量模型", hint: "更快，免费额度更高 (约 1000 次)" },
  { value: "standard", label: "标准模型", hint: "更准，免费额度约 500 次" },
];

export function SettingsModal({ open, onClose, onSaved }: Props) {
  const [token, setToken] = useState("");
  const [model, setModel] = useState<RecognitionModel>("turbo");
  const [show, setShow] = useState(false);

  // 打开时载入已保存的值
  useEffect(() => {
    if (open) {
      const s = getSettings();
      setToken(s.token);
      setModel(s.model);
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    saveSettings({ token: token.trim(), model });
    onSaved?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">设置</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Token */}
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          SimpleTex Token
        </label>
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="粘贴你的 UAT Token"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="shrink-0 rounded-md border border-slate-200 px-3 text-xs text-slate-500 hover:bg-slate-50"
          >
            {show ? "隐藏" : "显示"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          在{" "}
          <a
            href="https://simpletex.cn/user/center"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            simpletex.cn 用户中心
          </a>{" "}
          → “用户授权令牌” 创建。仅保存在本浏览器 Cookie 中。
        </p>

        {/* 模型 */}
        <label className="mb-1.5 mt-4 block text-sm font-medium text-slate-700">
          识别模型
        </label>
        <div className="space-y-2">
          {MODELS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setModel(m.value)}
              className={[
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition",
                model === m.value
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              <span>
                <span className="text-sm font-medium text-slate-800">{m.label}</span>
                <span className="ml-2 text-xs text-slate-400">{m.hint}</span>
              </span>
              <span
                className={[
                  "h-4 w-4 shrink-0 rounded-full border-2",
                  model === m.value ? "border-brand-500 bg-brand-500" : "border-slate-300",
                ].join(" ")}
              />
            </button>
          ))}
        </div>

        {/* 操作 */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
