/**
 * 简历数据存储工具（Netlify 版本）
 *
 * 存储策略：
 * - 生产环境（Netlify）：通过 GitHub API 读取/写入仓库中的 resume-data.json
 * - 本地开发：使用文件系统
 *
 * 需要环境变量：
 *   GITHUB_TOKEN   - GitHub Personal Access Token（需 repo 权限）
 *   ADMIN_PASSWORD - 管理后台密码
 */

const fs = require('fs');
const path = require('path');

// ========== 配置 ==========
const REPO_OWNER = '02Ruichen';
const REPO_NAME = 'resume-website';
const FILE_PATH = 'public/resume-data.json';
const BRANCH = 'master';

// GitHub API 基础地址
const GITHUB_API = 'https://api.github.com';

/** 本地 JSON 文件路径（开发环境用） */
const LOCAL_DATA_PATH = path.join(__dirname, '..', 'public', 'resume-data.json');

// ========== GitHub API 操作 ==========

/**
 * 通过 GitHub API 读取文件内容
 */
async function readFromGitHub() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    // 无 Token 时用 Raw URL（公共仓库）
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}`;
    const response = await fetch(rawUrl + `?t=${Date.now()}`, {
      headers: { 'User-Agent': 'resume-website' },
    });
    if (!response.ok) throw new Error(`Raw 读取失败: ${response.status}`);
    return await response.json();
  }

  // 用 GitHub API 读取（返回最新版，不走 CDN 缓存）
  const apiUrl = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`;
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'resume-website',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API 读取失败: ${response.status}`);
  }

  const file = await response.json();
  const content = Buffer.from(file.content, 'base64').toString('utf-8');
  return JSON.parse(content);
}

/**
 * 通过 GitHub API 写入文件内容
 */
async function writeToGitHub(data) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN 未设置');

  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');

  // 先获取当前文件的 SHA（GitHub API 更新文件需要 SHA）
  let sha;
  try {
    const getResp = await fetch(`${url}?ref=${BRANCH}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'resume-website',
      },
    });
    if (getResp.ok) {
      const file = await getResp.json();
      sha = file.sha;
    }
  } catch (e) {
    console.log('获取文件SHA失败，将创建新文件');
  }

  // 提交文件更新
  const body = {
    message: 'AI 更新简历内容',
    content: content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'resume-website',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`GitHub API 写入失败: ${response.status} - ${err.message}`);
  }
}

// ========== 对外接口 ==========

/**
 * 读取简历数据
 */
async function getResumeData() {
  // 第1层：GitHub API（最实时，有认证）
  if (process.env.GITHUB_TOKEN) {
    try {
      return await readFromGitHub();
    } catch (e) {
      console.error('GitHub API 失败:', e.message);
    }
  }

  // 第2层：GitHub Raw URL（无认证但通常够新）
  try {
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}?t=${Date.now()}`;
    const resp = await fetch(rawUrl, { headers: { 'User-Agent': 'resume-website' } });
    if (resp.ok) return await resp.json();
  } catch (e) {
    console.error('Raw URL 失败:', e.message);
  }

  // 第3层：本地文件（仅开发环境，生产环境不应走到这里）
  try {
    const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('所有数据源均不可用');
  }
}

/**
 * 保存简历数据
 */
async function saveResumeData(data) {
  // 优先使用 GitHub API（生产环境）
  if (process.env.GITHUB_TOKEN) {
    try {
      await writeToGitHub(data);
      console.log('简历数据已通过 GitHub API 保存');
      return true;
    } catch (e) {
      console.error('GitHub API 写入失败，降级到本地文件:', e.message);
      // 继续尝试本地文件
    }
  }

  // 降级：写入本地 JSON 文件（本地开发）
  try {
    const formatted = JSON.stringify(data, null, 2);
    fs.writeFileSync(LOCAL_DATA_PATH, formatted, 'utf-8');
    console.log('简历数据已保存到本地文件');
    return true;
  } catch (e) {
    console.error('本地文件写入失败:', e.message);
    return false;
  }
}

/**
 * 验证管理密码
 */
function verifyPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
}

module.exports = { getResumeData, saveResumeData, verifyPassword };
