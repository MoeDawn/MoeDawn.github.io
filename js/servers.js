/* 服务器数据 —— 以后更新服务器状态只改本文件。
   开放服字段: name/version/type/address/modpack/noauth
   历史服字段: name/version/type/address/closed/note/archived */
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
      name: '僵毁B42,公共服务器名称:PVZSSJJ3',
      version: 'Build 42.20.2 端口号:17544',
      type: '模组PVE生存',
      address: 'mc.ssjj2.top',
      modpack: '访问服务器自动下载',
      noauth: true,
      game: 'zomboid'
    }
  ];

  const SERVERS_ARCHIVED = [
    { name: '亡者世界', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'ssjj3.top', closed: true, note: '已通关主线流程顺利结档', archived: '2026.9' },
    { name: '1.21 纯生存服', version: 'Java/基岩 1.21', type: '生存', address: 'ssjj2.top', closed: true, note: '双端互通', archived: '2025' },
    { name: '1.21 纯生存创造服', version: 'Java 1.21', type: '创造', address: 'cz.ssjj2.top', closed: true, note: '用于研究建筑的创造服', archived: '2025' },
    { name: '1.21.11 生存&创造服', version: 'Java 1.21.11', type: '创造', address: 'ssjj2.top', closed: true, note: '与生存服共用入口', archived: '2025' },
    { name: '轻松愉快的女仆生存服', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'xx.ssjj2.top', closed: true, note: '枪械,更多尸潮,血腥,感染;未能建造更大的炮艇草率结档', archived: '2025' },
    { name: '女仆生存创造服', version: 'Java 1.20.1', type: '创造', address: 'xxcz.ssjj2.top', closed: true, note: '默认创造模式;用于构思建筑或者机械动力机器', archived: '2025' },
    { name: '死亡突围', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'xx.ssjj2.top', closed: true, note: '死亡突围整合包', archived: '2025' },
    { name: '女仆生存 vanilla+', version: 'Java 1.20.1', type: '生存 · 整合包', address: 'md.ssjj2.top', closed: true, note: '休闲,女仆,种田,超多农夫乐事附属与世界结构,和女仆一起休闲种田养老', archived: '2025' },
    { name: '脆骨症黯光', version: 'Java 1.19.2', type: '生存 · 整合包', address: 'cs.ssjj2.top', closed: true, note: '"没有血肉的胸部" ', archived: '2025' },
    { name: '重度机械症航空学', version: 'Java 1.21.1', type: '生存 · 整合包', address: 'n.ssjj3.top', closed: true, note: '重度机械症整合包', archived: '2025' },
    { name: '2025 愚人节版本', version: '活动限定', type: '活动', address: 'yr.ssjj2.top', closed: true, note: '愚人节限定', archived: '2025.4' },
    { name: '迷你世界', version: '1.20.1', type: '生存 · 整合包', address: 'ssjj2.top', closed: true, note: '神话,冒险,女仆;真轻松愉快的休闲养老生活', archived: '2024.5' },
    { name: '轻松愉快的休闲养老生活', version: '1.20.1', type: '生存 · 整合包', address: 'ssjj2.top', closed: true, note: '尸潮,感染,恐怖,挑战;<del>历经磨难</del>最后成功通关', archived: '2024.9' }
  ];

  function renderServerTables() {
    const activeTbody = document.getElementById('server-rows');
    const archiveTbody = document.getElementById('archive-rows');
    if (!activeTbody || !archiveTbody) return;

    activeTbody.innerHTML = SERVERS_ACTIVE.map(function (s) {
      const statusCell = s.game === 'zomboid'
        ? '<span class="status-badge">—</span>'
        : '<span class="status-badge" data-status-for="' + s.address + '">查询中…</span>';
      return '<tr class="server-row">' +
        '<td><b>' + s.name + '</b></td>' +
        '<td>' + s.version + '</td>' +
        '<td>' + s.type + '</td>' +
        '<td class="addr-cell"><code>' + s.address + '</code>' +
        '<button class="copy-btn" data-copy="' + s.address + '" title="复制地址">⧉</button></td>' +
        '<td>' + s.modpack + '</td>' +
        '<td>' + statusCell + '</td>' +
        '</tr>';
    }).join('');

    archiveTbody.innerHTML = SERVERS_ARCHIVED.map(function (s) {
      return '<tr>' +
        '<td><b>' + s.name + '</b></td>' +
        '<td>' + s.version + '</td>' +
        '<td>' + (s.note || '—') + '</td>' +
        '<td>' + (s.archived || '—') + '</td>' +
        '<td><code>' + s.address + '</code></td>' +
        '</tr>';
    }).join('');
  }

  function renderHeroBadges() {
    const heroBadges = document.querySelector('.hero-badges');
    if (!heroBadges || !window.MC_SERVERS) return;
    heroBadges.insertAdjacentHTML('beforeend', SERVERS_ACTIVE.map(function (s) {
      const label = s.name + (s.version ? ' ' + s.version.replace(/^Java /, '') : '');
      const statusHost = s.game === 'zomboid' ? '' : ' data-status-host="' + s.address + '"';
      return '<span class="badge badge-status"' + statusHost + '>' +
        '<span class="dot"></span><span class="badge-text">' + label + '</span></span>';
    }).join(''));
  }

  const api = { SERVERS_ACTIVE: SERVERS_ACTIVE, SERVERS_ARCHIVED: SERVERS_ARCHIVED, renderServerTables: renderServerTables, renderHeroBadges: renderHeroBadges };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { global.MC_SERVERS = api; }
})(typeof window !== 'undefined' ? window : globalThis);
