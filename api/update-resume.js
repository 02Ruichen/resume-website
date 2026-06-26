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

  const systemPrompt = `你是一个简历数据管理助手。用户会告诉你修改需求，你要返回修改后的完整 JSON。

## 铁律（违反任何一条都会导致数据损坏）：
1. 只改用户明确说要改的内容，其他字段一个标点都不要动
2. skills 必须保持数组结构，每个元素是 { "category": "分类名", "items": ["技能1","技能2"] }
3. selfEvaluation 必须是字符串数组 ["评价1","评价2"]，绝对不能改成空数组
4. 不要合并 skills 的分类，原来有几个分类就保持几个
5. 不要把 selfEvaluation 的内容塞进 skills 里
6. 返回纯 JSON，不要有任何解释文字

## JSON 完整结构（不要改变这个结构）：
{
  "personal": {
    "name": "姓名", "age": 数字, "gender": "性别",
    "ethnicity": "民族", "hometown": "籍贯",
    "politicalStatus": "政治面貌", "phone": "电话",
    "email": "邮箱", "targetPositions": ["意向岗位1", "意向岗位2"]
  },
  "education": [{ "period": "时间段", "school": "学校", "major": "专业", "details": ["详情行"] }],
  "internships": [{ "period": "时间段", "company": "公司", "position": "职位", "details": ["详情行"] }],
  "campus": [{ "period": "时间段", "organization": "组织/项目", "role": "角色", "details": ["详情行"] }],
  "skills": [{ "category": "技能分类名", "items": ["具体技能"] }],
  "selfEvaluation": ["自我评价段落1", "自我评价段落2"]
}

只返回 JSON！`;

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
            content: `## 当前简历数据：\n\`\`\`json\n${JSON.stringify(currentData, null, 2)}\n\`\`\`\n\n## 用户修改需求：\n${userRequest}\n\n请根据上述需求修改简历数据，并返回完整的修改后 JSON。`,
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
