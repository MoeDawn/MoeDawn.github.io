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

  /* --- Toast（供复制反馈用） --- */
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
