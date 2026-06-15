# textStudio · 在线数学公式识别平台

上传一张包含数学公式的图片，自动识别为 **LaTeX**，可在线预览、编辑，并一键复制为
**LaTeX** 或 **Word 公式**（MathML，粘贴到 Word / WPS 即为可编辑公式）。

识别能力基于 [SimpleTex 公式识别 API](https://doc.simpletex.cn/zh/api/api_formula_recognition.html)。

## ✨ 功能

- 📤 多种上传方式：点击选择、拖拽、剪贴板 `Ctrl+V` 粘贴
- 🔍 图片转 LaTeX（标准 / 轻量两种模型可选）
- 👀 KaTeX 实时渲染预览，显示识别置信度
- ✏️ LaTeX 源码可手动修正后再复制
- 🔀 区分**行内公式 `$…$`** 与**独立公式 `$$…$$`**，切换同时影响预览、复制的 LaTeX 与 Word 公式排版
- 📋 一键复制 LaTeX 源码（按所选模式自动包裹 `$` / `$$`）
- 📝 一键复制 Word 公式（MathML，粘贴到 Word / WPS 自动转为可编辑公式）
- 🔒 API Token 仅存于服务端，绝不下发到浏览器

## 🏗️ 架构

```
浏览器 (Next.js 客户端组件)
  │  上传图片 (multipart/form-data)
  ▼
/api/recognize  ← Next.js 服务端路由 (Node runtime)
  │  注入服务端 token，转发
  ▼
SimpleTex API   ← https://server.simpletex.cn/api/latex_ocr[_turbo]
```

复制在浏览器端完成：复制 LaTeX 为纯文本；复制 Word 公式为 `LaTeX → MathML (temml)` 并写入剪贴板。

### 目录结构

```
app/
  layout.tsx              全局布局，引入 KaTeX 样式
  page.tsx                主页面，编排上传/识别/展示
  globals.css             Tailwind + 全局样式
  api/recognize/route.ts  服务端代理 → SimpleTex
components/
  Header.tsx              顶栏
  UploadArea.tsx          上传区（点击/拖拽/粘贴）
  FormulaPreview.tsx      KaTeX 公式渲染
  ResultPanel.tsx         结果展示、格式切换、复制
components/
  SettingsModal.tsx       Token / 模型设置弹窗（写入 Cookie）
lib/
  types.ts                前后端共享类型
  simpletex.ts            SimpleTex API 封装（服务端）
  clipboard.ts            复制 LaTeX / Word 公式（客户端）
  settings.ts             读写 Token / 模型 Cookie（客户端）
```

> Token 与模型**不使用环境变量**，由用户在网页「设置」中填写，缓存于浏览器 Cookie；
> 同源请求会自动携带该 Cookie，服务端代理读取后转发给 SimpleTex。

## 🚀 快速开始

### 1. 安装与运行

```bash
npm install
npm run dev      # 开发模式 http://localhost:3000
```

### 2. 配置 Token（在网页上）

1. 登录 [simpletex.cn 用户中心](https://simpletex.cn/user/center) → 「用户授权令牌」→ 创建一个 UAT。
2. 打开本应用，点右上角 **⚙️ 设置**，粘贴 Token 并选择识别模型（轻量 / 标准），保存即可。
   配置保存在本浏览器 Cookie 中，下次自动带上。

生产构建：

```bash
npm run build
npm run start
```

## 🔧 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | TypeScript 类型检查 |

## ⚠️ 说明

- SimpleTex UAT 方式官方建议仅用于开发/测试；正式上线请改用更安全的 APP 鉴权方式。
- 免费额度有限（轻量模型约 1000 次，标准模型约 500 次），超出后需在 SimpleTex 侧充值。
- “复制 Word 公式”写入的是 MathML。Microsoft Word 365 / 2016+、WPS 粘贴后会转换为可编辑公式；个别旧版本或 LibreOffice 支持有限。

## 📄 许可

仅供学习与个人使用。
