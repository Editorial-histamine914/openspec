import type { ScanResult } from "./types.js";

export function formatMarkdown(result: ScanResult): string {
  const sections: string[] = [];

  // Header
  const title = result.projectName || "Project";
  sections.push(`# Codebase Analysis — ${title}\n`);

  // Tech Stack
  sections.push("## Tech Stack\n");
  if (result.languages.length > 0) {
    const langs = result.languages
      .map((l) => `${l.name} (${l.fileCount} files)`)
      .join(", ");
    sections.push(`- **Languages**: ${langs}`);
  }
  for (const fw of result.frameworks) {
    const ver = fw.version ? ` ${fw.version}` : "";
    sections.push(`- **${capitalize(fw.category)}**: ${fw.name}${ver}`);
  }
  for (const bt of result.buildTools) {
    const cfg = bt.config ? ` (${bt.config})` : "";
    sections.push(`- **Build**: ${bt.name}${cfg}`);
  }
  for (const tt of result.testingTools) {
    const cfg = tt.config ? ` (${tt.config})` : "";
    sections.push(`- **Testing**: ${tt.name}${cfg}`);
  }
  for (const l of result.linting) {
    const cfg = l.config ? ` (${l.config})` : "";
    sections.push(`- **Linting**: ${l.name}${cfg}`);
  }
  if (result.styling.length > 0) {
    sections.push(
      `- **Styling**: ${result.styling.map((s) => s.name).join(", ")}`
    );
  }
  if (result.databases.length > 0) {
    sections.push(`- **Database**: ${result.databases.join(", ")}`);
  }
  if (result.cicd.length > 0) {
    sections.push(`- **CI/CD**: ${result.cicd.join(", ")}`);
  }
  if (result.packageManager) {
    sections.push(`- **Package Manager**: ${result.packageManager}`);
  }
  sections.push("");

  // Project Structure
  sections.push("## Project Structure\n");
  if (result.projectStructure.directories.length > 0) {
    sections.push("**Directories:**");
    for (const dir of result.projectStructure.directories) {
      sections.push(`- ${dir}/`);
    }
    sections.push("");
  }
  if (result.projectStructure.entryPoints.length > 0) {
    sections.push("**Entry Points:**");
    for (const ep of result.projectStructure.entryPoints) {
      sections.push(`- ${ep}`);
    }
    sections.push("");
  }

  // Code Samples
  if (result.codeSamples.length > 0) {
    sections.push("## Code Samples\n");
    for (const sample of result.codeSamples) {
      const categoryLabel = capitalize(sample.category);
      sections.push(`### ${categoryLabel} Example (${sample.filePath})\n`);

      const ext = sample.filePath.split(".").pop() || "";
      const lang = extToLang(ext);
      sections.push("```" + lang);
      sections.push(sample.excerpt);
      sections.push("```\n");

      if (sample.patterns.length > 0) {
        sections.push(`Patterns: ${sample.patterns.join(", ")}\n`);
      }
    }
  }

  // Instructions
  sections.push(INSTRUCTIONS_SECTION);

  return sections.join("\n");
}

export function formatJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extToLang(ext: string): string {
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    go: "go",
    rs: "rust",
    vue: "vue",
    svelte: "svelte",
    prisma: "prisma",
  };
  return map[ext] || ext;
}

const INSTRUCTIONS_SECTION = `## Instructions for AI Agent

Using the analysis above, generate the following OpenSpec module files in \`.openspec/modules/\`:

1. **shared.md** — Project-wide rules: tech stack summary, coding style (based on detected patterns), directory conventions, build/lint commands
2. **frontend.md** — Frontend rules derived from the component samples: component patterns, styling approach, state management, routing conventions
3. **backend.md** — Backend rules derived from API samples: route handler patterns, validation approach, error handling, database access patterns
4. **testing.md** — Testing rules derived from test samples: framework conventions, file naming, assertion patterns, what to mock

Each file must use this frontmatter format:
\`\`\`yaml
---
name: <Section Name>
description: <one-line description>
priority: <10 for shared, 20 for frontend/backend, 30 for testing>
tags: [<relevant tags>]
---
\`\`\`

Write rules that reflect the **actual patterns** found in the code samples above, not generic best practices.
After writing the modules, run \`npx @menukfernando/openspec sync\` to generate all AI context files.
`;
