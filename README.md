# API Proxy (Cloudflare Pages)

将请求转发到自定义 API 端点的 Cloudflare Pages Function。

## 目录结构

├── functions/
│ └── api/
│ └── [[path]].js # 代理转发逻辑
└── README.md

## 部署步骤

1. Fork 或上传此仓库到 GitHub
2. 在 Cloudflare Pages 中连接仓库并部署
3. 在 Pages 项目设置中添加环境变量：
   - 变量名：`API`
   - 值：你的目标 API 地址（如 `https://api.openai.com/v1/chat/completions`）
4. 重新部署使环境变量生效

## 使用方式

请求 `https://your-project.pages.dev/api/` 即会被转发到环境变量配置的目标地址。
