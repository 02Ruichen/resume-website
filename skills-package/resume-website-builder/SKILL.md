---
name: resume-website-builder
description: >
  简历网站构建与实时修改 — 直接操作 resume-data.json，双版本(互联网/国企)独立编辑，
  自动排版验证，构建部署到 GitHub Pages，本地预览+PDF导出。
  触发词：改简历、修改简历、更新简历、简历网站、resume-data、build部署、
  横琴人才、新华社、财政局、技能、实习经历、校园经历、教育背景、互联网版、国企版、
  排版验证、导出PDF、构建部署、刷新网站。
---

# 简历网站构建与实时修改（Resume Website Builder）

> 直接操作 `D:\claude\简历\resume-website\resume-data.json`，一条龙 validate → build → deploy → preview。

---

## 项目概览

```
D:\claude\简历\resume-website\
├── resume-data.json          ← 核心数据（双版本），本 Skill 直接读写
├── index.html                ← build.py 生成的网站
├── build.py                  ← 构建+部署（含自动排版验证）
├── validate_layout.py        ← 独立排版验证
├── photo.jpg                 ← 证件照
├── vendor/                   ← html2canvas + jspdf（本地，不依赖 CDN）
├── LAYOUT_STANDARDS.md       ← 排版规范
└── .claude/skills/
    ├── resume-website-builder/   ← 🆕 本 Skill
    └── job-application-workflow/ ← 求职全流程 Skill（配合使用）
```

**线上地址：** `https://02ruichen.github.io/resume-website/`

---

## 触发条件

当用户提到以下任意意图时自动激活：

| 类别 | 触发词示例 |
|------|-----------|
| 修改内容 | "改一下横琴人才的描述""更新技能栏""把新华社的改成..." |
| 版本操作 | "互联网版改一下""国企版更新""双版本都改" |
| 构建部署 | "重新构建""部署一下""刷新网站""build 一下" |
| 验证检查 | "验证排版""检查一下字数""有没有超标" |
| 预览导出 | "打开网站看看""导出PDF""本地预览" |

---

## 核心工作流

```
用户说"改 XXX"
    ↓
① 确认目标：哪个版本？哪个字段？
    ↓
② 修改 resume-data.json（Edit 工具精确替换）
    ↓
③ python validate_layout.py（排版验证）
    ↓
④ python build.py（构建 + 部署 GitHub Pages）
    ↓
⑤ 打开本地 index.html 预览
```

---

## ① 确认修改目标

每次修改前明确三件事：

| 问题 | 选项 |
|------|------|
| **改哪个版本？** | `internet`（互联网版）/ `gov`（国企版）/ 两个都改 |
| **改哪个板块？** | personal / education / internships / campus / skills / selfEvaluation |
| **改哪条？** | 第几条实习？第几个技能分类？ |

**如果用户没指定版本**，根据内容自动判断：
- 提到 "Claude Code""电商运营""AI增效" → 互联网版
- 提到 "大模型API""政企""政务OA""合规" → 国企版
- 不确定时**主动问用户**。

---

## ② 修改 resume-data.json

### 数据结构速查

```json
{
  "internet": { /* 互联网/AI版 */ },
  "gov":       { /* 国企/央企版 */ }
}
```

### 各板块字段说明

#### personal（个人信息）
```json
{
  "name": "刘芮辰",
  "targetPositions": ["AI产品运营", "策略运营", ...]  // 5个意向岗位
}
```
- 通常只改 `targetPositions`

#### education（教育背景）— 固定 2 条
```json
[{
  "period": "2025-08 ~ 至今",
  "school": "澳门大学",
  "major": "国际关系与公共政策（硕士）",
  "details": ["GPA...", "主修课程..."]
}]
```

#### internships / campus（实习/校园经历）— 各固定 3 条
```json
[{
  "period": "2026.05 ~ 至今",
  "company": "横琴人才集团有限公司（横琴粤澳深度合作区属国企·央地合作）",
  "position": "项目实习生",
  "details": [
    "<b>小标题</b>：具体描述...",
    "<b>小标题</b>：具体描述..."
  ],
  "keywords": "核心能力体现：能力A、能力B、能力C"
}]
```

#### skills（技能与评价）— 固定 4 类
```json
[{
  "category": "大模型工程化应用",
  "items": ["技能描述文本..."]
}]
```

#### selfEvaluation（自我评价）— 3 条字符串数组

### 修改方法

使用 **Edit 工具**做精确字符串替换（不是整文件重写）：
1. 先用 `Read` 读 `resume-data.json` 定位要改的字段
2. 用 `Edit` 工具 `old_string` → `new_string` 精确替换
3. 只改目标字段，不动其他内容

---

## ③ 排版硬性约束（⚠️ 不可突破）

| 约束项 | 上限 | 说明 |
|--------|------|------|
| 单条 detail 字数 | **≤ 115 字** | 含 HTML 标签，≤2 行 |
| 3条 detail 合计 | **≤ 285 字** | 每条经历 |
| 每类技能文字 | **≤ 120 字** | 4 类各自统计 |
| 关键词行 | **≤ 35 字** | 每条经历 |
| 总行数 | **≤ 53 行** | 整份简历 |
| 实习/校园经历条数 | **固定各 3 条** | 不可增减 |
| 技能分类数 | **固定 4 类** | 不可增减 |
| 教育经历条数 | **固定 2 条** | 不可增减 |
| detail 条数/经历 | **2-3 条** | 每条经历 |

### detail 写法规范

- 格式：`<b>四字小标题</b>：具体描述`
- 每段用 `<b>` 加粗 2-4 个关键词
- 紧凑精炼，避免"的""了""等"虚词
- 互联网版：直接有力（"Claude Code""AI增效赋能"）
- 国企版：严谨规范（"大模型API""政企沟通素养"）

### 双版本措辞差异

| 概念 | 互联网版用词 | 国企版用词 |
|------|-------------|-----------|
| AI 工具 | Claude Code | 大模型API / 智能体工具 |
| 运营类型 | 电商运营 | 政企合作运营 |
| 数据 | 数据链路/清洗 | 数据治理/校验 |
| 流程 | 流程优化/自动化 | 政务OA报批/合规 |
| 沟通 | 沟通协调/执行力 | 政企沟通素养/严谨执行 |
| 公文 | 公文规范（轻） | 深度政务公文写作范式 |

---

## ④ 验证 + 构建 + 部署

```bash
cd D:\claude\简历\resume-website

# 第一步：排版验证
python validate_layout.py

# 第二步：构建 + 部署（验证通过后）
python build.py
```

**结果处理：**
| 结果 | 处理方式 |
|------|----------|
| ✅ validate 通过 + build 200 | 告知用户，打开本地预览 |
| ⚠️ validate 有警告 | 告知用户哪些项接近上限，询问是否继续 |
| ❌ validate 失败 | 根据报错精简文字，重新 Edit 再验证 |
| ❌ build 部署非 200 | GitHub 可能被墙，本地文件仍可用 |

---

## ⑤ 预览

```bash
start "" "D:\claude\简历\resume-website\index.html"
```

提醒用户：
- `Ctrl+F5` 强制刷新（避免浏览器缓存旧版）
- 点击「🎨 互联网」/「🏛️ 国企」切换版本
- 点击「📄 导出PDF」导出当前版本（文件名：`MMDD-版本名-刘芮辰.pdf`）

---

## 常见修改场景

### 场景 A：修改某条实习的 detail

```
用户："帮我把横琴人才 detail1 改成 xxxx"
→ 确认版本（internet/gov）
→ Read resume-data.json 定位到对应 detail
→ Edit 精确替换
→ validate → build → 打开预览
```

### 场景 B：更新技能描述

```
用户："国企版技能栏改一下，加个数据治理的表述"
→ 定位到 gov.skills[1].items[0]
→ Edit 替换
→ 检查 ≤120 字
→ validate → build → 预览
```

### 场景 C：切换意向岗位

```
用户："互联网版加个'AI训练与管理'，去掉'电商运营'"
→ 定位到 internet.personal.targetPositions
→ Edit 替换数组
→ validate → build → 预览
```

### 场景 D：仅验证/构建，不改内容

```
用户："帮我重新部署一下""刷新网站"
→ 直接 python build.py
→ 打开预览
```

---

## 与其他 Skill 配合

| Skill | 关系 | 协作方式 |
|-------|------|----------|
| `job-application-workflow` | 上游 | JD分析 → Phase 3 优化简历内容 → 交给本 Skill 写入网站 |
| `resume-website-builder` | 本 Skill | 接收优化内容 → 写入 data → validate → build → 部署 |

**典型串联流程：**
```
/job-application-workflow 分析 JD + 优化简历
    ↓ Phase 3 输出优化版简历内容
/resume-website-builder 写入 resume-data.json
    ↓ validate → build → deploy
📄 导出 PDF 投递
```

---

## 参考文档

- `references/resume-website-spec.md` — 完整字段映射与排版规范
- `D:\claude\简历\resume-website\LAYOUT_STANDARDS.md` — 排版标准原文
