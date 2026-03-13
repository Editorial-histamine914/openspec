import type { Detector, LintingInfo } from "../types.js";

export const detectLinting: Detector = async (ctx) => {
  const linting: LintingInfo[] = [];
  const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };

  if (deps?.["eslint"]) {
    const config = ctx.fileTree.find(
      (f) =>
        /^\.?eslint\.(config\.)?(ts|js|mjs|cjs|json|yml|yaml)$/.test(f) ||
        f === ".eslintrc" ||
        f === ".eslintrc.json" ||
        f === ".eslintrc.js" ||
        f === ".eslintrc.yml"
    );
    linting.push({ name: "ESLint", config });
  }

  if (deps?.["prettier"] || ctx.fileTree.some((f) => f === ".prettierrc" || f.startsWith(".prettierrc."))) {
    const config = ctx.fileTree.find(
      (f) => f === ".prettierrc" || f.startsWith(".prettierrc.") || f === "prettier.config.js"
    );
    linting.push({ name: "Prettier", config });
  }

  if (deps?.["biome"] || deps?.["@biomejs/biome"] || ctx.fileTree.some((f) => f === "biome.json")) {
    linting.push({ name: "Biome", config: "biome.json" });
  }

  if (ctx.fileTree.some((f) => f === ".editorconfig")) {
    linting.push({ name: "EditorConfig", config: ".editorconfig" });
  }

  return { linting };
};
