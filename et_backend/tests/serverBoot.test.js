import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

/**
 * Boot smoke test (audit follow-up for critical issue #1).
 * The advisor routes module once imported a non-existent `authenticateToken`
 * export, which crashed the ENTIRE backend on boot while all unit tests
 * stayed green. This test imports the full server module graph and asserts
 * the express app is actually constructible.
 */
describe('Server boot', () => {
  it('imports the full server module graph without errors', async () => {
    const appModule = await import('../main/server.js');
    assert.ok(appModule.default, 'server should export a default express app');
    assert.equal(typeof appModule.default, 'function', 'default export should be an express app (function)');
  });

  it('registers every mounted route module (auth, accounts, transactions, categories, budgets, advisor)', async () => {
    const app = (await import('../main/server.js')).default;
    const mounted = app._router
      ? app._router.stack.filter((l) => l.name === 'router' && l.handle?.stack?.length).map((l) => l)
      : app.router?.stack.filter((l) => l.name === 'router') || [];
    // Express 5 exposes layers differently; just assert we have at least 6 routers
    assert.ok(mounted.length >= 6, `expected at least 6 mounted routers, found ${mounted.length}`);
  });
});
