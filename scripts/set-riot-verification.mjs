import fs from 'node:fs/promises';

const token = String(process.env.RIOT_VERIFICATION_TOKEN || '').trim();
if (!token) {
  console.error('Set RIOT_VERIFICATION_TOKEN to the exact verification string provided by Riot.');
  process.exit(1);
}
if (token.length > 500 || /[\r\n]/.test(token)) {
  console.error('Verification token must be a single line under 500 characters.');
  process.exit(1);
}
await fs.writeFile('riot.txt', token + '\n', 'utf8');
console.log('riot.txt updated. Commit and deploy it before clicking Verify in the Riot Developer Portal.');
