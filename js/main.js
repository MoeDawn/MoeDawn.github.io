/* 主题切换 / 表格渲染 / 大纲 / 进度条 / 滚动动效 */
(function () {
  'use strict';

  /* 彩蛋：控制台整人警告 + 伪装成日志的 /config 暗门提示 */
  console.log('%c虽然不知道你想干什么,但是当你看到这句话的时候,后台已读取并封禁你在群内的社交账号与游戏id和常用IP', 'color:#f87171;font-size:14px;font-weight:bold');
  console.log('%c[ERROR] /config 端口未能正常关闭: resource leak detected', 'color:#f87171;font-family:monospace');
  console.log('%c[INFO] 算了，没人会看控制台的。……你应该不会去点吧?', 'color:#8b93b8;font-family:monospace');

  /* --- 主题（初始主题已由 head 内联脚本确定，这里只管切换） --- */
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  /* 连点彩蛋：toast 序列 */
  const CHAOS_LINES = ['已为你切换主题色!', '嗯...', '你到底需要什么?', '好吧..好吧..'];
  let themeClickCount = 0;
  let toastTimer = null;
  /* 彩蛋主题状态机：idle → mended（进入彩蛋主题） */
  let chaosState = 'idle';
  let mendedClickCount = 0; /* 彩蛋主题下点 💫 的次数：第 10 次泄露 /config */
  /* starfield 极光模式入口（由 starfield IIFE 填充） */
  let chaosHook = null;
  const toastEl = document.getElementById('toast');
  const showToast = function (msg, duration) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, duration || 1800);
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      /* 彩蛋主题下按钮变眩晕图标：点击弹警告，不再切主题 */
      if (chaosState === 'mended') {
        mendedClickCount++;
        if (mendedClickCount === 10) {
          /* 二层彩蛋：追踪"不稳定源"，泄露暗门坐标 */
          showToast('鉴权未通过! 不稳定源...定位完成: /config', 3200);
        } else {
          showToast('此界面..不稳定..可能有异常现象', 2600);
        }
        return;
      }

      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* 隐私模式 */ }
      toggleBtn.textContent = next === 'dark' ? '🌙' : '☀️';

      /* 连点 4 次：每弹一句；第 5 次直接进入彩蛋主题并同时弹"如你所愿" */
      themeClickCount++;
      if (themeClickCount <= 4) {
        showToast(CHAOS_LINES[themeClickCount - 1], 2200);
      } else if (themeClickCount === 5) {
        chaosState = 'mended';
        showToast('如你所愿', 2400);
        /* 深色为基底进入光暗融合的彩蛋主题；按钮变眩晕图标 */
        root.dataset.theme = 'dark';
        try { localStorage.setItem('theme', 'dark'); } catch (e) { /* 隐私模式 */ }
        toggleBtn.textContent = '💫';
        root.classList.add('chaos-theme');
        window.MC_MAIN && window.MC_MAIN.enterChaosTheme && window.MC_MAIN.enterChaosTheme();
      }
    });
  }

  /* --- 渲染服务器表格 + Hero 状态徽章 --- */
  if (window.MC_SERVERS && typeof window.MC_SERVERS.renderServerTables === 'function') {
    window.MC_SERVERS.renderServerTables();
  }
  if (window.MC_SERVERS && typeof window.MC_SERVERS.renderHeroBadges === 'function') {
    window.MC_SERVERS.renderHeroBadges();
  }

  /* --- 大纲生成（h2 章节 + h3 小节两级） + 滚动高亮 --- */
  const tocNav = document.getElementById('toc-nav');
  const headings = Array.prototype.slice.call(document.querySelectorAll('#content h2, #content h3.faq-sub'));
  if (tocNav && headings.length) {
    tocNav.innerHTML = headings.map(function (h) {
      const level = h.tagName === 'H2' ? 'toc-l1' : 'toc-l2';
      const text = h.tagName === 'H2' ? h.textContent : '- ' + h.textContent;
      return '<a class="' + level + '" href="#' + h.id + '">' + text + '</a>';
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

  /* --- 服务器实时状态（api.mcstatus.io；mcsrvstat 海外节点连不上 simpfun，勿换回） --- */
  const statusCells = Array.prototype.slice.call(document.querySelectorAll('.status-badge[data-status-for]'));
  const heroBadges = Array.prototype.slice.call(document.querySelectorAll('.badge-status[data-status-host]'));
  const queryStatus = function (host) {
    return fetch('https://api.mcstatus.io/v2/status/java/' + encodeURIComponent(host))
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

  /* --- 地址一键复制（事件委托，覆盖动态渲染的按钮） --- */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.copy)
      .then(function () { showToast('已复制：' + btn.dataset.copy); })
      .catch(function () { showToast('复制失败，请手动复制'); });
  });

  /* --- 页脚深夜徽章：实时本机时间（每分钟刷新） --- */
  const nightTime = document.getElementById('night-time');
  if (nightTime) {
    const pad = function (n) { return (n < 10 ? '0' : '') + n; };
    const tick = function () {
      const t = new Date();
      nightTime.textContent = pad(t.getHours()) + ':' + pad(t.getMinutes());
    };
    tick();
    setInterval(tick, 30000);
  }

  /* --- 夜间视差粒子星层（静态绘制 + 鼠标视差偏移，无动画循环） --- */
  (function () {
    const canvas = document.getElementById('starfield');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    let stars = [];
    function paint() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      /* 密度随屏幕面积，桌面约 120 颗 */
      const count = Math.min(160, Math.floor(canvas.width * canvas.height / 12000));
      stars = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random() * .7 + .3; /* 视差深度：远的小浅，近的大亮 */
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.3 + .6, /* 与彩蛋粒子同款：基准大 0.3px */
          a: Math.random() * .45 + .15,
          depth: depth,
          color: depth > .8 ? '#4ea8ff' : (Math.random() < .06 ? '#7ef0c3' : '#e8eaf6')
        });
      }
      draw(0, 0);
    }
    function draw(dx, dy) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(function (s) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x + dx * s.depth, s.y + dy * s.depth, s.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    /* ===== 彩蛋主题：极光飘落模式 =====
       细碎粒子从画面外（上方为主、密度更大）缓缓向下飘落，路径带一丝微弱的
       顺时针偏转 —— 全程仅转过小半道弧度，绝不完成整圈回转。
       粒子分 4 团错峰激活 → 画内可见数量越来越多；飞出视野后回顶部画外重生，
       可重复流转。全局速度随进入彩蛋主题的时间持续缓慢上升（"未知后果"），
       封顶防失控。 */
    const chaos = { on: false, rafId: null, t0: 0, last: 0, flakes: [], W: 0, H: 0, accel: 1, margin: 0 };
    const CHAOS_WAVE_GAP = 6000; /* 相邻粒子团的激活间隔（ms），4 团共 18s 全部入场 */
    function chaosSpawn() {
      const W = canvas.width, H = canvas.height;
      chaos.W = W; chaos.H = H;
      const diag = Math.hypot(W, H);
      chaos.margin = diag * .35;
      /* 初始可见量与深色模式星空完全一致（同公式）；另外 3 波为增援，
         各隔 6s 入场 —— 进场不缺粒子，之后越来越密 */
      const base = Math.min(160, Math.floor(W * H / 12000));
      const COUNT = base * 4;
      const MARGIN = chaos.margin;
      const now = performance.now();
      chaos.flakes = [];
      for (let i = 0; i < COUNT; i++) {
        const wave = i % 4; /* 4 个粒子团，错峰激活 */
        /* 第 1 团直接布满全画面（进场瞬间密度 = 深色星空）；
           后续 3 团从画外出发涌入：约 7 成在上方画外，3 成在左右两侧画外 */
        let x, y;
        if (wave === 0) {
          x = Math.random() * W;
          y = Math.random() * H * 1.15 - H * .1;
        } else if (Math.random() < .7) {
          x = Math.random() * (W + MARGIN * 2) - MARGIN;
          y = -Math.random() * MARGIN - 10;
        } else {
          const side = Math.random() < .5 ? -1 : 1;
          x = side < 0 ? -Math.random() * MARGIN - 10 : W + Math.random() * MARGIN + 10;
          y = Math.random() * H * 1.2 - H * .1;
        }
        chaos.flakes.push({
          x: x, y: y,
          speed: Math.random() * .04 + .028,             /* px/ms 基础速度（缓缓飘落） */
          dir: Math.PI / 2 + (Math.random() - .5) * .1,  /* 初始朝向 ≈ 正下（微扰） */
          dDir: -(Math.random() * .00004 + .00002),      /* 顺时针偏转：全程约转过小半弧 */
          r: Math.random() * 1.3 + .6,                   /* 与深色星空同分布，整体大 0.3px */
          a: Math.random() * .4 + .15,
          wave: wave,
          startAt: now + wave * CHAOS_WAVE_GAP,          /* 错峰激活时刻 */
          color: Math.random() < .14 ? '#7ef0c3' : (Math.random() < .3 ? '#a9c8ff' : '#e8f0ff')
        });
      }
    }
    function chaosRespawn(f) {
      const MARGIN = chaos.margin;
      f.x = Math.random() * (chaos.W + MARGIN * 2) - MARGIN;
      f.y = -Math.random() * MARGIN - 10;
      f.dir = Math.PI / 2 + (Math.random() - .5) * .1;
      f.speed = Math.random() * .04 + .028;
    }
    function chaosDraw(now) {
      const dt = Math.min(64, now - chaos.last); /* 防后台切回时 dt 爆炸 */
      chaos.last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const H = chaos.H;
      /* 全局加速：持续微小累积，永不封顶 —— 页面停留越久飘落越快
         （"可能有异常现象"的未知后果，随时间无限升温） */
      chaos.accel = 1 + (now - chaos.t0) * .000025;
      ctx.globalCompositeOperation = 'lighter';
      chaos.flakes.forEach(function (f) {
        if (now < f.startAt) return; /* 未激活的团：错峰入场，可见数量越来越多 */
        /* 顺时针偏转 + 沿朝向推进（屏幕坐标 dir 递减 = 视觉顺时针弯） */
        f.dir += f.dDir * dt;
        f.x += Math.cos(f.dir) * f.speed * chaos.accel * dt;
        f.y += Math.sin(f.dir) * f.speed * chaos.accel * dt;
        /* 飞出视野 → 回顶部画外重生（循环流转不止） */
        if (f.y > H + 40 || f.x < -chaos.margin || f.x > chaos.W + chaos.margin) chaosRespawn(f);
        /* 顶部渐显 + 底部渐隐 */
        const fadeIn = Math.min(1, Math.max(0, (f.y + 100) / 200));
        const fadeOut = Math.min(1, Math.max(0, (H + 40 - f.y) / 80));
        const alpha = f.a * fadeIn * fadeOut;
        if (alpha <= .01) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      chaos.rafId = requestAnimationFrame(chaosDraw);
    }
    function chaosStart() {
      if (chaos.on) return;
      chaos.on = true;
      chaos.t0 = chaos.last = performance.now();
      chaosSpawn();
      if (chaos.rafId === null) chaos.rafId = requestAnimationFrame(chaosDraw);
    }

    paint();
    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        paint();
        if (chaos.on) chaosSpawn();
      }, 200);
    });

    /* 鼠标视差：目标偏移 ±45px，缓动跟随（rAF 只在鼠标移动后短暂活跃） */
    let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null;
    document.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - .5) * -90;
      ty = (e.clientY / window.innerHeight - .5) * -90;
      if (!chaos.on && rafId === null) rafId = requestAnimationFrame(step);
    }, { passive: true });
    function step() {
      cx += (tx - cx) * .08;
      cy += (ty - cy) * .08;
      draw(cx, cy);
      if (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
      }
    }

    /* 主题切到亮色时清掉画布，切回夜间重画 */
    const mo = new MutationObserver(function () {
      if (root.dataset.theme === 'dark') paint();
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    /* 彩蛋主题入口：starfield 在 MC_MAIN 赋值之前执行，通过外层 hook 变量桥接 */
    chaosHook = chaosStart;
  })();

  window.MC_MAIN = {
    showToast: showToast,
    queryAndApplyStatus: queryAndApplyStatus,
    enterChaosTheme: function () { if (chaosHook) chaosHook(); }
  };

  /* --- 愚人节模式：每年 4 月 1 日自动触发页面整蛊 --- */
  (function () {
    const now = new Date();
    if (now.getMonth() === 3 && now.getDate() === 1) {
      document.documentElement.classList.add('april-fools');
    }
  })();
})();
