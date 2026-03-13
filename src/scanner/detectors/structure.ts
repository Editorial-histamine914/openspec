import type { Detector, ProjectStructure } from "../types.js";

export const detectStructure: Detector = async (ctx) => {
  const directories = ctx.fileTree
    .filter((f) => f.endsWith("/"))
    .map((f) => f.replace(/\/$/, ""));

  const entryPoints: string[] = [];

  // Check common entry points
  const entryPointCandidates = [
    "src/index.ts",
    "src/index.js",
    "src/main.ts",
    "src/main.js",
    "src/app.ts",
    "src/app.js",
    "src/cli.ts",
    "src/cli.js",
    "index.ts",
    "index.js",
    "main.ts",
    "main.py",
    "app.py",
    "main.go",
    "src/main.rs",
    "src/lib.rs",
  ];

  for (const candidate of entryPointCandidates) {
    if (ctx.fileTree.includes(candidate)) {
      entryPoints.push(candidate);
    }
  }

  // Check package.json main/bin fields
  if (ctx.packageJson?.main && !entryPoints.includes(ctx.packageJson.main)) {
    entryPoints.push(ctx.packageJson.main);
  }
  if (ctx.packageJson?.bin) {
    const bins =
      typeof ctx.packageJson.bin === "string"
        ? [ctx.packageJson.bin]
        : Object.values(ctx.packageJson.bin) as string[];
    for (const b of bins) {
      if (!entryPoints.includes(b)) {
        entryPoints.push(b);
      }
    }
  }

  const projectStructure: ProjectStructure = { directories, entryPoints };
  return { projectStructure };
};
