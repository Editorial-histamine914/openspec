import { describe, it, expect } from "vitest";
import { formatMarkdown, formatJson } from "../../src/scanner/formatter.js";
import type { ScanResult } from "../../src/scanner/types.js";

const sampleResult: ScanResult = {
  projectName: "my-app",
  languages: [
    { name: "TypeScript", config: "tsconfig.json", fileCount: 42 },
    { name: "JavaScript", fileCount: 3 },
  ],
  frameworks: [
    { name: "React", category: "frontend", version: "^18.2.0" },
    { name: "Express", category: "backend", version: "^4.18.0" },
  ],
  buildTools: [{ name: "Vite", config: "vite.config.ts" }],
  testingTools: [
    { name: "Vitest", config: "vitest.config.ts", testPattern: "**/*.test.ts" },
  ],
  linting: [{ name: "ESLint", config: ".eslintrc.json" }],
  styling: [{ name: "Tailwind CSS" }],
  packageManager: "pnpm",
  projectStructure: {
    directories: ["src", "tests", "src/components"],
    entryPoints: ["src/index.ts"],
  },
  databases: ["Prisma"],
  cicd: ["GitHub Actions"],
  codeSamples: [
    {
      filePath: "src/components/Button.tsx",
      category: "component",
      excerpt: 'export function Button() { return <button className="btn">Click</button>; }',
      patterns: ["named-exports", "hooks", "tailwind-classes"],
    },
    {
      filePath: "src/api/users.ts",
      category: "api",
      excerpt: "export async function getUsers(req, res) { }",
      patterns: ["async-handlers"],
    },
  ],
};

describe("formatMarkdown", () => {
  it("should include project name in title", () => {
    const output = formatMarkdown(sampleResult);
    expect(output).toContain("# Codebase Analysis — my-app");
  });

  it("should include tech stack section", () => {
    const output = formatMarkdown(sampleResult);
    expect(output).toContain("## Tech Stack");
    expect(output).toContain("TypeScript (42 files)");
    expect(output).toContain("React ^18.2.0");
    expect(output).toContain("Express ^4.18.0");
    expect(output).toContain("Vite (vite.config.ts)");
    expect(output).toContain("Vitest (vitest.config.ts)");
    expect(output).toContain("ESLint (.eslintrc.json)");
    expect(output).toContain("Tailwind CSS");
    expect(output).toContain("Prisma");
    expect(output).toContain("GitHub Actions");
    expect(output).toContain("pnpm");
  });

  it("should include project structure section", () => {
    const output = formatMarkdown(sampleResult);
    expect(output).toContain("## Project Structure");
    expect(output).toContain("src/");
    expect(output).toContain("src/index.ts");
  });

  it("should include code samples section", () => {
    const output = formatMarkdown(sampleResult);
    expect(output).toContain("## Code Samples");
    expect(output).toContain("### Component Example (src/components/Button.tsx)");
    expect(output).toContain("### Api Example (src/api/users.ts)");
    expect(output).toContain("Patterns: named-exports, hooks, tailwind-classes");
  });

  it("should include instructions section", () => {
    const output = formatMarkdown(sampleResult);
    expect(output).toContain("## Instructions for AI Agent");
    expect(output).toContain("shared.md");
    expect(output).toContain("frontend.md");
    expect(output).toContain("backend.md");
    expect(output).toContain("testing.md");
    expect(output).toContain("openspec sync");
  });

  it("should use 'Project' as default title when no project name", () => {
    const result = { ...sampleResult, projectName: null };
    const output = formatMarkdown(result);
    expect(output).toContain("# Codebase Analysis — Project");
  });
});

describe("formatJson", () => {
  it("should output valid JSON", () => {
    const output = formatJson(sampleResult);
    const parsed = JSON.parse(output);
    expect(parsed).toBeDefined();
  });

  it("should include all fields", () => {
    const output = formatJson(sampleResult);
    const parsed = JSON.parse(output);
    expect(parsed.projectName).toBe("my-app");
    expect(parsed.languages).toHaveLength(2);
    expect(parsed.frameworks).toHaveLength(2);
    expect(parsed.codeSamples).toHaveLength(2);
    expect(parsed.packageManager).toBe("pnpm");
    expect(parsed.databases).toContain("Prisma");
  });
});
