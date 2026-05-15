#!/usr/bin/env node

/**
 * Verify that the skills listed in CLAUDE.md match the actual SKILL.md files
 * under skills/. Catches drift between the project's narrative description of
 * skills and the source of truth (each skill's frontmatter).
 *
 * Checks:
 *   1. Every skills/*\/SKILL.md has a matching entry in CLAUDE.md's "## Skills"
 *      section, keyed by frontmatter `name:`.
 *   2. Every entry in CLAUDE.md's "## Skills" section corresponds to a real
 *      skills/*\/SKILL.md.
 *   3. Frontmatter `name:` value matches the directory name.
 *
 * Does NOT diff descriptions verbatim — CLAUDE.md descriptions are intentionally
 * shorter than skill `description:` frontmatter. We only check that both sides
 * know about the same set of skills.
 *
 * Exit code:
 *   0 — in sync
 *   1 — drift detected (prints what's missing on which side)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");
const CLAUDE_MD = join(ROOT, "CLAUDE.md");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

function readSkills() {
  const skills = [];
  for (const dir of readdirSync(SKILLS_DIR)) {
    const skillPath = join(SKILLS_DIR, dir, "SKILL.md");
    try {
      if (!statSync(skillPath).isFile()) continue;
    } catch {
      continue;
    }
    const fm = parseFrontmatter(readFileSync(skillPath, "utf8"));
    if (!fm || !fm.name) {
      console.error(`ERROR: ${skillPath} is missing frontmatter or 'name:' field`);
      process.exit(1);
    }
    skills.push({ dir, name: fm.name, path: skillPath });
  }
  return skills;
}

function readClaudeMdSkillNames() {
  const content = readFileSync(CLAUDE_MD, "utf8");
  const section = content.match(/##\s+Skills\s*\n([\s\S]*?)(?=\n##\s|\n*$)/);
  if (!section) {
    console.error(`ERROR: CLAUDE.md is missing a "## Skills" section`);
    process.exit(1);
  }
  const names = [];
  for (const line of section[1].split("\n")) {
    const m = line.match(/^-\s*`\/([a-z0-9-]+)`/);
    if (m) names.push(m[1]);
  }
  return names;
}

function main() {
  const skills = readSkills();
  const claudeNames = readClaudeMdSkillNames();

  const skillNames = new Set(skills.map((s) => s.name));
  const claudeSet = new Set(claudeNames);

  const errors = [];

  // 1. name: matches directory name
  for (const s of skills) {
    if (s.name !== s.dir) {
      errors.push(
        `frontmatter mismatch: skills/${s.dir}/SKILL.md declares name: ${s.name} (expected: ${s.dir})`,
      );
    }
  }

  // 2. Every SKILL.md is listed in CLAUDE.md
  for (const s of skills) {
    if (!claudeSet.has(s.name)) {
      errors.push(`CLAUDE.md is missing an entry for /${s.name} (skills/${s.dir}/SKILL.md exists)`);
    }
  }

  // 3. Every CLAUDE.md entry exists as a skill
  for (const name of claudeNames) {
    if (!skillNames.has(name)) {
      errors.push(`CLAUDE.md lists /${name} but skills/${name}/SKILL.md does not exist`);
    }
  }

  // 4. No duplicate entries in CLAUDE.md
  const seen = new Set();
  for (const name of claudeNames) {
    if (seen.has(name)) errors.push(`CLAUDE.md lists /${name} more than once`);
    seen.add(name);
  }

  if (errors.length > 0) {
    console.error("Skills are out of sync between CLAUDE.md and skills/:\n");
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`\nFix CLAUDE.md's "## Skills" section or the SKILL.md frontmatter to match.`);
    process.exit(1);
  }

  console.log(`Skills in sync: ${skills.length} skills, all listed in CLAUDE.md.`);
}

main();
