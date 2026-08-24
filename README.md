# 新人须知问题 兼 脑溢血急救中心

MC 服务器「脑溢血急救中心」的官方宣传页 + 新人 FAQ，托管在 GitHub Pages。

线上地址：<https://www.ssjj3.top> （备用 <https://moedawn.github.io>）

## 怎么改这个网站

全部是纯 HTML/CSS/JS，没有构建步骤，改完文件推送 GitHub 就自动发布。

### 常见修改对照表

| 我想改什么 | 改哪个文件 | 怎么改 |
|---|---|---|
| 开/关服务器、改版本或地址 | `js/servers.js` | 开放中的服务器在 `SERVERS_ACTIVE` 数组里增删条目；关掉的服务器**移入** `SERVERS_ARCHIVED` 数组并加 `closed: true`。改完运行 `node --test tests/` 确认测试通过 |
| 页面文字、FAQ 内容 | `index.html` | 直接搜中文找到对应段落改文字。注意：文案句尾不加句号（段落内部可以有） |
| 服务器介绍/氛围图 | `images/` | 图片放进 `images/` 目录，在 `index.html` 里引用 `images/文件名` |
| 网站图标 | 仓库根目录 `icon.png` | 直接替换同名文件 |
| 配色、主题 | `css/style.css` 顶部的 CSS 变量 | `--bg` 背景、`--accent` 强调色等，改一处全站生效 |
| QQ 群链接 | `index.html` | 搜 `qm.qq.com`，全部替换成新链接（Hero、页脚各一处） |
| 域名绑定 | 仓库根目录 `CNAME` | 内容为 `www.ssjj3.top`，配合 GitHub Pages 设置生效 |

### 本地预览

改完想先看效果再推送：

```bash
npx serve -l 8660 .     # 然后浏览器打开 http://localhost:8660
```

URL 加 `?theme=light` 可以直接预览亮色主题。

### 推送发布

```bash
git add -A
git commit -m "描述这次改了什么"
git push origin main
```

推送后约 1 分钟，GitHub Pages 自动更新到线上。

## 项目结构

```
index.html          页面结构 + 全部文案
css/style.css       样式（深/浅双主题 CSS 变量、表格、FAQ、动效、愚人节整蛊）
js/servers.js       服务器数据（改服务器只动这里）
js/main.js          交互逻辑（主题切换、目录、实时状态、彩蛋）
404.html            自定义 404 页
images/             图片资源
tests/              servers.js 的数据校验测试（node --test tests/）
```

## 技术要点

- **零依赖**：纯原生三件套，无构建工具、无框架、无 CDN 库
- **实时状态**：用 `api.mcstatus.io` 查询服务器在线人数与 MOTD（**不要**换回 mcsrvstat.us —— 它的海外节点连不上 simpfun 机房，会误报离线）
- **双主题**：默认深色霓虹，亮色粉白紫；`prefers-color-scheme` 跟随系统 + localStorage 记忆 + `?theme=` 参数直链
- **彩蛋**：页脚"关于作者"和"千万别点"、FAQ"点这里"、控制台整人警告、每年 4 月 1 日自动触发的页面整蛊、自定义 404
