import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalog, getCategories, getGameById } from '../public/game-catalog.js';
import { isAllowedHostname } from '../server.js';

test('catalog contains 1,200 playable configurations', () => {
  const games = createCatalog();
  assert.equal(games.length, 1200);
  assert.equal(new Set(games.map(g => g.id)).size, 1200);
  assert.ok(games.every(g => g.players >= 1 && g.players <= 4));
  assert.ok(games.every(g => g.type && g.title && g.seed));
});

test('requested multiplayer categories exist', () => {
  const categories = getCategories();
  for (const c of ['2 Player','3 Player','4 Player','Action','Puzzle','Sports','Multiplayer']) assert.ok(categories.includes(c), c);
});

test('game lookup works', () => {
  assert.equal(getGameById('g0001')?.id, 'g0001');
  assert.equal(getGameById('g1200')?.id, 'g1200');
  assert.equal(getGameById('g9999'), null);
});

test('proxy hostname allowlist is exact/subdomain only', () => {
  const allow = ['example.com'];
  assert.equal(isAllowedHostname('example.com', allow), true);
  assert.equal(isAllowedHostname('www.example.com', allow), true);
  assert.equal(isAllowedHostname('example.com.evil.test', allow), false);
  assert.equal(isAllowedHostname('evil-example.com', allow), false);
});
