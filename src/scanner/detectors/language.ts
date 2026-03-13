import fg from "fast-glob";
import type { Detector } from "../types.js";

export const detectLanguages: Detector = async (ctx) => {
  const languages: { name: string; config?: string; fileCount: number }[] = [];

  const counts = await Promise.all([
    countFiles(ctx.root, ["**/*.ts", "**/*.tsx"]).then((n) => ({
      name: "TypeScript",
      config: ctx.fileTree.find((f) => f === "tsconfig.json"),
      count: n,
    })),
    countFiles(ctx.root, ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"]).then(
      (n) => ({ name: "JavaScript", config: undefined, count: n })
    ),
    countFiles(ctx.root, ["**/*.py"]).then((n) => ({
      name: "Python",
      config: ctx.fileTree.find(
        (f) => f === "pyproject.toml" || f === "setup.py"
      ),
      count: n,
    })),
    countFiles(ctx.root, ["**/*.go"]).then((n) => ({
      name: "Go",
      config: ctx.fileTree.find((f) => f === "go.mod"),
      count: n,
    })),
    countFiles(ctx.root, ["**/*.rs"]).then((n) => ({
      name: "Rust",
      config: ctx.fileTree.find((f) => f === "Cargo.toml"),
      count: n,
    })),
  ]);

  for (const { name, config, count } of counts) {
    if (count > 0) {
      languages.push({ name, config, fileCount: count });
    }
  }

  // Sort by file count descending
  languages.sort((a, b) => b.fileCount - a.fileCount);

  return { languages };
};

async function countFiles(root: string, patterns: string[]): Promise<number> {
  const files = await fg(patterns, {
    cwd: root,
    ignore: ["node_modules/**", "dist/**", "build/**", ".next/**"],
  });
  return files.length;
}
