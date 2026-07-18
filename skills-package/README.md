# 🛠️ Claude Code 求职技能包

> 两套 Claude Code Skill，覆盖「简历网站构建」+「求职全流程」，搭配使用效果最佳。

---

## 📦 包含的 Skill

### 1. `resume-website-builder` — 简历网站构建与实时修改

**功能：** 直接修改 `resume-data.json` → 排版验证 → 构建部署 → 预览

**触发词：** 改简历、修改简历、更新简历、build部署、横琴人才、技能栏、互联网版、国企版、排版验证、导出PDF

**典型用法：**
```
"帮我把国企版横琴人才的 detail1 改成 xxxx"
"互联网版技能栏更新一下"
"重新构建部署网站"
```

### 2. `job-application-workflow` — 求职全流程工作流

**功能：** JD 分析 → STAR 简历重构 → 简历优化 → 面试准备 → SOP 沉淀 → 同步到简历网站

**触发词：** JD分析、简历优化、面试准备、求职、投递、秋招、春招、岗位匹配、STAR重构

**典型用法：**
```
"帮我分析这个 JD，准备面试"
"这个岗位帮我优化简历"
```

---

## 📥 安装方式

### 方式一：直接复制（推荐）

```bash
# 克隆或下载本仓库后
cp -r skills-package/job-application-workflow ~/.claude/skills/
cp -r skills-package/resume-website-builder ~/.claude/skills/

# 重启 Claude Code 即可生效
```

### 方式二：项目级安装

```bash
# 放到你的项目 .claude/skills/ 下
cp -r skills-package/job-application-workflow 你的项目/.claude/skills/
cp -r skills-package/resume-website-builder 你的项目/.claude/skills/
```

### 方式三：RedSkill 商店安装

```bash
# 先安装 RedSkill 商店
curl -fsSL https://fe-video-qc.xhscdn.com/fe-platform-file/104101b8320fbjem2620653u0hejenq0004pf88g6ask5i.sh | bash

# 安装求职全流程 skill
redskill install job-application-workflow
```

---

## 🔗 两个 Skill 的配合

```
拿到 JD
    ↓
job-application-workflow（分析 JD + 优化简历）
    ↓ Phase 3 输出优化版简历内容
resume-website-builder（写入 resume-data.json）
    ↓ validate → build → deploy
📄 网站更新完成，导出 PDF 投递
```

---

## 📂 文件结构

```
skills-package/
├── README.md
├── resume-website-builder/       # 简历网站构建 Skill
│   ├── SKILL.md
│   └── references/
│       └── resume-website-spec.md
└── job-application-workflow/     # 求职全流程 Skill
    ├── SKILL.md
    └── references/
        └── resume-website-spec.md
```

---

## 📋 关联项目

- **简历网站仓库：** [02Ruichen/resume-website](https://github.com/02Ruichen/resume-website)
- **线上预览：** [https://02ruichen.github.io/resume-website/](https://02ruichen.github.io/resume-website/)
- **RedSkill 商店：** [redskill.xiaohongshu.net](https://redskill.xiaohongshu.net)

---

## ⚠️ 注意事项

- `resume-website-builder` 依赖本地项目路径 `D:\claude\简历\resume-website\`，其他用户需修改为实际路径
- `job-application-workflow` 中的 Phase 6（网站同步）同样依赖本地路径，使用前请修改
- Python 环境需安装（用于 `validate_layout.py` 和 `build.py`）
- `fcntl` 模块仅 Linux/macOS 可用，Windows 用户无法使用 `redskill` CLI（可手动复制 Skill 文件）
