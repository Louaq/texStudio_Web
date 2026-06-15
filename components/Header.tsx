import Image from "next/image";

interface Props {
  onOpenSettings: () => void;
  /** 是否已配置 Token (未配置时按钮高亮提示) */
  configured: boolean;
}

export function Header({ onOpenSettings, configured }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon-256.png"
            alt="textStudio"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-lg"
          />
          <div className="leading-tight">
            <h1 className="text-base font-semibold text-slate-900">textStudio</h1>
            <p className="text-xs text-slate-500">数学公式识别 · 图片转 LaTeX / Word</p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className={[
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
            configured
              ? "border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600"
              : "border-brand-300 bg-brand-50 text-brand-600 hover:bg-brand-100",
          ].join(" ")}
        >
          <GearIcon className="h-4 w-4" />
          {configured ? "设置" : "设置 Token"}
        </button>
      </div>
    </header>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
