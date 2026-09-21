import assert from 'node:assert/strict';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');
const allowedRemote = /^(https:\/\/github\.com\/|git@github\.com:)cookiesandchips\/cookies-and-chips(?:\.git)?$/;
const remotes = execFileSync('git', ['remote', '-v'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
assert(remotes.length && remotes.every((line) => allowedRemote.test(line.split(/\s+/)[1])), 'Only the canonical repository remote is allowed');

const expected = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://vqebxtybuiegvfxawksf.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  APP_ENV: 'development', SUPABASE_SECRET_KEY: '', NEXT_PUBLIC_PAYPAL_CLIENT_ID: '',
  PAYPAL_CLIENT_SECRET: '', PAYPAL_WEBHOOK_ID: '', PAYPAL_ENVIRONMENT: 'sandbox',
  EMAIL_FROM: '', EMAIL_PROVIDER_API_KEY: '',
  USDA_FDC_API_KEY: '', TAXJAR_SANDBOX_API_TOKEN: '', TAXJAR_LIVE_API_TOKEN: '',
  TAXJAR_ENVIRONMENT: 'sandbox', TAXJAR_ENABLED: 'true', CONTACT_EMAIL: '', SHIPPO_TEST_API_TOKEN: '', SHIPPO_LIVE_API_TOKEN: '', INTEGRATION_ENCRYPTION_KEY: '',
};
const entries = read('.env.example').split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
  const split = line.indexOf('=');
  assert(split > 0, 'Malformed template variable');
  return [line.slice(0, split), line.slice(split + 1)];
});
assert.equal(entries.length, Object.keys(expected).length, 'Duplicate or unexpected template variables');
// Do not print actual values if the template accidentally contains a credential.
assert(JSON.stringify(Object.fromEntries(entries)) === JSON.stringify(expected), 'Environment template differs from the approved blank-value contract');
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
assert(!tracked.some((path) => /(^|\/)\.env(?:\.|$)/.test(path) && path !== '.env.example'), 'A private environment file is tracked');
assert(!tracked.some((path) => /(^|\/)(node_modules|\.vercel|\.supabase)(\/|$)|\.(pem|key)$/.test(path)), 'Private/local artifacts must not be tracked');
const pkg = JSON.parse(read('package.json'));
assert(pkg.private && pkg.name === 'cookies-and-chips', 'Package identity must remain dedicated and private');
assert(!pkg.workspaces, 'Shared workspaces are forbidden');
for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  for (const value of Object.values(pkg[field] ?? {})) assert(!/^(file:|link:|workspace:|\.\.?\/|\/)/.test(value), 'Local/shared dependencies are forbidden');
}
function checkLinks(dir) {
  for (const entry of readdirSync(dir)) {
    if (['.git', 'node_modules', '.next'].includes(entry)) continue;
    const path = join(dir, entry);
    const stat = lstatSync(path);
    assert(!stat.isSymbolicLink(), 'Symlinks are forbidden within the project foundation');
    if (stat.isDirectory()) checkLinks(path);
  }
}
checkLinks(root);
console.log('Foundation checks passed: canonical remote, blank template, tracked-file rules, package boundaries, no symlinks. Cloud configuration and runtime credentials are not checked.');
