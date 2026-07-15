/**
 * Cloudflare Pages Functions 版本的 API 转发代理
 * 功能与 Workers 版本一致：
 * 1. 从环境变量 API 读取目标接口地址，未配置时使用默认值兜底
 * 2. 透传请求方法 / 请求体 / 请求头到目标地址
 * 3. 处理 CORS 预检请求（OPTIONS）
 * 4. 支持流式响应（SSE）透传
 *
 * 文件路径说明：
 * functions/[[path]].js 是 Pages Functions 的"捕获所有路径"写法，
 * 意味着访问该 Pages 项目下的任意路径（例如 /v1/chat/completions、
 * /v1/models 等）都会进入这个函数处理，等价于 Worker 里对所有请求生效的逻辑。
 *
 * @param {EventContext} context Pages Functions 的上下文对象
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  // 核心：从环境变量读取 API 地址，没配置就用默认值兜底
  const targetUrl = env.API || 'https://api.openai.com/v1/chat/completions';

  // 构造转发请求头，并把 host 替换为目标地址的 host
  const forwardHeaders = new Headers(request.headers);
  const targetHost = new URL(targetUrl).host;
  forwardHeaders.set('host', targetHost);

  try {
    const resp = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    // 直接透传响应体（支持流式 SSE），并附加 CORS 头
    const newResp = new Response(resp.body, resp);
    newResp.headers.set('Access-Control-Allow-Origin', '*');
    return newResp;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '代理请求失败', detail: String(err) }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
