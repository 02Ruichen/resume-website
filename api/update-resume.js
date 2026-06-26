/**
 * POST /api/update-resume
 * AI 修改简历接口（需要认证）
 * 使用 DeepSeek V4 Pro 根据用户需求修改简历数据（国内可直接访问）
 */
const { getResumeData, saveResumeData, verifyPassword } = require('./_data-store');

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
    const { password, request } = body;

    // 1. 验证密码
    if (!password || !verifyPassword(password)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: '密码错误，请重新登录' }),
      };
    }

    // 2. 验证用户请求
    if (!request || request.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: '请输入修改需求' }),
      };
    }

    // 3. 读取当前简历数据
    let currentData;
    try {
      currentData = await getResumeData();
    } catch (e) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: '无法读取当前简历数据' }),
      };
    }

    // 4. 调用 DeepSeek API
    const result = await callDeepSeekAPI(currentData, request.trim());

    if (!result.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: result.error || 'AI 处理失败' }),
      };
    }

    const updatedData = result.data;

    // 5. 保存修改后的数据
    const saveResult = await saveResumeData(updatedData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '简历已更新！',
        debug: {
          changed: JSON.stringify(currentData) !== JSON.stringify(updatedData),
          saveOk: saveResult,
        },
      }),
    };
  } catch (e) {
    console.error('更新简历失败:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `服务器内部错误：${e.message}`,
      }),
    };
  }
};

/**
 * 调用 DeepSeek API 修改简历数据（OpenAI 兼容格式）
 */
async function callDeepSeekAPI(currentData, userRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'DEEPSEEK_API_KEY 未设置' };
  }

  const systemPrompt = `你是简历JSON修改器。根据用户指令修改JSON并输出。只输出JSON。`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `请根据修改指令更新以下JSON，然后输出完整的修改后JSON。\n\n修改指令：${userRequest}\n\n当前JSON：${JSON.stringify(currentData, null, 2)}\n\n输出：`,
          },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `DeepSeek API ${response.status}: ${err.substring(0,200)}` };
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content || '';

    if (!responseText) {
      return { success: false, error: 'DeepSeek 返回空内容' };
    }

    // 提取 JSON
    let jsonStr = responseText;
    const jsonBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1];
    }

    try {
      const data = JSON.parse(jsonStr.trim());
      return { success: true, data };
    } catch (e) {
      return { success: false, error: `JSON解析失败: ${e.message}，原始: ${jsonStr.substring(0,200)}` };
    }
  } catch (e) {
    return { success: false, error: `DeepSeek调用异常: ${e.message}` };
  }
}
