#!/usr/bin/env node
// Copies vetted skills from GitHub repos into .claude/ at pinned commits.
// To update one, review the new commit, change its `commit` below, then run: node scripts/sync-github-skills.mjs
// Run scripts/sync-plugins.mjs first if you run both.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const claude = join(repo, '.claude');
const manifestPath = join(claude, 'vendored-github.json');

// Each source lists skill folders (source path -> skill name), agent files, and extra files
// copied into a skill (source path -> path inside .claude/skills).
const sources = [
  {
    repo: 'anthropics/skills',
    commit: 'ca45fc496a3436251f191354091d557da31c15b5',
    skills: { 'skills/canvas-design': 'canvas-design', 'skills/frontend-design': 'frontend-design', 'skills/theme-factory': 'theme-factory' },
  },
  {
    // Mirrors the copy plan in its install.sh, which installs to the home folder.
    repo: 'AgriciDaniel/claude-ads',
    commit: 'fc3908e786c318776df89a3a098333da377364be',
    license: 'LICENSE',
    skills: { ads: 'ads', ...subSkills('skills') },
    agents: 'agents',
    extras: {
      scripts: 'ads/scripts',
      claude_ads_core: 'ads/scripts/claude_ads_core',
      'requirements.txt': 'ads/requirements.txt',
      'requirements.lock': 'ads/requirements.lock',
    },
    extrasFromList: { list: 'control-plane/runtime-resources.txt', into: 'ads' },
  },
  {
    repo: 'Melvynx/video-agent-skills',
    commit: '4774fa4f2601baa822fd513387202c26e4587902',
    license: 'LICENSE',
    skills: subSkills('skills'),
  },
  {
    repo: 'eatenquek/clothing-shop-studio',
    commit: '19ac4e273e42e4b0583ea2960253b4da38294d08',
    license: 'LICENSE',
    skills: { 'skill/clothing-shop-studio': 'clothing-shop-studio' },
  },
];

// Placeholder resolved after checkout: every folder under `dir` is a skill of the same name.
function subSkills(dir) {
  return { [`${dir}/*`]: '*' };
}

const skip = (src) => !/(__pycache__|node_modules|\.venv|\.pyc$|(^|[\\/])\.git$)/.test(src);

if (existsSync(manifestPath)) {
  for (const s of JSON.parse(readFileSync(manifestPath, 'utf8')).sources) {
    s.skills.forEach((name) => rmSync(join(claude, 'skills', name), { recursive: true, force: true }));
    s.agents.forEach((file) => rmSync(join(claude, 'agents', file), { force: true }));
  }
}

const fresh = (target) => {
  if (existsSync(target)) throw new Error(`Refusing to overwrite ${target}`);
  return target;
};

const work = mkdtempSync(join(tmpdir(), 'ironkin-skills-'));
const manifest = { sources: [] };
try {
  for (const source of sources) {
    const dir = join(work, source.repo.replace('/', '_'));
    const git = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: 'pipe' });
    execFileSync('git', ['init', '-q', dir]);
    git('fetch', '-q', '--depth', '1', `https://github.com/${source.repo}.git`, source.commit);
    git('-c', 'advice.detachedHead=false', 'checkout', '-q', 'FETCH_HEAD');

    const entry = { repo: source.repo, commit: source.commit, skills: [], agents: [] };
    const skills = {};
    for (const [from, to] of Object.entries(source.skills)) {
      if (!from.endsWith('/*')) { skills[from] = to; continue; }
      const parent = from.slice(0, -2);
      for (const name of readdirSync(join(dir, parent), { withFileTypes: true })) {
        if (name.isDirectory()) skills[`${parent}/${name.name}`] = name.name;
      }
    }
    for (const [from, name] of Object.entries(skills)) {
      cpSync(join(dir, from), fresh(join(claude, 'skills', name)), { recursive: true, filter: skip });
      entry.skills.push(name);
    }

    if (source.agents) {
      for (const file of readdirSync(join(dir, source.agents)).filter((f) => f.endsWith('.md'))) {
        cpSync(join(dir, source.agents, file), fresh(join(claude, 'agents', file)));
        entry.agents.push(file);
      }
    }
    for (const [from, to] of Object.entries(source.extras ?? {})) {
      cpSync(join(dir, from), join(claude, 'skills', to), { recursive: true, filter: skip });
    }
    if (source.extrasFromList) {
      const { list, into } = source.extrasFromList;
      for (const line of readFileSync(join(dir, list), 'utf8').split(/\r?\n/)) {
        const path = line.trim();
        if (path && !path.startsWith('#')) cpSync(join(dir, path), join(claude, 'skills', into, path));
      }
    }

    const license = source.license ? join(dir, source.license) : null;
    if (license) cpSync(license, join(claude, 'licenses', `${basename(source.repo)}.txt`));
    else for (const from of Object.keys(skills)) {
      if (!existsSync(join(dir, from, 'LICENSE.txt'))) throw new Error(`No license for ${from}`);
    }

    manifest.sources.push(entry);
    console.log(`${source.repo} ${source.commit.slice(0, 7)}: ${entry.skills.length} skills, ${entry.agents.length} agents`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
