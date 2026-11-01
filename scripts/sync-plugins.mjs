#!/usr/bin/env node
// Copies the owner's installed plugins into .claude/ because cloud sessions do not install plugins.
// Run on a machine with the plugins installed: node scripts/sync-plugins.mjs
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const claude = join(repo, '.claude');
const manifestPath = join(claude, 'vendored-plugins.json');
const pluginsDir = join(homedir(), '.claude', 'plugins');
const enabled = JSON.parse(readFileSync(join(claude, 'settings.json'), 'utf8')).enabledPlugins;
const installed = JSON.parse(readFileSync(join(pluginsDir, 'installed_plugins.json'), 'utf8')).plugins;
const skip = (src) => !/(__pycache__|node_modules|\.pyc$)/.test(src);

if (existsSync(manifestPath)) {
  const old = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const p of old.plugins) {
    p.skills.forEach((s) => rmSync(join(claude, 'skills', s), { recursive: true, force: true }));
    p.agents.forEach((a) => rmSync(join(claude, 'agents', a), { force: true }));
  }
  rmSync(join(claude, 'tools'), { recursive: true, force: true });
  rmSync(join(claude, 'licenses'), { recursive: true, force: true });
}

const fresh = (target) => {
  if (existsSync(target)) throw new Error(`Refusing to overwrite ${target}`);
  return target;
};

mkdirSync(join(claude, 'licenses'), { recursive: true });
const manifest = { plugins: [] };

for (const id of Object.keys(enabled)) {
  const [name, marketplace] = id.split('@');
  const { installPath, version } = installed[id][0];
  const entry = { name, version, skills: [], agents: [] };

  for (const sub of ['skills', join('.claude', 'skills')]) {
    const dir = join(installPath, sub);
    if (!existsSync(dir)) continue;
    for (const skill of readdirSync(dir)) {
      if (!statSync(join(dir, skill)).isDirectory()) continue;
      cpSync(join(dir, skill), fresh(join(claude, 'skills', skill)), { recursive: true, dereference: true, filter: skip });
      entry.skills.push(skill);
    }
  }

  const agents = join(installPath, 'agents');
  if (existsSync(agents)) {
    for (const file of readdirSync(agents).filter((f) => f.endsWith('.md'))) {
      cpSync(join(agents, file), fresh(join(claude, 'agents', file)));
      entry.agents.push(file);
    }
  }

  // Marketing skills link to ../../../tools from their references folders.
  if (existsSync(join(installPath, 'tools'))) {
    cpSync(join(installPath, 'tools'), join(claude, 'tools'), { recursive: true, filter: skip });
  }

  const license = [join(installPath, 'LICENSE'), join(pluginsDir, 'marketplaces', marketplace, 'LICENSE')].find(existsSync);
  if (!license) throw new Error(`No license found for ${name}`);
  cpSync(license, join(claude, 'licenses', `${name}.txt`));
  manifest.plugins.push(entry);
}

// The design skill assumes it lives in the home folder; in the cloud it lives in the repo.
const rewrite = (dir) => {
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    if (statSync(path).isDirectory()) rewrite(path);
    else if (/\.(md|py)$/.test(item)) {
      const text = readFileSync(path, 'utf8');
      if (text.includes('~/.claude/skills/')) writeFileSync(path, text.replaceAll('~/.claude/skills/', '.claude/skills/'));
    }
  }
};
rewrite(join(claude, 'skills', 'design'));

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
for (const p of manifest.plugins) console.log(`${p.name} ${p.version}: ${p.skills.length} skills, ${p.agents.length} agents`);
