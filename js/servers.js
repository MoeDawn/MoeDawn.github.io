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

  function renderHeroBadges() {
    const heroBadges = document.querySelector('.hero-badges');
    if (!heroBadges || !window.MC_SERVERS) return;
    heroBadges.insertAdjacentHTML('beforeend', SERVERS_ACTIVE.map(function (s) {
      const label = s.name + (s.version ? ' ' + s.version.replace(/^Java /, '') : '');
      return '<span class="badge badge-status" data-status-host="' + s.address + '">' +
        '<span class="dot"></span><span class="badge-text">' + label + '</span></span>';
    }).join(''));
  }

  const api = { SERVERS_ACTIVE: SERVERS_ACTIVE, SERVERS_ARCHIVED: SERVERS_ARCHIVED, renderServerTables: renderServerTables, renderHeroBadges: renderHeroBadges };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { global.MC_SERVERS = api; }
})(typeof window !== 'undefined' ? window : globalThis);
