import { readFile } from "fs/promises";
import { join } from "path";
import fg from "fast-glob";
import type { DetectorContext } from "./types.js";

export async function buildContext(root: string): Promise<DetectorContext> {
  const packageJson = await loadPackageJson(root);
  const fileTree = await buildFileTree(root);

  return { root, packageJson, fileTree };
}

async function loadPackageJson(
  root: string
): Promise<Record<string, any> | null> {
  try {
    const raw = await readFile(join(root, "package.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function buildFileTree(root: string): Promise<string[]> {
  const entries = await fg(["**/*"], {
    cwd: root,
    deep: 2,
    onlyFiles: false,
    markDirectories: true,
    dot: true,
    ignore: [
      "node_modules/**",
      ".git/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      ".openspec/**",
    ],
  });
  return entries.sort();
}
