/**
 * SimpleTex 公式识别 API 封装 (仅在服务端调用, token 不会下发到浏览器)
 * 文档: https://doc.simpletex.cn/zh/api/api_formula_recognition.html
 */
import type { RecognitionModel, RecognitionResult } from "./types";

const ENDPOINTS: Record<RecognitionModel, string> = {
  standard: "https://server.simpletex.cn/api/latex_ocr",
  turbo: "https://server.simpletex.cn/api/latex_ocr_turbo",
};

/** SimpleTex 原始返回结构 (单文件) */
interface SimpleTexRaw {
  status: boolean;
  res?: { latex?: string; conf?: number };
  request_id?: string;
  message?: string;
  err_info?: string;
}

export class SimpleTexError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "SimpleTexError";
    this.code = code;
  }
}

export interface RecognizeOptions {
  token: string;
  model: RecognitionModel;
  /** 图片二进制 */
  file: Blob;
  /** 文件名 (form-data 需要) */
  filename: string;
}

/**
 * 调用 SimpleTex 识别一张图片, 返回标准化结果。
 * 失败时抛出 SimpleTexError。
 */
export async function recognizeFormula(
  opts: RecognizeOptions
): Promise<RecognitionResult> {
  const { token, model, file, filename } = opts;
  const url = ENDPOINTS[model] ?? ENDPOINTS.turbo;

  const form = new FormData();
  form.append("file", file, filename);

  let raw: SimpleTexRaw;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { token },
      body: form,
    });
    raw = (await resp.json()) as SimpleTexRaw;
  } catch (e) {
    throw new SimpleTexError(
      "无法连接到 SimpleTex 服务，请检查网络后重试。",
      "NETWORK_ERROR"
    );
  }

  if (!raw.status) {
    const reason = raw.err_info || raw.message || "识别失败";
    throw new SimpleTexError(translateError(reason), reason);
  }

  const latex = raw.res?.latex?.trim();
  if (!latex) {
    throw new SimpleTexError("未能从图片中识别出公式，请尝试更清晰的图片。", "EMPTY_RESULT");
  }

  return {
    latex,
    conf: typeof raw.res?.conf === "number" ? raw.res.conf : 0,
    requestId: raw.request_id,
  };
}

/** 把常见上游错误码翻译成中文提示 */
function translateError(code: string): string {
  const map: Record<string, string> = {
    exceed_max_qps: "请求过于频繁，请稍后再试。",
    exceed_max_times: "今日免费额度已用尽。",
    image_missing: "未检测到上传的图片。",
    sever_closed: "SimpleTex 服务暂时不可用。",
    no_file_error: "未检测到上传的图片。",
    invalid_resource: "鉴权失败，请在设置中检查 Token 是否正确。",
  };
  return map[code] || `识别失败 (${code})`;
}
