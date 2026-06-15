"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  /** 用户选定一张图片后回调 */
  onSelect: (file: File) => void;
  /** 是否处于识别中 (禁用交互) */
  busy?: boolean;
  /** 当前已选图片的预览 URL */
  previewUrl?: string | null;
}

/** 支持点击选择 / 拖拽 / 粘贴 的图片上传区 */
export function UploadArea({ onSelect, busy, previewUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && file.type.startsWith("image/")) onSelect(file);
    },
    [onSelect]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = Array.from(e.clipboardData.items).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) onSelect(file);
    },
    [onSelect]
  );

  return (
    <div
      tabIndex={0}
      onPaste={onPaste}
      onClick={() => !busy && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!busy) pick(e.dataTransfer.files);
      }}
      className={[
        "group relative flex h-[420px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center transition",
        dragOver ? "border-brand-400 bg-brand-50" : "border-slate-300 bg-slate-50/60 hover:border-brand-300 hover:bg-slate-50",
        busy ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/bmp"
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="待识别图片"
          className="max-h-full max-w-full rounded object-contain"
        />
      ) : (
        <>
          <CloudUploadIcon className="mb-3 h-11 w-11 text-slate-300" />
          <p className="text-sm text-slate-600">
            将图片拖到此处，或<span className="text-brand-600">点击上传</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            支持 Ctrl+V 粘贴 · PNG / JPG / WEBP / BMP · 最大 8MB
          </p>
        </>
      )}

      {busy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
          <span className="text-sm text-slate-500">识别中…</span>
        </div>
      )}
    </div>
  );
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 18a4 4 0 0 1-.9-7.9 5 5 0 0 1 9.6-1.2A3.5 3.5 0 0 1 18 18H7Z" />
      <path d="M12 13v6" />
      <path d="m9 15 3-3 3 3" />
    </svg>
  );
}
