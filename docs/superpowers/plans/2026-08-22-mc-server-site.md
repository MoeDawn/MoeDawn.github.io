# 「脑溢血急救中心」MC 服务器宣传站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把语雀 FAQ 迁移为单页 GitHub Pages 宣传站（暗夜霓虹深色 + 粉白紫亮色双主题），含实时服状态、常驻大纲、彩蛋。

**Architecture:** 纯 HTML/CSS/JS 零构建。`index.html` 单页结构；`css/style.css` 用 CSS 变量驱动双主题；`js/servers.js` 独立数据模块（更新服务器只改它）；`js/main.js` 全部交互逻辑；`images/` 本地化语雀图片。服务器数据由 JS 动态渲染表格。

**Tech Stack:** 原生 HTML5 / CSS3 / ES6+，无第三方运行时依赖。测试用 Node 24 内置 `node --test`（仅数据模块），视觉/交互验证靠浏览器（本机验证步骤需用户或执行者打开浏览器人工确认）。

## Global Constraints

- 零构建、零第三方运行时依赖（不引 Tailwind/Alpine/任何 CDN 库）
- 唯一允许的外部 API：`https://api.mcsrvstat.us/3/{address}`（免费、跨域），失败必须优雅降级
- 加群链接（逐字复制，含 authKey）：`https://qm.qq.com/cgi-bin/qm/qr?k=wENtHmJR4U8TpIZyBSTScr9Si5VAH9B1&jump_from=webapi&authKey=2a2V6Oz+lX7qJ4D9bjdYGK9Xbp+CX5M3bR94IA6X24y4cGRwp8X1UyFaMTnVmm7G`
- 瑞克摇链接：`https://www.bilibili.com/video/BV1GJ411x7h7`
- 阅读障碍彩蛋链接：`https://zh.wikipedia.org/wiki/失读症`（维基百科"失读症"条目，稳定且贴题；用户可随时换）
- 深色默认；亮色 = 粉白紫 4:4:2（白+浅粉底、紫 #8b5cf6 强调，紫色占 20%）
- 开放服仅 2 个：① 1.21.11 服务器 ssjj2.top 无正版验证；② 亡者世界整合包 1.20.1 ssjj3.top 无正版验证
- 历史服共 10 个（见 Task 5 数据，含新关停的 1.21.11 创造服与重度机械症）
- 中文文案；代码注释只写约束性说明
- 每任务一 commit，conventional commits 格式

## File Structure

```
MoeDawn.github.io/
├── index.html          # T2 骨架+Hero（含防闪主题内联脚本），T4 填 FAQ，T8 补彩蛋
├── css/style.css       # T3 变量/基础/Hero/布局，T6 表格/FAQ/页脚/响应式
├── js/servers.js       # T5 服务器数据模块（浏览器+Node 双导出）
├── js/main.js          # T7 主题/大纲/进度条/动效，T8 状态查询+复制+彩蛋
├── images/             # T1 语雀 3 张氛围图
└── tests/servers.test.js  # T5 数据模块测试
```

---

### Task 1: 语雀图片本地化

**Files:**
- Create: `images/intro-1.jpg`, `images/intro-2.png`, `images/intro-3.jpg`
- Create: `images/README.md`

**Interfaces:**
- Produces: HTML 引用路径 `images/intro-1.jpg`（语雀第 1 图）、`images/intro-2.png`（第 2 图）、`images/intro-3.jpg`（第 3 图）

- [ ] **Step 1: 下载 3 张图**

```bash
mkdir -p images
curl -L -A "Mozilla/5.0" -o images/intro-1.jpg "https://cdn.nlark.com/yuque/0/2026/jpeg/66876793/1774433014696-9511c06e-c61b-4073-ace0-50d0adb68bdb.jpeg"
curl -L -A "Mozilla/5.0" -o images/intro-2.png "https://cdn.nlark.com/yuque/0/2026/png/66876793/1774433015697-8a9cc1f6-90d3-45f1-82df-f665839b8ec2.png"
curl -L -A "Mozilla/5.0" -o images/intro-3.jpg "https://cdn.nlark.com/yuque/0/2026/jpeg/66876793/1774433014916-474c5843-a260-4a74-94a0-aa08ebfd4b2d.jpeg"
```

- [ ] **Step 2: 验证文件是真实图片**

Run: `ls -la images/ && file images/*`
Expected: 3 个文件均 >10KB 且 MIME 为 JPEG/PNG；若为 0 字节或 HTML（防爬），改用浏览器下载后手动放入，或放弃该图（`index.html` 中对应 `<img>` 删除即可，不阻塞）

- [ ] **Step 3: 写 images/README.md**

```markdown
# 图片资源

| 文件 | 来源 | 用途 |
|---|---|---|
| intro-1.jpg | 语雀 001 第 1 图 | 服务器介绍氛围图 1 |
| intro-2.png | 语雀 001 第 2 图 | 备用素材（未引用） |
| intro-3.jpg | 语雀 001 第 3 图 | 服务器介绍氛围图 2 |

新增图片放本目录，命名 `用途-序号.扩展名`。
```

- [ ] **Step 4: Commit**

```bash
git add images/
git commit -m "feat: localize yuque images into repo"
```

---

### Task 2: HTML 骨架 + Hero 英雄区

**Files:**
- Modify: `index.html`（整体重写）

**Interfaces:**
- Produces: JS 挂载点 `<tbody id="server-rows">`、`<tbody id="archive-rows">`、`<nav id="toc-nav">`、`<div id="progress-bar">`、`<button id="theme-toggle">`、`<div id="toast">`；章节锚点 `#intro`/`#servers`/`#archive`/`#faq`/`#join`；FAQ 子锚点在 T4 定义

- [ ] **Step 1: 写完整 index.html（FAQ 节 T4 再填）**

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>脑溢血急救中心 · Minecraft 服务器</title>
  <meta name="description" content="休闲向小型 Minecraft 服务器，与同好做伴的清闲之所。1.21.11 生存服与 1.20.1 亡者世界整合包服开放中。">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='80'>🏥</text></svg>">
  <script>
    /* 防主题闪烁：尽早确定主题（存储优先，其次跟随系统） */
    (function () {
      try {
        var t = localStorage.getItem('theme') ||
          (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.dataset.theme = t;
      } catch (e) { /* 保持默认 dark */ }
    })();
  </script>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="progress-bar" aria-hidden="true"></div>

  <header class="hero" id="top">
    <div class="hero-inner">
      <p class="hero-eyebrow">MINECRAFT 服务器</p>
      <h1 class="hero-title">脑溢血急救中心</h1>
      <p class="hero-sub">休闲 · 小型 · 无内卷 —— 为想要一份清闲、又有同好做伴的你而建</p>
      <div class="hero-badges">
        <a class="badge badge-join" href="https://qm.qq.com/cgi-bin/qm/qr?k=wENtHmJR4U8TpIZyBSTScr9Si5VAH9B1&jump_from=webapi&authKey=2a2V6Oz+lX7qJ4D9bjdYGK9Xbp+CX5M3bR94IA6X24y4cGRwp8X1UyFaMTnVmm7G" target="_blank" rel="noopener">
          <span class="badge-label">加入 QQ 群</span>
        </a>
        <span class="badge badge-status" data-status-host="ssjj2.top"><span class="dot"></span><span class="badge-text">1.21.11 生存服</span></span>
        <span class="badge badge-status" data-status-host="ssjj3.top"><span class="dot"></span><span class="badge-text">亡者世界 1.20.1</span></span>
      </div>
      <a class="hero-cta" href="#servers">查看服务器 ↓</a>
    </div>
  </header>

  <div class="layout">
    <main id="content">

      <section class="section" id="intro" aria-labelledby="intro-h">
        <h2 id="intro-h">服务器介绍</h2>
        <p>本服务器非常适合喜欢小型服务器且倾向于休闲向的人。有别于那些大型多人服务器，如果你需要一份清闲之处，同时又想要有同好做伴，那么这里会非常适合你。当前开放的服务器均无正版验证，任何人都可以轻松畅玩。</p>
        <figure class="intro-fig">
          <img src="images/intro-1.jpg" alt="服务器建筑截图" loading="lazy">
          <img src="images/intro-3.jpg" alt="服务器风景截图" loading="lazy">
        </figure>
        <p>服务器非常轻量、管制宽松：没有服规、没有地位高低之分，正常情况下不会有任何 OP 在线。但这不意味着无政府 —— 严重影响服内环境的恶劣行为将直接顶格处理。作为自由的服务器，底线只为维护最基本的风气。</p>
        <p>清闲、人少、协同互进、玩家通力合作 —— 如果这种服务器对你胃口，千万不要错过。</p>
      </section>

      <section class="section" id="servers" aria-labelledby="servers-h">
        <h2 id="servers-h">开放中的服务器</h2>
        <p class="section-note">使用对应版本进入；整合包在 QQ 群文件 → 游戏资源 内下载。</p>
        <div class="table-wrap">
          <table class="server-table" id="server-table">
            <thead>
              <tr><th>名称</th><th>版本</th><th>类型</th><th>地址</th><th>整合包</th><th>状态</th></tr>
            </thead>
            <tbody id="server-rows"><!-- js/servers.js 渲染 --></tbody>
          </table>
        </div>
        <p class="section-note">白名单：进服前在群内召唤任意管理员上报游戏 ID，或按进服弹窗提示完成验证绑定。</p>
      </section>

      <section class="section" id="archive" aria-labelledby="archive-h">
        <h2 id="archive-h">历史服档案馆</h2>
        <p class="section-note">一路走来的坑，感谢每一位同行的伙伴。</p>
        <details class="archive-box">
          <summary>展开 10 个已关闭的服务器</summary>
          <div class="table-wrap">
            <table class="server-table archive-table">
              <thead>
                <tr><th>名称</th><th>版本</th><th>备注</th><th>地址（历史）</th></tr>
              </thead>
              <tbody id="archive-rows"><!-- js/servers.js 渲染 --></tbody>
            </table>
          </div>
        </details>
      </section>

      <!-- FAQ-TASK4-INSERT-POINT -->

      <section class="section" id="join" aria-labelledby="join-h">
        <h2 id="join-h">现在，来吧</h2>
        <p>加群 → 群文件拿整合包（亡者世界服需要）→ 拉上朋友进服。我们在这里等你。</p>
        <div class="hero-badges">
          <a class="badge badge-join" href="https://qm.qq.com/cgi-bin/qm/qr?k=wENtHmJR4U8TpIZyBSTScr9Si5VAH9B1&jump_from=webapi&authKey=2a2V6Oz+lX7qJ4D9bjdYGK9Xbp+CX5M3bR94IA6X24y4cGRwp8X1UyFaMTnVmm7G" target="_blank" rel="noopener"><span class="badge-label">加入 QQ 群</span></a>
        </div>
      </section>
    </main>

    <aside class="toc" id="toc">
      <div class="toc-head">
        <span>目录</span>
        <button id="toc-toggle" aria-label="收起或展开目录" title="收起/展开目录">«</button>
      </div>
      <nav id="toc-nav" aria-label="页面目录"><!-- T7 JS 生成 --></nav>
    </aside>
  </div>

  <footer class="footer">
    <p>脑溢血急救中心 · 一个清闲的 Minecraft 小服务器</p>
    <div class="footer-links">
      <a href="https://qm.qq.com/cgi-bin/qm/qr?k=wENtHmJR4U8TpIZyBSTScr9Si5VAH9B1&jump_from=webapi&authKey=2a2V6Oz+lX7qJ4D9bjdYGK9Xbp+CX5M3bR94IA6X24y4cGRwp8X1UyFaMTnVmm7G" target="_blank" rel="noopener">加群</a>
      <a href="#top">回顶部</a>
      <a href="https://www.bilibili.com/video/BV1GJ411x7h7" target="_blank" rel="noopener" class="egg-author">关于作者</a>
      <a href="https://www.bilibili.com/video/BV1GJ411x7h7" target="_blank" rel="noopener" class="egg-btn" title="千万别点">.</a>
    </div>
    <p class="footer-fine">© 2026 脑溢血急救中心 · 本页由 GitHub Pages 托管</p>
  </footer>

  <button id="theme-toggle" aria-label="切换明暗主题" title="切换明暗主题">🌙</button>
  <div id="toast" role="status" aria-live="polite"></div>

  <script src="js/servers.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: 结构验证（此时无 CSS/JS，允许 404）**

Run: `grep -c "section class" index.html`
Expected: 5（intro/servers/archive/join + head 内联 script 不计）

浏览器打开 `index.html`：无样式但全部文字、锚点、表格框架可见，控制台仅 css/js 404（预期，T3/T5 后消失）

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: page skeleton with hero and section anchors"
```

---

### Task 3: CSS 变量双主题 + 基础样式 + Hero

**Files:**
- Create: `css/style.css`

**Interfaces:**
- Consumes: T2 类名 `.hero`/`.badge`/`.layout`/`.section`/`.toc`/`#theme-toggle`/`#toast`/`#progress-bar`
- Produces: `:root[data-theme="light"]` 变量覆盖；`.reveal`/`.visible` 动效类（T6 定义样式、T7 JS 加类）；文件末尾注释 `/* T6-APPEND-POINT */` 供 T6 追加

- [ ] **Step 1: 写 style.css 主体**

```css
/* ============ 主题变量 ============ */
:root, :root[data-theme="dark"] {
  --bg: #0b0e1a;
  --bg-2: #141a33;
  --bg-3: #1a1040;
  --text: #e8eaf6;
  --text-dim: #8b93b8;
  --accent: #7ef0c3;
  --accent-2: #4ea8ff;
  --card: rgba(255,255,255,.05);
  --card-border: rgba(255,255,255,.09);
  --glow: rgba(126,240,195,.45);
  --shadow: rgba(0,0,0,.5);
  --btn-text: #0b0e1a;
  color-scheme: dark;
}
:root[data-theme="light"] {
  /* 粉白紫 4:4:2 —— 白与浅粉构成底色主体，紫作强调 */
  --bg: #ffffff;
  --bg-2: #ffeef8;
  --bg-3: #f3ecff;
  --text: #3a2a44;
  --text-dim: #9479a8;
  --accent: #8b5cf6;
  --accent-2: #ec4899;
  --card: rgba(255,255,255,.72);
  --card-border: rgba(139,92,246,.18);
  --glow: rgba(139,92,246,.35);
  --shadow: rgba(180,140,210,.25);
  --btn-text: #ffffff;
  color-scheme: light;
}

/* ============ 基础 ============ */
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.75;
  transition: background .3s ease, color .3s ease;
}
img { max-width: 100%; display: block; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

#progress-bar {
  position: fixed; top: 0; left: 0; height: 3px; width: 0;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  z-index: 100; transition: width .1s linear;
}

/* ============ Hero ============ */
.hero {
  min-height: 92vh;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
  background:
    radial-gradient(ellipse 60% 50% at 20% 20%, rgba(126,240,195,.12), transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 70%, rgba(78,168,255,.10), transparent 70%),
    linear-gradient(160deg, var(--bg) 0%, var(--bg-2) 60%, var(--bg-3) 100%);
  position: relative; overflow: hidden;
}
.hero-inner { max-width: 720px; padding: 2rem 1.5rem; position: relative; z-index: 1; }
.hero-eyebrow {
  display: inline-block; font-size: .8rem; letter-spacing: .35em;
  color: var(--accent); border: 1px solid var(--card-border);
  border-radius: 2rem; padding: .25rem 1rem; margin-bottom: 1.25rem;
  background: var(--card); backdrop-filter: blur(6px);
}
.hero-title {
  font-size: clamp(2.6rem, 8vw, 4.5rem); font-weight: 900;
  letter-spacing: .04em; text-shadow: 0 0 24px var(--glow);
  margin-bottom: .5rem;
}
.hero-sub { color: var(--text-dim); font-size: 1.05rem; margin-bottom: 2rem; }

/* shields 风格徽章 */
.hero-badges { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; }
.badge {
  display: inline-flex; align-items: stretch;
  font-size: .8rem; line-height: 1.2;
  border-radius: 4px; overflow: hidden;
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  box-shadow: 0 2px 8px var(--shadow);
  text-decoration: none;
  transition: transform .15s ease;
}
.badge:hover { text-decoration: none; transform: translateY(-1px); }
.badge-label { padding: .4rem .8rem; background: var(--accent); color: var(--btn-text); font-weight: 700; }
.badge-join .badge-label { padding-right: 1.4rem; }
.badge-status {
  background: var(--card); border: 1px solid var(--card-border);
  color: var(--text-dim); backdrop-filter: blur(6px);
}
.badge-status .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--text-dim); align-self: center; margin: 0 .55rem 0 .7rem;
  flex: none;
}
.badge-status.is-online .dot { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,.8); }
.badge-status.is-offline .dot { background: #f87171; }
.badge-status .badge-text { padding: .4rem .8rem .4rem 0; }

.hero-cta {
  display: inline-block; margin-top: 2.5rem; color: var(--text-dim);
  font-size: .95rem; transition: color .2s;
}
.hero-cta:hover { color: var(--accent); text-decoration: none; }

/* ============ 主布局：内容 + 大纲 ============ */
.layout {
  max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem 4rem;
  display: grid; grid-template-columns: minmax(0,1fr) 240px; gap: 3rem;
}
.section { margin-bottom: 4rem; scroll-margin-top: 1.5rem; }
.section h2 {
  font-size: 1.6rem; margin-bottom: 1rem; padding-bottom: .5rem;
  border-bottom: 1px solid var(--card-border);
}
.section-note { color: var(--text-dim); font-size: .9rem; margin-bottom: 1rem; }

.intro-fig { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
.intro-fig img { border-radius: 12px; border: 1px solid var(--card-border); }

/* ============ 主题切换按钮 ============ */
#theme-toggle {
  position: fixed; right: 1.2rem; bottom: 1.2rem;
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid var(--card-border); background: var(--card);
  color: var(--text); font-size: 1.2rem; cursor: pointer;
  backdrop-filter: blur(8px); z-index: 90;
  transition: transform .2s, box-shadow .2s;
}
#theme-toggle:hover { transform: scale(1.08); box-shadow: 0 0 16px var(--glow); }

/* ============ Toast ============ */
#toast {
  position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%) translateY(20px);
  background: var(--accent); color: var(--btn-text);
  padding: .5rem 1.2rem; border-radius: 8px; font-size: .9rem; font-weight: 600;
  opacity: 0; pointer-events: none; transition: all .25s ease; z-index: 110;
}
#toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ============ 大纲 ============ */
.toc {
  position: sticky; top: 1.5rem; align-self: start;
  max-height: calc(100vh - 3rem); overflow-y: auto;
}
.toc-head {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .85rem; font-weight: 700; color: var(--text-dim);
  letter-spacing: .15em; margin-bottom: .75rem;
}
#toc-toggle {
  background: none; border: 1px solid var(--card-border); color: var(--text-dim);
  border-radius: 6px; width: 24px; height: 24px; cursor: pointer; font-size: .8rem;
}
#toc-nav a {
  display: block; padding: .3rem .75rem; font-size: .85rem;
  color: var(--text-dim); border-left: 2px solid var(--card-border);
}
#toc-nav a.active { color: var(--accent); border-left-color: var(--accent); }
.toc.collapsed #toc-nav, .toc.collapsed .toc-head span { display: none; }
.toc.collapsed #toc-toggle { transform: rotate(180deg); }

/* T6-APPEND-POINT */
```

- [ ] **Step 2: 浏览器验证 Hero 与双主题**

Run: 打开 `index.html`
Expected: Hero 霓虹风完整（深底、光晕、徽章排）；DevTools 里把 `<html>` 的 `data-theme` 改为 `light`，整站变粉白紫；控制台仅剩 js 404

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: dual-theme CSS variables, hero, layout frame"
```

---

### Task 4: FAQ 内容迁移与重排版

**Files:**
- Modify: `index.html`（替换 `<!-- FAQ-TASK4-INSERT-POINT -->` 注释）

**Interfaces:**
- Produces: FAQ 子节锚点 `#faq-join`/`#faq-launcher`/`#faq-modpack`/`#faq-version`/`#faq-mobile`/`#faq-egg`；彩蛋入口类 `.egg-lazy`（T8 JS 依赖此选择器）

- [ ] **Step 1: 插入完整 FAQ 节**

将 `<!-- FAQ-TASK4-INSERT-POINT -->` 整行替换为：

```html
      <section class="section" id="faq" aria-labelledby="faq-h">
        <h2 id="faq-h">新手指引</h2>

        <h3 class="faq-sub" id="faq-join">正版验证与白名单</h3>
        <div class="faq-card">
          <ul class="faq-list">
            <li><b>正版验证</b>：当前两个开放服均无正版验证，离线账号可进。</li>
            <li><b>白名单</b>：进服前在群内召唤任意管理员上报游戏 ID，或按进服弹窗提示完成验证绑定。</li>
            <li><b>服务器地址</b>：见上方服务器表格，点地址旁的 ⧉ 按钮一键复制。</li>
          </ul>
        </div>

        <h3 class="faq-sub" id="faq-launcher">启动器选择</h3>
        <div class="faq-card">
          <p>不推荐使用官方启动器 —— 真的不好用。推荐使用第三方启动器，主流选择很多，这里推荐 <b>PCL2</b>。新手建议先看一遍 PCL2 下载游戏资源、安装模组与整合包的使用教程再动手。</p>
        </div>

        <h3 class="faq-sub" id="faq-modpack">整合包安装（以 PCL2 为例）</h3>
        <div class="faq-card">
          <ol class="faq-list">
            <li>在 <b>QQ 群文件 → 游戏资源</b> 找到整合包，点下载箭头开始下载。</li>
            <li>进度条走完后，箭头会变成文件夹图标，点它找到下载好的文件。</li>
            <li>打开 PCL2，把整合包文件<b>直接拖进</b> PCL2 窗口即可。</li>
          </ol>
          <p>其他启动器请自行搜索对应教程。</p>
        </div>

        <h3 class="faq-sub" id="faq-version">Java 版和基岩版有什么区别</h3>
        <div class="faq-card">
          <ul class="faq-list">
            <li><b>开发与平台</b>：基岩版用 C++ 开发，支持全平台跨平台联机；Java 版用 Java 开发，主要在电脑上运行（Windows / Mac / Linux 互通）。</li>
            <li><b>怎么判断自己是哪个版本</b>：游戏主菜单<b>右下角有"衣柜"按钮的是基岩版</b>，没有的是 Java 版。</li>
            <li><b>互通</b>：基岩版无法直接进入 Java 版服务器（除非服务器装了双端互通插件）。本站两个服务器均为 Java 版。</li>
          </ul>
        </div>

        <h3 class="faq-sub" id="faq-mobile">手机能玩吗</h3>
        <div class="faq-card">
          <ul class="faq-list">
            <li><b>基岩版</b>：可以直接进基岩服，不区分手机/电脑，但进不了 Java 服。</li>
            <li><b>Java 版</b>：可以用 <b>FCL</b> 等手机启动器运行 Java 版进服（含部分模组服，前提是模组支持手机运行）。</li>
          </ul>
        </div>

        <h3 class="faq-sub" id="faq-egg">文本和链接太多了，我不想看怎么办</h3>
        <div class="faq-card">
          <p>别慌，<a href="https://zh.wikipedia.org/wiki/失读症" class="egg-lazy">点这里</a>，直达治疗阅读障碍的页面。</p>
        </div>
      </section>
```

- [ ] **Step 2: 验证插入完整**

Run: `grep -c "faq-sub" index.html`
Expected: 6

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: migrate yuque FAQ content into redesigned sections"
```

---

### Task 5: 服务器数据模块 + 表格渲染 + 测试

**Files:**
- Create: `js/servers.js`
- Create: `tests/servers.test.js`

**Interfaces:**
- Consumes: T2 的 `<tbody id="server-rows">`、`<tbody id="archive-rows">`
- Produces: `js/servers.js` 同时暴露浏览器全局 `MC_SERVERS` 与 `module.exports`（Node 测试）。导出对象 `{ SERVERS_ACTIVE, SERVERS_ARCHIVED, renderServerTables }`。开放服字段：`name/version/type/address/modpack/noauth`；历史服字段：`name/version/type/address/closed/note`。渲染输出的行内含 `data-copy`（复制按钮）与 `data-status-for`（状态徽章）属性，T8 依赖

- [ ] **Step 1: 写失败测试 `tests/servers.test.js`**

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { SERVERS_ACTIVE, SERVERS_ARCHIVED } = require('../js/servers.js');

test('active servers: exactly 2, both no-auth, addresses correct', () => {
  assert.equal(SERVERS_ACTIVE.length, 2);
  assert.deepEqual(SERVERS_ACTIVE.map(s => s.address).sort(), ['ssjj2.top', 'ssjj3.top']);
  assert.ok(SERVERS_ACTIVE.every(s => s.noauth === true));
});

test('archived servers: 10 entries, all closed', () => {
  assert.equal(SERVERS_ARCHIVED.length, 10);
  assert.ok(SERVERS_ARCHIVED.every(s => s.closed === true));
});

test('every server has name/version/address', () => {
  for (const s of [...SERVERS_ACTIVE, ...SERVERS_ARCHIVED]) {
    assert.ok(s.name && s.version && s.address, 'missing field in ' + s.name);
  }
});
```

- [ ] **Step 2: 运行确认失败**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module '.../js/servers.js'`

- [ ] **Step 3: 写 `js/servers.js`**

```js
/* 服务器数据 —— 以后更新服务器状态只改本文件。
   开放服字段: name/version/type/address/modpack/noauth
   历史服字段: name/version/type/address/closed/note */
(function (global) {
  'use strict';

  const SERVERS_ACTIVE = [
    {
      name: '1.21.11 生存服',
      version: 'Java 1.21.11',
      type: '生存',
      address: 'ssjj2.top',
      modpack: '无需整合包',
      noauth: true
    },
    {
      name: '亡者世界',
      version: 'Java 1.20.1',
      type: '生存 · 整合包',
      address: 'ssjj3.top',
      modpack: '群文件 → 游戏资源',
      noauth: true
    }
  ];

  const SERVERS_ARCHIVED = [
    { name: '1.21 纯生存服', version: 'Java/基岩 1.21', type: '生存', address: 'ssjj2.top', closed: true, note: '基岩端 be.ssjj2.top 端口 30746' },
    { name: '1.21 纯生存创造服', version: 'Java 1.21', type: '创造', address: 'cz.ssjj2.top', closed: true, note: '' },
    { name: '1.21.11 创造服', version: 'Java 1.21.11', type: '创造', address: 'ssjj2.top', closed: true, note: '与生存服共用入口' },
    { name: '女仆生存服', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'xx.ssjj2.top', closed: true, note: '养老生活2 整合包' },
    { name: '女仆生存创造服', version: 'Java 1.20.1', type: '创造', address: 'xxcz.ssjj2.top', closed: true, note: '' },
    { name: '死亡突围', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'xx.ssjj2.top', closed: true, note: '整合包位于群文件' },
    { name: '女仆生存 vanilla+', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'md.ssjj2.top', closed: true, note: '养老生活 vanilla+ 整合包' },
    { name: '脆骨症黯光', version: 'Java 1.19.2', type: '生存 · 整合包', address: 'cs.ssjj2.top', closed: true, note: '"没有血肉的胸部" · 有正版验证' },
    { name: '重度机械症航空学', version: 'Java 1.21.1', type: '生存 · 整合包', address: 'n.ssjj3.top', closed: true, note: 'Mechanomania-1.1.7.3 · 有正版验证' },
    { name: '2025 愚人节版本', version: '活动限定', type: '活动', address: 'yr.ssjj2.top', closed: true, note: '愚人节限定' }
  ];

  function renderServerTables() {
    const activeTbody = document.getElementById('server-rows');
    const archiveTbody = document.getElementById('archive-rows');
    if (!activeTbody || !archiveTbody) return;

    activeTbody.innerHTML = SERVERS_ACTIVE.map(function (s) {
      return '<tr>' +
        '<td><b>' + s.name + '</b></td>' +
        '<td>' + s.version + '</td>' +
        '<td>' + s.type + '</td>' +
        '<td class="addr-cell"><code>' + s.address + '</code>' +
        '<button class="copy-btn" data-copy="' + s.address + '" title="复制地址">⧉</button></td>' +
        '<td>' + s.modpack + '</td>' +
        '<td><span class="status-badge" data-status-for="' + s.address + '">查询中…</span></td>' +
        '</tr>';
    }).join('');

    archiveTbody.innerHTML = SERVERS_ARCHIVED.map(function (s) {
      return '<tr>' +
        '<td><b>' + s.name + '</b></td>' +
        '<td>' + s.version + '</td>' +
        '<td>' + (s.note || '—') + '</td>' +
        '<td><code>' + s.address + '</code></td>' +
        '</tr>';
    }).join('');
  }

  const api = { SERVERS_ACTIVE: SERVERS_ACTIVE, SERVERS_ARCHIVED: SERVERS_ARCHIVED, renderServerTables: renderServerTables };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { global.MC_SERVERS = api; }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: 运行测试至通过**

Run: `node --test tests/`
Expected: 3 pass

- [ ] **Step 5: Commit**

```bash
git add js/servers.js tests/
git commit -m "feat: server data module with node:test coverage"
```

---

### Task 6: CSS 表格/FAQ 卡/页脚/动效/响应式补全

**Files:**
- Modify: `css/style.css`（替换末尾 `/* T6-APPEND-POINT */` 注释为下述内容）

**Interfaces:**
- Consumes: T2/T4/T5 类名 `.table-wrap`/`.server-table`/`.archive-box`/`.faq-sub`/`.faq-card`/`.faq-list`/`.addr-cell`/`.copy-btn`/`.status-badge`/`.footer`/`.egg-btn`
- Produces: `.reveal`/`.reveal.visible` 动效类（T7 JS 加 `visible` 类）

- [ ] **Step 1: 追加样式**

```css
/* ============ 表格 ============ */
.table-wrap {
  overflow-x: auto; border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card); backdrop-filter: blur(8px);
}
.server-table { width: 100%; border-collapse: collapse; font-size: .92rem; }
.server-table th {
  text-align: left; padding: .7rem 1rem; font-size: .78rem;
  letter-spacing: .08em; color: var(--text-dim);
  border-bottom: 1px solid var(--card-border); white-space: nowrap;
}
.server-table td { padding: .7rem 1rem; border-bottom: 1px solid var(--card-border); }
.server-table tr:last-child td { border-bottom: none; }
.server-table tbody tr:hover td { background: rgba(127,127,127,.06); }
.addr-cell { white-space: nowrap; }
.addr-cell code, .archive-table code { font-family: ui-monospace, Consolas, monospace; color: var(--accent); }
.copy-btn {
  margin-left: .4rem; background: none; border: 1px solid var(--card-border);
  border-radius: 6px; color: var(--text-dim); cursor: pointer;
  font-size: .8rem; padding: .05rem .4rem; transition: all .15s;
}
.copy-btn:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 10px var(--glow); }
.status-badge { font-size: .8rem; color: var(--text-dim); white-space: nowrap; }
.status-badge.online { color: #34d399; font-weight: 600; }
.status-badge.offline { color: #f87171; font-weight: 600; }

.archive-box {
  border: 1px solid var(--card-border); border-radius: 12px;
  background: var(--card); padding: 0 1.2rem;
}
.archive-box summary { cursor: pointer; padding: 1rem 0; font-weight: 600; color: var(--text-dim); }
.archive-box summary:hover { color: var(--accent); }
.archive-box[open] summary { border-bottom: 1px solid var(--card-border); margin-bottom: .8rem; }

/* ============ FAQ ============ */
.faq-sub { font-size: 1.15rem; margin: 2rem 0 .8rem; scroll-margin-top: 1.5rem; }
.faq-card {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: 12px; padding: 1.2rem 1.4rem; backdrop-filter: blur(8px);
}
.faq-list { list-style: none; }
.faq-list li { padding: .5rem 0; border-bottom: 1px dashed var(--card-border); }
.faq-list li:last-child { border-bottom: none; }
.faq-list b { color: var(--accent); }
ol.faq-list { counter-reset: step; }
ol.faq-list li { counter-increment: step; padding-left: 2rem; position: relative; }
ol.faq-list li::before {
  content: counter(step); position: absolute; left: 0; top: .55rem;
  width: 1.3rem; height: 1.3rem; border-radius: 50%;
  background: var(--accent); color: var(--btn-text);
  font-size: .75rem; font-weight: 700; display: flex;
  align-items: center; justify-content: center;
}

/* ============ 页脚 ============ */
.footer {
  border-top: 1px solid var(--card-border); padding: 2.5rem 1.5rem 3.5rem;
  text-align: center; color: var(--text-dim); font-size: .9rem;
  background: linear-gradient(180deg, transparent, var(--bg-2));
}
.footer-links { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin: 1rem 0; }
.footer-links a { color: var(--text-dim); }
.footer-links a:hover { color: var(--accent); text-decoration: none; }
.footer-fine { font-size: .78rem; opacity: .6; }
.egg-btn { font-weight: 900; opacity: .35; }

/* ============ 动效 ============ */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
.reveal.visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .reveal { transition: none; opacity: 1; transform: none; }
  html { scroll-behavior: auto; }
}

/* ============ 响应式 ============ */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; gap: 1.5rem; }
  .toc {
    position: fixed; top: auto; bottom: 5rem; right: 1.2rem; z-index: 80;
    width: min(70vw, 260px); max-height: 55vh;
    background: var(--bg); border: 1px solid var(--card-border);
    border-radius: 12px; padding: .8rem 1rem;
    box-shadow: 0 8px 30px var(--shadow);
  }
  .toc.collapsed { width: auto; padding: .4rem .6rem; }
  .intro-fig { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: 浏览器验证（1200px 与 375px 视口）**

Run: 打开 `index.html`，DevTools 设备模拟
Expected: 桌面双栏（内容+右侧粘性大纲）；375px 单栏、大纲缩为右下角小按钮（T7 前手动给它加 `collapsed` 类预览效果）、表格容器内横向滚动不破版；FAQ 卡/编号列表/页脚样式就绪

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: table/faq/footer styles, reveal motion, responsive breakpoints"
```

---

### Task 7: main.js — 主题/大纲/进度条/动效/表格渲染

**Files:**
- Create: `js/main.js`

**Interfaces:**
- Consumes: T2 挂载点（`#theme-toggle`/`#toc`/`#toc-toggle`/`#toc-nav`/`#progress-bar`）、T4 的 `h2` 锚点、T5 的 `MC_SERVERS.renderServerTables()`、T6 的 `.reveal`
- Produces: `window.MC_MAIN = { showToast, queryAndApplyStatus }` — T8 直接调用/复用（`queryAndApplyStatus` T8 定义后挂上来）

- [ ] **Step 1: 写 `js/main.js`**

```js
/* 主题切换 / 表格渲染 / 大纲 / 进度条 / 滚动动效 */
(function () {
  'use strict';

  /* --- 主题（初始主题已由 head 内联脚本确定，这里只管切换） --- */
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* 隐私模式 */ }
      toggleBtn.textContent = next === 'dark' ? '🌙' : '☀️';
    });
  }

  /* --- 渲染服务器表格 --- */
  if (window.MC_SERVERS && typeof window.MC_SERVERS.renderServerTables === 'function') {
    window.MC_SERVERS.renderServerTables();
  }

  /* --- 大纲生成 + 滚动高亮 --- */
  const tocNav = document.getElementById('toc-nav');
  const headings = Array.prototype.slice.call(document.querySelectorAll('#content h2'));
  if (tocNav && headings.length) {
    tocNav.innerHTML = headings.map(function (h) {
      return '<a href="#' + h.id + '">' + h.textContent + '</a>';
    }).join('');
    const links = Array.prototype.slice.call(tocNav.querySelectorAll('a'));
    const setActive = function (id) {
      links.forEach(function (a) { a.classList.toggle('active', a.hash === '#' + id); });
    };
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(function (h) { obs.observe(h); });
  }

  /* --- 大纲折叠（记忆 + 手机默认收起） --- */
  const tocAside = document.getElementById('toc');
  const tocToggle = document.getElementById('toc-toggle');
  if (tocAside && tocToggle) {
    tocToggle.addEventListener('click', function () {
      tocAside.classList.toggle('collapsed');
      try {
        localStorage.setItem('toc-collapsed', tocAside.classList.contains('collapsed') ? '1' : '0');
      } catch (e) { /* 隐私模式 */ }
    });
    let saved = null;
    try { saved = localStorage.getItem('toc-collapsed'); } catch (e) { /* 隐私模式 */ }
    if (saved === '1' || (saved === null && matchMedia('(max-width: 900px)').matches)) {
      tocAside.classList.add('collapsed');
    }
  }

  /* --- 顶部进度条 --- */
  const bar = document.getElementById('progress-bar');
  const updateBar = function () {
    const h = document.documentElement;
    const denom = h.scrollHeight - h.clientHeight;
    bar.style.width = (denom > 0 ? (h.scrollTop / denom) * 100 : 0) + '%';
  };
  document.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  /* --- 滚动滑入动效（respect 减动效偏好） --- */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section, .faq-card, .table-wrap').forEach(function (el) {
      el.classList.add('reveal');
      revealObs.observe(el);
    });
  }

  /* --- Toast（T8 复用） --- */
  const toast = document.getElementById('toast');
  let toastTimer = null;
  const showToast = function (msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  };

  window.MC_MAIN = { showToast: showToast };
})();
```

- [ ] **Step 2: 浏览器验证**

Run: 打开 `index.html`
Expected: 控制台无报错；表格渲染出 2 开放 + 10 历史行；右侧大纲列出全部 h2 且滚动高亮跟随；点 « 收起大纲、刷新后保持；右下角 🌙 切换主题、刷新后保持；进度条随滚动增长；区块滑入动效

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: theme toggle, toc with scrollspy, progress bar, reveal motion"
```

---

### Task 8: 状态查询 + 地址复制 + 彩蛋

**Files:**
- Modify: `js/main.js`（IIFE 内、`window.MC_MAIN = ...` 之前插入功能块，并把 `window.MC_MAIN` 行改为含新导出）

**Interfaces:**
- Consumes: T5 的 `data-status-for`/`data-status-host`/`data-copy`、T2 的 `.badge-text`/`.dot`、T7 的 `showToast`
- Produces: 最终页 — 无下游依赖

- [ ] **Step 1: main.js 插入状态查询块（在 `window.MC_MAIN = { showToast: showToast };` 之前）**

```js
  /* --- 服务器实时状态（api.mcsrvstat.us，失败降级为"人数未知"） --- */
  const statusCells = Array.prototype.slice.call(document.querySelectorAll('.status-badge[data-status-for]'));
  const heroBadges = Array.prototype.slice.call(document.querySelectorAll('.badge-status[data-status-host]'));
  const queryStatus = function (host) {
    return fetch('https://api.mcsrvstat.us/3/' + host)
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (data) {
        return data.online
          ? { online: true, players: data.players && data.players.online }
          : { offline: true };
      })
      .catch(function () { return { unknown: true }; });
  };
  const applyToCell = function (el, state) {
    if (state.online) {
      el.textContent = (typeof state.players === 'number' ? '在线 · ' + state.players + ' 人' : '在线');
      el.classList.add('online');
    } else if (state.offline) {
      el.textContent = '离线';
      el.classList.add('offline');
    } else {
      el.textContent = '在线 · 人数未知';
    }
  };
  const applyToHeroBadge = function (badge, state) {
    const text = badge.querySelector('.badge-text');
    if (state.online) { text.textContent += ' · 在线'; badge.classList.add('is-online'); }
    else if (state.offline) { text.textContent += ' · 离线'; badge.classList.add('is-offline'); }
    /* unknown：保持原样 */
  };
  const queryAndApplyStatus = function () {
    const hosts = [];
    statusCells.forEach(function (el) { if (hosts.indexOf(el.dataset.statusFor) < 0) hosts.push(el.dataset.statusFor); });
    hosts.forEach(function (host) {
      queryStatus(host).then(function (state) {
        statusCells.forEach(function (el) { if (el.dataset.statusFor === host) applyToCell(el, state); });
        heroBadges.forEach(function (b) { if (b.dataset.statusHost === host) applyToHeroBadge(b, state); });
      });
    });
  };
  queryAndApplyStatus();
```

- [ ] **Step 2: main.js 插入复制与彩蛋块（紧接上一块之后），并更新导出行**

```js
  /* --- 地址一键复制（事件委托，覆盖动态渲染的按钮） --- */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.copy)
      .then(function () { showToast('已复制：' + btn.dataset.copy); })
      .catch(function () { showToast('复制失败，请手动复制'); });
  });
```

同时把导出行改为：

```js
  window.MC_MAIN = { showToast: showToast, queryAndApplyStatus: queryAndApplyStatus };
```

（说明：彩蛋①「关于作者」与③「千万别点」是 T2 页脚里的普通外链，直接跳 B 站，无需 JS；彩蛋②「点这里」是 T4 FAQ 里的普通外链跳维基失读症页，同样无需 JS。三处彩蛋至此全部落地。）

- [ ] **Step 3: 浏览器验证**

Run: 打开 `index.html`
Expected: 表格状态列从"查询中…"变为「在线 · N 人」（绿）/「离线」（红）/「在线 · 人数未知」（灰，API 挂时）；Hero 徽章点变绿且文字追加"· 在线"；点 ⧉ 弹 toast 且剪贴板内容正确；页脚「关于作者」与小数点「.」打开 B 站视频；FAQ「点这里」打开维基失读症页

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "feat: live server status, copy-to-clipboard, easter egg links"
```

---

### Task 9: 端到端验证 + 部署

**Files:** 无新文件 — 只读验证与 git 操作

**Interfaces:**
- Consumes: 全部前序任务

- [ ] **Step 1: 本地全清单验证**

Run: `node --test tests/` + 浏览器打开 `index.html`

Checklist（逐项确认）:
- [ ] `node --test tests/` 3 pass
- [ ] 控制台零报错
- [ ] 深色↔亮色切换、刷新保持
- [ ] Hero 徽章状态点颜色正确
- [ ] 表格 2 开放 + 10 历史（档案馆展开后）
- [ ] 大纲折叠/展开、滚动高亮
- [ ] 375px 视口页面无横向滚动（表格容器内允许）
- [ ] 复制按钮 + toast
- [ ] 三处彩蛋链接正确
- [ ] 图片正常加载

- [ ] **Step 2: 提交并推送**

```bash
git add -A
git commit -m "chore: final e2e pass" --allow-empty
git push origin main
```

- [ ] **Step 3: GitHub Pages 启用（若未启用）**

若 https://moedawn.github.io 404：需用户在浏览器操作 GitHub → 仓库 Settings → Pages → Source 选 `Deploy from a branch` → `main` / `/ (root)` → Save（执行者无权代替登录）。启用后等 1-2 分钟。

- [ ] **Step 4: 线上验证**

Run: 访问 https://moedawn.github.io
Expected: 与本地一致；F12 无报错；用 DevTools 375px 模拟手机再过一遍清单

---

## 自审记录

- 规格覆盖：Hero/双主题/表格/档案馆/FAQ/大纲/状态查询/动效/进度条/复制/三彩蛋/图片本地化/部署 — 均有对应任务
- 占位符扫描：无 TBD/TODO/中间态版本；所有代码块为可直接写入的最终内容
- 类型一致性：`MC_SERVERS`（T5 导出↔T7 消费）、`MC_MAIN.showToast`（T7 定义↔T8 使用）、`data-status-for`/`data-status-host`/`data-copy`/`.egg-lazy`→（T4 修正为外链后实际未用 JS，T8 说明）、`.badge-text`（T2 结构↔T8 更新）全部对齐
- 历史服数量：10 条（T5 数据↔测试↔T2 summary 文案一致）；规格文档中"7 个"已过时，需同步更正为 10
