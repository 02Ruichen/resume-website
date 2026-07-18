# 简历网站技术规范（供 job-application-workflow Skill 使用）

> 自动生成于 2026-07-18，与 `D:\claude\简历\resume-website\LAYOUT_STANDARDS.md` 同步

---

## 项目路径

```
D:\claude\简历\resume-website\
├── resume-data.json          ← 核心数据文件（双版本）
├── index.html                ← 生成的网站（build.py 输出）
├── build.py                  ← 构建+部署脚本
├── validate_layout.py        ← 排版验证脚本
├── LAYOUT_STANDARDS.md       ← 排版规范
├── photo.jpg                 ← 证件照
├── vendor/                   ← html2canvas + jspdf 本地库
└── .claude/skills/job-application-workflow/  ← 本 Skill
```

---

## resume-data.json 结构

```json
{
  "internet": { /* 互联网/AI版 */ },
  "gov":       { /* 国企/央企版 */ }
}
```

两个版本结构完全相同，以下是单版本的字段说明：

### personal（个人信息）
```json
{
  "name": "刘芮辰",
  "age": 24,
  "gender": "女",
  "ethnicity": "汉族",
  "hometown": "山东",
  "politicalStatus": "中共党员",
  "phone": "15318036172",
  "email": "liuruichen02@qq.com",
  "targetPositions": ["AI产品运营", "策略运营", "数字化项目运营", "AI训练与管理", "电商运营"]
}
```

### education（教育背景）— 固定 2 条
```json
[{
  "period": "2025-08 ~ 至今",
  "school": "澳门大学",
  "major": "国际关系与公共政策（硕士）",
  "details": ["GPA...", "主修课程..."]
}, {...}]
```

### internships（实习经历）— 固定 3 条
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
}, {...}, {...}]
```

### campus（校园经历）— 固定 3 条
结构同 internships。

### skills（技能与评价）— 固定 4 类
```json
[{
  "category": "分类名",
  "items": ["技能描述文本..."]
}, {...}]
```

### selfEvaluation（自我评价）— 3 条
```json
["评价1", "评价2", "评价3"]
```

---

## 硬性排版约束（⚠️ 不可突破）

| 约束项 | 上限 |
|--------|------|
| 单条 detail 字数 | **≤ 115 字（含 HTML 标签）** |
| 每条经历 3 条 detail 合计 | **≤ 285 字** |
| 每条经历 detail 条数 | **2-3 条** |
| 每类技能文字 | **≤ 120 字** |
| 关键词行 | **≤ 35 字** |
| 总行数 | **≤ 53 行** |
| 实习经历条数 | **固定 3 条** |
| 校园经历条数 | **固定 3 条** |
| 技能分类数 | **固定 4 类** |
| 教育经历条数 | **固定 2 条** |

---

## detail 写法规范

- 每条 detail 以 `<b>四字小标题</b>：` 开头
- 用 `<b>` 标签加粗关键词（控制在 2-4 个）
- 内容紧凑，避免虚词（"的""了""等"尽量省略）
- 语气风格根据版本调整：
  - 互联网版：直接、有冲击力（"Claude Code""AI增效赋能"）
  - 国企版：严谨、规范（"大模型API""政企沟通素养"）

---

## 双版本措辞差异速查

| 概念 | 互联网版 | 国企版 |
|------|---------|--------|
| AI 工具 | Claude Code | 大模型API / 智能体工具 |
| 运营类型 | 电商运营 | 政企合作运营 |
| 数据能力 | 数据链路/数据清洗 | 数据治理/数据校验 |
| 流程管理 | 流程优化/自动化运营 | 政务OA报批/政企合规 |
| 沟通能力 | 沟通协调能力/执行力 | 政企沟通素养/严谨执行力 |
| 技能分类 | 大模型工程化应用 | 大模型应用与智能体开发 |
| 技能分类 | 流程优化与自动化运营 | 政企办公流与合规认知 |
| 公文相关 | 公文规范（轻描） | 深度熟悉政务公文写作范式 |

---

## 构建与部署命令

```bash
# 1. 修改 resume-data.json 后
cd D:\claude\简历\resume-website

# 2. 排版验证
python validate_layout.py

# 3. 构建 + 部署（验证通过后）
python build.py

# 4. 本地预览
start "" "D:\claude\简历\resume-website\index.html"
```

---

## PDF 导出

- 打开 `index.html` → 切换主题 → 点击「📄 导出PDF」
- 用 `vendor/` 本地库，不依赖 CDN
- 文件名自动：`MMDD-版本名-刘芮辰.pdf`
