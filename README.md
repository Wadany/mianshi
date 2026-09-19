# 混乱大枪战 · Web 版

一款模仿 4399《混乱大枪战》的横版 2D 枪战网页小游戏。纯前端实现（HTML5 Canvas + 原生 JavaScript），托管于 GitHub，通过 GitHub Pages 发布，打开链接即玩，无需安装。

## 🎮 在线试玩

GitHub Pages 发布后地址：`https://wadany.github.io/mianshi/`

## 🕹️ 操作

| 输入 | 操作 |
|------|------|
| `A` / `D` | 左右移动 |
| `W` / `空格` | 跳跃 |
| 鼠标移动 | 瞄准 |
| 鼠标左键 | 射击 |

## ✅ 当前进度（M0 + M1 可玩骨架）

- [x] Canvas 渲染与游戏主循环（按 deltaTime 更新，帧率无关）
- [x] WASD 移动
- [x] 重力、跳跃、平台碰撞（含 coyote time 手感优化）
- [x] 鼠标瞄准，朝鼠标方向射击直线子弹
- [x] 摄像机横向跟随主角
- [x] 血条 HUD
- [ ] 敌人 AI 与战斗（M2）
- [ ] 多武器、多关卡、Boss（M3）

详见 [PRD.md](PRD.md)。

## 📁 目录结构

```
mianshi/
├── index.html          # 入口，GitHub Pages 读它
├── PRD.md              # 产品需求文档
├── README.md
├── css/style.css
├── js/
│   ├── config.js       # 所有可调数值（改这里调参）
│   ├── input.js        # 键鼠输入
│   ├── weapon.js       # 武器与子弹
│   ├── player.js       # 主角（移动/跳跃/碰撞/射击）
│   ├── level.js        # 关卡与平台
│   └── main.js         # 入口与主循环
└── assets/
    ├── images/
    ├── audio/
    └── CREDITS.md      # 素材来源与授权登记
```

## 🚀 本地运行

由于用了多个 JS 文件，直接双击 `index.html` 一般也能跑；如遇浏览器限制，用任意静态服务器：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 📦 部署到 GitHub Pages

1. 推送代码到 GitHub 仓库。
2. 仓库 **Settings → Pages**。
3. Source 选 **Deploy from a branch**，分支 `main`，目录 `/ (root)`，保存。
4. 稍等 1~2 分钟即可通过 Pages 地址访问。
