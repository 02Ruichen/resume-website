/**
 * GET /api/get-resume
 * 获取简历数据（公开接口，无需认证）
 */
const { getResumeData } = require('./_data-store');

exports.handler = async function(event, context) {
  // 设置 CORS 头部
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Content-Type': 'application/json; charset=utf-8',
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 仅允许 GET 请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '仅支持 GET 请求' }),
    };
  }

  try {
    const data = await getResumeData();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (e) {
    console.error('获取简历数据失败:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '数据读取失败，请稍后重试' }),
    };
  }
};
