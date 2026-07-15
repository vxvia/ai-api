# ai-api

基于 **Cloudflare Pages Functions** 实现的 API 转发代理，功能与 Cloudflare Workers 版本完全一致：

- 从环境变量 `API` 读取真实的目标接口地址
- 未配置时默认使用 `https://api.openai.com/v1/chat/completions`
- 自动处理 CORS（含 OPTIONS 预检请求）
- 支持流式响应（SSE）透传
- 捕获任意路径请求（`/v1/chat/completions`、`/v1/models` 等都会被转发）

## 目录结构

```
cf-pages-proxy/
├── functions/
│   └── [[path]].js      # 核心代理逻辑，捕获所有路径的请求
├── public/
│   └── index.html        # Pages 要求的静态输出目录（占位页面）
├── wrangler.toml          # 本地开发/预览配置（含默认环境变量示例）
├── .dev.vars.example      # 本地开发环境变量示例
├── .gitignore
└── README.md
```

## 部署步骤

### 方式一：通过 Cloudflare Dashboard 部署（推荐，零命令行）

1. 把整个仓库推送到 GitHub。
2. 登录 Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**，选择这个仓库。
3. 构建设置：
   - Build command：留空（无需构建）
   - Build output directory：`public`
4. 部署完成后，进入该 Pages 项目 → **Settings** → **Environment variables**，添加变量：
   - Key: `API`
   - Value: 你想要转发到的目标接口地址，例如 `https://api.groq.com/openai/v1/chat/completions`
5. 保存后重新触发一次部署（Deployments → Retry deployment），环境变量才会生效。

### 方式二：使用 Wrangler CLI 本地部署

```bash
npm install -g wrangler
cd cf-pages-proxy
cp .dev.vars.example .dev.vars   # 本地开发用，修改里面的 API 地址
wrangler pages dev public         # 本地预览
wrangler pages deploy public      # 部署到 Cloudflare
```

部署后同样需要在 Dashboard 里为生产环境设置 `API` 环境变量（CLI 部署默认不会带上 `.dev.vars`）。

## 使用方式

部署完成后，会得到形如 `https://your-project.pages.dev` 的域名。
将你原本调用第三方 API 的 base URL 替换为：

```
https://your-project.pages.dev/v1/chat/completions
```

请求方法、请求体、鉴权头（如 `Authorization: Bearer xxx`）都会原样转发给 `API` 环境变量指定的真实接口地址。

## 与 Workers 版本的区别

| | Workers | Pages Functions |
|---|---|---|
| 入口文件 | `index.js`（`export default { fetch }`） | `functions/[[path]].js`（`export function onRequest`） |
| 环境变量配置 | Worker Settings → Variables | Pages 项目 Settings → Environment variables |
| 静态资源 | 无需额外目录 | 需要一个静态输出目录（如 `public/`），哪怕只是占位页面 |
| 部署方式 | `wrangler deploy` | `wrangler pages deploy` 或 Git 集成自动部署 |

两者核心转发逻辑完全一致，只是运行环境和配置入口不同。
