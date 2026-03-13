import { readFile } from "fs/promises";
import { join, relative } from "path";
import fg from "fast-glob";
import type { CodeSample, ScanResult } from "./types.js";

interface SampleCategory {
  category: CodeSample["category"];
  patterns: string[];
  maxFiles: number;
}

const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    category: "component",
    patterns: [
      "src/components/**/*.{tsx,vue,svelte}",
      "src/app/**/*.tsx",
      "app/**/*.tsx",
      "components/**/*.{tsx,vue,svelte}",
    ],
    maxFiles: 3,
  },
  {
    category: "api",
    patterns: [
      "src/api/**/*.ts",
      "src/routes/**/*.ts",
      "app/api/**/*.ts",
      "src/server/**/*.ts",
      "routes/**/*.ts",
      "src/api/**/*.js",
      "src/routes/**/*.js",
    ],
    maxFiles: 3,
  },
  {
    category: "model",
    patterns: [
      "src/models/**/*",
      "prisma/schema.prisma",
      "src/db/**/*.ts",
      "src/schema/**/*.ts",
      "models/**/*.ts",
    ],
    maxFiles: 2,
  },
  {
    category: "test",
    patterns: [
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      "tests/**/*.{ts,js}",
    ],
    maxFiles: 3,
  },
  {
    category: "util",
    patterns: [
      "src/utils/**/*.{ts,js}",
      "src/lib/**/*.{ts,js}",
      "src/helpers/**/*.{ts,js}",
      "lib/**/*.{ts,js}",
      "utils/**/*.{ts,js}",
    ],
    maxFiles: 2,
  },
  {
    category: "config",
    patterns: [
      "src/config.{ts,js}",
      "src/config/**/*.{ts,js}",
      "config/**/*.{ts,js}",
    ],
    maxFiles: 1,
  },
];

const MAX_LINES = 50;
const IGNORE_PATTERNS = [
  "node_modules/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**",
];

export async function sampleSourceFiles(
  root: string,
  _scanResult: ScanResult
): Promise<CodeSample[]> {
  const samples: CodeSample[] = [];

  for (const cat of SAMPLE_CATEGORIES) {
    const files = await fg(cat.patterns, {
      cwd: root,
      ignore: IGNORE_PATTERNS,
      absolute: false,
    });

    const selected = files.slice(0, cat.maxFiles);

    for (const filePath of selected) {
      try {
        const content = await readFile(join(root, filePath), "utf-8");
        const lines = content.split("\n").slice(0, MAX_LINES);
        const excerpt = lines.join("\n");
        const patterns = detectPatterns(content, cat.category);

        samples.push({
          filePath: relative(root, join(root, filePath)).replace(/\\/g, "/"),
          category: cat.category,
          excerpt,
          patterns,
        });
      } catch {
        // Skip unreadable files
      }
    }
  }

  return samples;
}

function detectPatterns(content: string, category: CodeSample["category"]): string[] {
  const patterns: string[] = [];

  // Import patterns
  if (content.includes("from '@/") || content.includes('from "@/')) {
    patterns.push("path-aliases");
  }
  if (/from ['"]\.\/index['"]/.test(content) || /from ['"]\.\.\/['"]/.test(content)) {
    patterns.push("barrel-imports");
  }

  // Export patterns
  if (/^export default /m.test(content)) {
    patterns.push("default-exports");
  }
  if (/^export (const|function|class|interface|type) /m.test(content)) {
    patterns.push("named-exports");
  }

  // Component patterns
  if (category === "component") {
    if (/use[A-Z]\w*\(/.test(content)) {
      patterns.push("hooks");
    }
    if (/className=/.test(content)) {
      patterns.push("tailwind-classes");
    }
    if (/styled\.\w+/.test(content) || /styled\(/.test(content)) {
      patterns.push("styled-components");
    }
  }

  // API patterns
  if (category === "api") {
    if (/async\s+(function|\(|[a-z])/.test(content)) {
      patterns.push("async-handlers");
    }
    if (content.includes("zod") || /z\.\w+/.test(content)) {
      patterns.push("zod-validation");
    }
    if (/try\s*\{/.test(content)) {
      patterns.push("try-catch-errors");
    }
    if (/\.use\(/.test(content)) {
      patterns.push("middleware");
    }
  }

  // Test patterns
  if (category === "test") {
    if (/describe\s*\(/.test(content)) {
      patterns.push("describe-blocks");
    }
    if (/it\s*\(/.test(content) || /test\s*\(/.test(content)) {
      patterns.push("test-blocks");
    }
    if (content.includes("@testing-library") || content.includes("render(")) {
      patterns.push("testing-library");
    }
    if (content.includes("vi.") || content.includes("vitest")) {
      patterns.push("vitest");
    }
    if (content.includes("jest.") || content.includes("@jest")) {
      patterns.push("jest");
    }
  }

  // General patterns
  if (/interface\s+\w+/.test(content) || /type\s+\w+\s*=/.test(content)) {
    patterns.push("typescript-types");
  }

  return patterns;
}
