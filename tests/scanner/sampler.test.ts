import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { sampleSourceFiles } from "../../src/scanner/sampler.js";
import type { ScanResult } from "../../src/scanner/types.js";

let tempDir: string;

const emptyScanResult: ScanResult = {
  projectName: null,
  languages: [],
  frameworks: [],
  buildTools: [],
  testingTools: [],
  linting: [],
  styling: [],
  packageManager: null,
  projectStructure: { directories: [], entryPoints: [] },
  databases: [],
  cicd: [],
  codeSamples: [],
};

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "openspec-sample-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("sampleSourceFiles", () => {
  it("should sample component files", async () => {
    await mkdir(join(tempDir, "src", "components"), { recursive: true });
    await writeFile(
      join(tempDir, "src", "components", "Button.tsx"),
      `import React from 'react';

export function Button({ label }: { label: string }) {
  return <button className="btn">{label}</button>;
}
`
    );

    const samples = await sampleSourceFiles(tempDir, emptyScanResult);

    expect(samples).toHaveLength(1);
    expect(samples[0].category).toBe("component");
    expect(samples[0].filePath).toBe("src/components/Button.tsx");
    expect(samples[0].excerpt).toContain("export function Button");
  });

  it("should detect patterns in component files", async () => {
    await mkdir(join(tempDir, "src", "components"), { recursive: true });
    await writeFile(
      join(tempDir, "src", "components", "UserCard.tsx"),
      `import { useState } from 'react';

export function UserCard({ name }: { name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="card">{name}</div>;
}
`
    );

    const samples = await sampleSourceFiles(tempDir, emptyScanResult);

    expect(samples[0].patterns).toContain("hooks");
    expect(samples[0].patterns).toContain("tailwind-classes");
    expect(samples[0].patterns).toContain("named-exports");
  });

  it("should sample test files and detect test patterns", async () => {
    await mkdir(join(tempDir, "tests"), { recursive: true });
    await writeFile(
      join(tempDir, "tests", "app.test.ts"),
      `import { describe, it, expect, vi } from 'vitest';

describe('App', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
`
    );

    const samples = await sampleSourceFiles(tempDir, emptyScanResult);

    const testSample = samples.find((s) => s.category === "test");
    expect(testSample).toBeDefined();
    expect(testSample!.patterns).toContain("describe-blocks");
    expect(testSample!.patterns).toContain("vitest");
  });

  it("should limit excerpt to 50 lines", async () => {
    await mkdir(join(tempDir, "src", "components"), { recursive: true });
    const longContent = Array.from({ length: 100 }, (_, i) => `// line ${i + 1}`).join("\n");
    await writeFile(join(tempDir, "src", "components", "Long.tsx"), longContent);

    const samples = await sampleSourceFiles(tempDir, emptyScanResult);

    const lines = samples[0].excerpt.split("\n");
    expect(lines.length).toBeLessThanOrEqual(50);
  });

  it("should limit number of files per category", async () => {
    await mkdir(join(tempDir, "src", "components"), { recursive: true });
    for (let i = 0; i < 10; i++) {
      await writeFile(
        join(tempDir, "src", "components", `Comp${i}.tsx`),
        `export function Comp${i}() { return <div />; }`
      );
    }

    const samples = await sampleSourceFiles(tempDir, emptyScanResult);

    const componentSamples = samples.filter((s) => s.category === "component");
    expect(componentSamples.length).toBeLessThanOrEqual(3);
  });

  it("should return empty array when no source files exist", async () => {
    const samples = await sampleSourceFiles(tempDir, emptyScanResult);
    expect(samples).toEqual([]);
  });

  it("should detect path alias imports", async () => {
    await mkdir(join(tempDir, "src", "utils"), { recursive: true });
    await writeFile(
      join(tempDir, "src", "utils", "helpers.ts"),
      `import { db } from '@/lib/db';
export const format = (s: string) => s.trim();
`
    );

    const samples = await sampleSourceFiles(tempDir, emptyScanResult);

    const utilSample = samples.find((s) => s.category === "util");
    expect(utilSample).toBeDefined();
    expect(utilSample!.patterns).toContain("path-aliases");
  });
});
