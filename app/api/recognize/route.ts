/**
 * POST /api/recognize
 * 服务端代理: 接收浏览器上传的图片, 携带服务端保存的 token 转发给 SimpleTex,
 * 再把标准化结果返回前端。token 永远不会下发到浏览器。
 */
import { NextRequest, NextResponse } from "next/server";
import { recognizeFormula, SimpleTexError } from "@/lib/simpletex";
import type { RecognitionModel, RecognizeResponse } from "@/lib/types";
import { COOKIE_TOKEN, COOKIE_MODEL } from "@/lib/settings";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp"];

function json(body: RecognizeResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_TOKEN)?.value?.trim();
  if (!token) {
    return json(
      { ok: false, message: "请先在右上角“设置”中填写 SimpleTex Token。", code: "NO_TOKEN" },
      400
    );
  }

  const cookieModel = req.cookies.get(COOKIE_MODEL)?.value;
  const model: RecognitionModel = cookieModel === "standard" ? "standard" : "turbo";

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, message: "请求格式不正确。", code: "BAD_REQUEST" }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return json({ ok: false, message: "请上传一张公式图片。", code: "NO_FILE" }, 400);
  }
  if (file.size > MAX_FILE_BYTES) {
    return json({ ok: false, message: "图片过大，请控制在 8MB 以内。", code: "FILE_TOO_LARGE" }, 413);
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return json({ ok: false, message: "仅支持 PNG / JPG / WEBP / BMP 图片。", code: "BAD_TYPE" }, 415);
  }

  try {
    const data = await recognizeFormula({
      token,
      model,
      file,
      filename: file.name || "formula.png",
    });
    return json({ ok: true, data }, 200);
  } catch (e) {
    if (e instanceof SimpleTexError) {
      return json({ ok: false, message: e.message, code: e.code }, 502);
    }
    return json({ ok: false, message: "服务器内部错误，请稍后重试。", code: "INTERNAL" }, 500);
  }
}
