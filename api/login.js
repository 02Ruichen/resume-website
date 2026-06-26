/**
 * POST /api/login
 * 管理后台登录接口
 */
const { verifyPassword } = require('./_data-store');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '仅支持 POST 请求' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: '请输入密码' }),
      };
    }

    if (verifyPassword(password)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: password,
          message: '登录成功',
        }),
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: '密码错误' }),
      };
    }
  } catch (e) {
    console.error('登录接口错误:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: '服务器错误' }),
    };
  }
};
