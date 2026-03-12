import { readFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import type { ParsedModule, ModuleFrontmatter } from "./types.js";

export async function discoverModules(projectRoot: string, modulesDir: string): Promise<ParsedModule[]> {
  const absModulesDir = join(projectRoot, modulesDir);
  const pattern = join(absModulesDir, "**/*.md").replace(/\\/g, "/");

  const files = await fg(pattern, { absolute: true });

  if (files.length === 0) {
    return [];
  }

  const modules: ParsedModule[] = [];

  for (const filePath of files) {
    const raw = await readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as ModuleFrontmatter;

    const slug = basename(filePath, extname(filePath));

    modules.push({
      filePath,
      slug,
      frontmatter: {
        priority: 50,
        ...frontmatter,
      },
      content: content.trim(),
    });
  }

  // Sort by priority (lower first), then alphabetically
  modules.sort((a, b) => {
    const pa = a.frontmatter.priority ?? 50;
    const pb = b.frontmatter.priority ?? 50;
    if (pa !== pb) return pa - pb;
    return a.slug.localeCompare(b.slug);
  });

  return modules;
}

export function filterModulesForTarget(
  modules: ParsedModule[],
  targetName: string,
  explicitModules?: string[]
): ParsedModule[] {
  return modules.filter((mod) => {
    // If config specifies explicit modules for this target, use that
    if (explicitModules && explicitModules.length > 0) {
      if (!explicitModules.includes(mod.slug)) return false;
    }

    // Check module-level target whitelist
    if (mod.frontmatter.targets && mod.frontmatter.targets.length > 0) {
      if (!mod.frontmatter.targets.includes(targetName)) return false;
    }

    // Check module-level target blacklist
    if (mod.frontmatter.excludeTargets && mod.frontmatter.excludeTargets.length > 0) {
      if (mod.frontmatter.excludeTargets.includes(targetName)) return false;
    }

    return true;
  });
}
