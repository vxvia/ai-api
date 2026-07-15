// functions/api/[[path]].js
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

  const targetUrl = env.API || 'https://api.openai.com/v1/chat/completions';

  // 读取原始 body（无论什么方法，如果 body 为空会得到空字符串）
  const body = await request.text();

  const forwardHeaders = new Headers(request.headers);
  const targetHost = new URL(targetUrl).host;
  forwardHeaders.set('host', targetHost);

  // 统一使用 POST 方法，避免 405
  const resp = await fetch(targetUrl, {
    method: 'POST',
    headers: forwardHeaders,
    body: body || undefined,  // 空字符串时保持 body 为 undefined 或传空
  });

  const newResp = new Response(resp.body, resp);
  newResp.headers.set('Access-Control-Allow-Origin', '*');
  return newResp;
}
