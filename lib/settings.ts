/**
 * 前端设置 —— SimpleTex Token 与识别模型，缓存在 Cookie 中。
 * Cookie 会随同源请求自动发送到 /api/recognize，由服务端读取转发给 SimpleTex。
 */
import type { RecognitionModel } from "./types";

export const COOKIE_TOKEN = "st_token";
export const COOKIE_MODEL = "st_model";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 年

export interface AppSettings {
  token: string;
  model: RecognitionModel;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const prefix = name + "=";
  const hit = document.cookie
    .split("; ")
    .find((c) => c.startsWith(prefix));
  return hit ? decodeURIComponent(hit.slice(prefix.length)) : "";
}

function writeCookie(name: string, value: string) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
}

/** 读取当前设置 (无值时 model 默认 turbo) */
export function getSettings(): AppSettings {
  const model = readCookie(COOKIE_MODEL);
  return {
    token: readCookie(COOKIE_TOKEN),
    model: model === "standard" ? "standard" : "turbo",
  };
}

/** 保存设置到 Cookie */
export function saveSettings(s: AppSettings) {
  writeCookie(COOKIE_TOKEN, s.token);
  writeCookie(COOKIE_MODEL, s.model);
}

/** 是否已配置 Token */
export function isConfigured(): boolean {
  return getSettings().token.length > 0;
}
