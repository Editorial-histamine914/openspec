import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { buildContext } from "../../src/scanner/context.js";
import { runDetectors } from "../../src/scanner/detectors/index.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "openspec-detect-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("language detector", () => {
  it("should detect TypeScript from .ts files", async () => {
    await mkdir(join(tempDir, "src"), { recursive: true });
    await writeFile(join(tempDir, "src", "index.ts"), "export const x = 1;");
    await writeFile(join(tempDir, "tsconfig.json"), "{}");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.languages).toContainEqual(
      expect.objectContaining({ name: "TypeScript", fileCount: 1 })
    );
  });

  it("should detect JavaScript from .js files", async () => {
    await writeFile(join(tempDir, "index.js"), "module.exports = {};");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.languages).toContainEqual(
      expect.objectContaining({ name: "JavaScript", fileCount: 1 })
    );
  });
});

describe("framework detector", () => {
  it("should detect React from package.json dependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^18.2.0" } })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.frameworks).toContainEqual(
      expect.objectContaining({
        name: "React",
        category: "frontend",
        version: "^18.2.0",
      })
    );
  });

  it("should detect Next.js as fullstack", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({
        dependencies: { next: "^14.0.0", react: "^18.2.0" },
      })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.frameworks).toContainEqual(
      expect.objectContaining({ name: "Next.js", category: "fullstack" })
    );
    // React should NOT appear separately when Next.js is present
    expect(result.frameworks).not.toContainEqual(
      expect.objectContaining({ name: "React" })
    );
  });

  it("should detect Express as backend", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { express: "^4.18.0" } })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.frameworks).toContainEqual(
      expect.objectContaining({ name: "Express", category: "backend" })
    );
  });
});

describe("build tool detector", () => {
  it("should detect Vite from devDependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ devDependencies: { vite: "^5.0.0" } })
    );
    await writeFile(join(tempDir, "vite.config.ts"), "export default {};");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.buildTools).toContainEqual(
      expect.objectContaining({ name: "Vite", config: "vite.config.ts" })
    );
  });

  it("should detect tsc when used in scripts", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ scripts: { build: "tsc" }, devDependencies: {} })
    );
    await writeFile(join(tempDir, "tsconfig.json"), "{}");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.buildTools).toContainEqual(
      expect.objectContaining({ name: "tsc" })
    );
  });
});

describe("testing detector", () => {
  it("should detect Vitest from devDependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ devDependencies: { vitest: "^1.0.0" } })
    );
    await writeFile(join(tempDir, "vitest.config.ts"), "export default {};");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.testingTools).toContainEqual(
      expect.objectContaining({ name: "Vitest", config: "vitest.config.ts" })
    );
  });

  it("should detect Jest from devDependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ devDependencies: { jest: "^29.0.0" } })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.testingTools).toContainEqual(
      expect.objectContaining({ name: "Jest" })
    );
  });
});

describe("linting detector", () => {
  it("should detect ESLint from devDependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ devDependencies: { eslint: "^8.0.0" } })
    );
    await writeFile(join(tempDir, ".eslintrc.json"), "{}");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.linting).toContainEqual(
      expect.objectContaining({ name: "ESLint" })
    );
  });

  it("should detect Prettier from config file", async () => {
    await writeFile(join(tempDir, "package.json"), JSON.stringify({ devDependencies: { prettier: "^3.0.0" } }));
    await writeFile(join(tempDir, ".prettierrc"), "{}");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.linting).toContainEqual(
      expect.objectContaining({ name: "Prettier", config: ".prettierrc" })
    );
  });
});

describe("package manager detector", () => {
  it("should detect npm from package-lock.json", async () => {
    await writeFile(join(tempDir, "package-lock.json"), "{}");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.packageManager).toBe("npm");
  });

  it("should detect pnpm from pnpm-lock.yaml", async () => {
    await writeFile(join(tempDir, "pnpm-lock.yaml"), "");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.packageManager).toBe("pnpm");
  });

  it("should detect yarn from yarn.lock", async () => {
    await writeFile(join(tempDir, "yarn.lock"), "");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.packageManager).toBe("yarn");
  });
});

describe("database detector", () => {
  it("should detect Prisma from dependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { "@prisma/client": "^5.0.0" } })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.databases).toContain("Prisma");
  });
});

describe("cicd detector", () => {
  it("should detect GitHub Actions from .github directory", async () => {
    await mkdir(join(tempDir, ".github", "workflows"), { recursive: true });
    await writeFile(
      join(tempDir, ".github", "workflows", "ci.yml"),
      "name: CI"
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.cicd).toContain("GitHub Actions");
  });

  it("should detect Docker from Dockerfile", async () => {
    await writeFile(join(tempDir, "Dockerfile"), "FROM node:18");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.cicd).toContain("Docker");
  });
});

describe("structure detector", () => {
  it("should detect entry points", async () => {
    await mkdir(join(tempDir, "src"), { recursive: true });
    await writeFile(join(tempDir, "src", "index.ts"), "export {};");
    await writeFile(join(tempDir, "package.json"), JSON.stringify({}));

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.projectStructure.entryPoints).toContain("src/index.ts");
  });

  it("should detect directories", async () => {
    await mkdir(join(tempDir, "src"), { recursive: true });
    await writeFile(join(tempDir, "src", "index.ts"), "");

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.projectStructure.directories).toContain("src");
  });
});

describe("styling detector", () => {
  it("should detect Tailwind CSS from dependencies", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ devDependencies: { tailwindcss: "^3.0.0" } })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.styling).toContainEqual(
      expect.objectContaining({ name: "Tailwind CSS" })
    );
  });
});

describe("project name", () => {
  it("should extract project name from package.json", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "my-app" })
    );

    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.projectName).toBe("my-app");
  });

  it("should return null when no package.json", async () => {
    const ctx = await buildContext(tempDir);
    const result = await runDetectors(ctx);

    expect(result.projectName).toBeNull();
  });
});
