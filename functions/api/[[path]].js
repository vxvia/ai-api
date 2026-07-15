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

  // 从环境变量读取 API 地址，没配置就用默认值兜底
  const targetUrl = env.API || 'https://api.openai.com/v1/chat/completions';

  const forwardHeaders = new Headers(request.headers);
  const targetHost = new URL(targetUrl).host;
  forwardHeaders.set('host', targetHost);

  const resp = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body: request.method !== 'GET' ? await request.text() : undefined,
  });

  const newResp = new Response(resp.body, resp);
  newResp.headers.set('Access-Control-Allow-Origin', '*');
  return newResp;
}
