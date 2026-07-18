# Claude Code 求职技能包 🛠️

两套 Claude Code Skill，覆盖求职全流程。

---

## 📦 包含的 Skill

### `job-application-workflow` — 求职全流程工作流

JD 分析 → STAR 简历重构 → 简历优化 → 面试准备 → SOP 沉淀。

日用触发："帮我分析这个 JD""这个岗位帮我准备面试"

### `resume-website-builder` — 简历网站构建

对话式修改简历网站，改完自动验证排版 + 部署上线。双版本（互联网/国企），可按需改成自己的。

---

## ⚡ 安装

```bash
git clone https://github.com/02Ruichen/resume-website.git
cp -r resume-website/skills-package/job-application-workflow ~/.claude/skills/
cp -r resume-website/skills-package/resume-website-builder ~/.claude/skills/
```

重启 Claude Code 生效。也可以只装其中一个。

---

## 📂 文件结构

```
skills-package/
├── job-application-workflow/    # 通用求职 Skill，拿来即用
└── resume-website-builder/      # 简历网站 Skill，可按需改造
```
