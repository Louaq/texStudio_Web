/**
 * 共享类型定义 —— 前后端通用
 */

/** 可选的识别模型 */
export type RecognitionModel = "standard" | "turbo";

/** 单条公式识别结果 */
export interface RecognitionResult {
  /** 识别出的 LaTeX 公式 */
  latex: string;
  /** 置信度 0~1 */
  conf: number;
  /** SimpleTex 请求 ID, 便于排查问题 */
  requestId?: string;
}

/** /api/recognize 成功响应 */
export interface RecognizeSuccess {
  ok: true;
  data: RecognitionResult;
}

/** /api/recognize 失败响应 */
export interface RecognizeError {
  ok: false;
  /** 面向用户的错误信息 */
  message: string;
  /** 上游错误码 (若有) */
  code?: string;
}

export type RecognizeResponse = RecognizeSuccess | RecognizeError;
