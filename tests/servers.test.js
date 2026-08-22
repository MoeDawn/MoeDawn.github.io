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
