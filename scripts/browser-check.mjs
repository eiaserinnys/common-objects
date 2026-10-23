// Kept as the npm/Node entry point; Python Playwright owns its server and browser.
import {spawnSync} from 'node:child_process';
const result = spawnSync('python3', ['scripts/browser-check.py'], {stdio:'inherit'});
process.exit(result.status ?? 1);
