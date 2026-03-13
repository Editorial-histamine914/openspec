import type { Detector, BuildToolInfo } from "../types.js";

export const detectBuildTools: Detector = async (ctx) => {
  const buildTools: BuildToolInfo[] = [];
  const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };

  if (deps?.["vite"]) {
    const config = ctx.fileTree.find((f) =>
      /^vite\.config\.(ts|js|mjs)$/.test(f)
    );
    buildTools.push({ name: "Vite", config });
  }

  if (deps?.["webpack"] || ctx.fileTree.some((f) => f.startsWith("webpack.config"))) {
    const config = ctx.fileTree.find((f) => f.startsWith("webpack.config"));
    buildTools.push({ name: "Webpack", config });
  }

  if (deps?.["esbuild"]) {
    buildTools.push({ name: "esbuild" });
  }

  if (deps?.["rollup"]) {
    const config = ctx.fileTree.find((f) => f.startsWith("rollup.config"));
    buildTools.push({ name: "Rollup", config });
  }

  if (deps?.["turbo"] || ctx.fileTree.some((f) => f === "turbo.json")) {
    buildTools.push({ name: "Turborepo", config: "turbo.json" });
  }

  // TypeScript compiler
  if (ctx.fileTree.some((f) => f === "tsconfig.json")) {
    const scripts = ctx.packageJson?.scripts || {};
    const useTsc = Object.values(scripts).some(
      (s) => typeof s === "string" && s.includes("tsc")
    );
    if (useTsc) {
      buildTools.push({ name: "tsc", config: "tsconfig.json" });
    }
  }

  return { buildTools };
};
