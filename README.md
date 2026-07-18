# Claude Code 求职技能包 🛠️

> 两套 Claude Code Skill，覆盖「简历网站构建」+「求职全流程」，搭配使用从 JD 分析到 PDF 投递一条龙。

---

## 📦 包含哪些 Skill？

### 1. `resume-website-builder` — 简历网站构建与实时修改

直接对话式修改简历网站：改描述、换措辞、更新技能栏……说完自动验证排版 → 构建 → 部署上线。

**触发方式（自然语言即可）：**
- "帮我把横琴人才的描述改一下"
- "国企版技能栏更新"
- "重新构建部署网站"

### 2. `job-application-workflow` — 求职全流程工作流

JD 分析 → STAR 简历重构 → 简历优化 → 面试准备 → SOP 沉淀，六个 Phase 一站式搞定。

**触发方式（自然语言即可）：**
- "帮我分析这个 JD"
- "这个岗位帮我准备面试"
- "秋招投递，帮我走一遍全流程"

---

## ⚡ 快速安装

### 方式一：复制到全局（推荐，所有项目通用）

```bash
# 下载本仓库
git clone https://github.com/02Ruichen/resume-website.git

# 复制两个 skill 到 Claude Code 技能目录
cp -r resume-website/skills-package/job-application-workflow ~/.claude/skills/
cp -r resume-website/skills-package/resume-website-builder ~/.claude/skills/

# 重启 Claude Code 即可
```

### 方式二：复制到单个项目

```bash
cp -r resume-website/skills-package/job-application-workflow 你的项目/.claude/skills/
cp -r resume-website/skills-package/resume-website-builder 你的项目/.claude/skills/
```

### 方式三：RedSkill 商店

```bash
# 先安装 RedSkill 商店
curl -fsSL https://fe-video-qc.xhscdn.com/fe-platform-file/104101b8320fbjem2620653u0hejenq0004pf88g6ask5i.sh | bash

# 安装
redskill install job-application-workflow
```

> ⚠️ `resume-website-builder` 依赖本地简历网站项目路径，如需使用请修改 SKILL.md 中的项目路径。

---

## 🔗 两套 Skill 怎么配合？

```
拿到 JD
    ↓
job-application-workflow（Phase 1-3：分析 JD + 优化简历内容）
    ↓
resume-website-builder（写入简历数据 → 验证 → 构建部署）
    ↓
📄 导出 PDF → 投递！
```

---

## 📂 文件说明

```
skills-package/
├── README.md                           # 本文件
├── job-application-workflow/           # 求职全流程 Skill
│   ├── SKILL.md                        # 技能定义（6 Phase）
│   └── references/
│       └── resume-website-spec.md      # 简历网站字段规范
└── resume-website-builder/            # 网站构建 Skill
    ├── SKILL.md                        # 技能定义
    └── references/
        └── resume-website-spec.md      # 简历网站字段规范
```

---

## 📋 注意事项

- **运行环境**：Claude Code（桌面版 / CLI / IDE 插件均可）
- **安装后重启 Claude Code** 才能自动识别新增 Skill
- **Windows 用户**：`redskill` CLI 依赖 `fcntl` 模块（仅 Unix 可用），用方式一或二手动复制即可
- `resume-website-builder` 中硬编码的项目路径需根据实际情况修改

---

## 🙋 问题反馈

有问题或建议？欢迎提 [Issue](https://github.com/02Ruichen/resume-website/issues) ~
