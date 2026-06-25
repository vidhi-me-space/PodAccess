import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function run(command, cwd) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: 'inherit', shell: true });
}

function hasNpm() {
  try {
    execSync('npm --version', { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

if (!hasNpm()) {
  console.error('npm was not found. Install Node.js 18+ from https://nodejs.org/');
  process.exit(1);
}

run('npm install', join(root, 'backend'));
run('npm install', join(root, 'frontend'));

const envPath = join(root, 'backend', '.env');
const envExamplePath = join(root, 'backend', '.env.example');

if (!existsSync(envPath) && existsSync(envExamplePath)) {
  run(`copy "${envExamplePath}" "${envPath}"`, root);
  console.log('\nCreated backend/.env from .env.example');
}

console.log('\nAll dependencies installed successfully.');
