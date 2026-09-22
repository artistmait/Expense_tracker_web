#!/usr/bin/env sh
# Quick local smoke check: what CI enforces, minus npm install.
set -e
cd "$(dirname "$0")/et_backend"
echo "==> Backend unit tests"
npm test
echo "==> Boot smoke test"
node -e "process.env.NODE_ENV='test'; import('./main/server.js').then(() => { console.log('SERVER BOOT OK'); process.exit(0); }).catch((e) => { console.error('BOOT FAIL:', e.message); process.exit(1); })"
echo "==> Frontend build"
cd ../expensetracker_frontend
npm run build
echo "==> All checks passed"
