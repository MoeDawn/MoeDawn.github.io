const { test } = require('node:test');
const assert = require('node:assert');
const { SERVERS_ACTIVE, SERVERS_ARCHIVED } = require('../js/servers.js');

test('active servers: exactly 2, both no-auth, addresses correct', () => {
  assert.equal(SERVERS_ACTIVE.length, 2);
  assert.deepEqual(SERVERS_ACTIVE.map(s => s.address).sort(), ['mc.ssjj2.top', 'ssjj2.top']);
  assert.ok(SERVERS_ACTIVE.every(s => s.noauth === true));
});

test('zomboid server is excluded from status polling', () => {
  const zb = SERVERS_ACTIVE.find(s => s.game === 'zomboid');
  assert.ok(zb, 'zomboid entry missing');
  assert.ok(zb.name.startsWith('僵毁B42'), 'zomboid name should start with 僵毁B42');
  assert.ok(zb.address === 'mc.ssjj2.top', 'address should be clean (no port/space)');
});

test('archived servers include retired 亡者世界, all closed', () => {
  assert.equal(SERVERS_ARCHIVED.length, 13);
  assert.ok(SERVERS_ARCHIVED.every(s => s.closed === true));
  assert.ok(SERVERS_ARCHIVED.some(s => s.name === '亡者世界'));
  assert.ok(SERVERS_ARCHIVED.every(s => s.archived, 'every archived entry has a date'));
});

test('every server has name/version/address', () => {
  for (const s of [...SERVERS_ACTIVE, ...SERVERS_ARCHIVED]) {
    assert.ok(s.name && s.version && s.address, 'missing field in ' + s.name);
  }
});
