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

  /* --- Toast（供复制反馈用） --- */
  const toast = document.getElementById('toast');
  let toastTimer = null;
  const showToast = function (msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  };

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

  window.MC_MAIN = { showToast: showToast, queryAndApplyStatus: queryAndApplyStatus };
})();
