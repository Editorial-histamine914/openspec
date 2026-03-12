import { describe, it, expect } from "vitest";
import { renderForTarget } from "../src/targets/index.js";
import type { ParsedModule } from "../src/types.js";

function makeModule(slug: string, content: string, overrides?: Partial<ParsedModule["frontmatter"]>): ParsedModule {
  return {
    filePath: `/fake/${slug}.md`,
    slug,
    frontmatter: {
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      priority: 50,
      ...overrides,
    },
    content,
  };
}

describe("renderForTarget", () => {
  const modules: ParsedModule[] = [
    makeModule("shared", "- Rule 1\n- Rule 2"),
    makeModule("backend", "# Backend\n\n- Use DI\n- Validate input"),
  ];

  it("claude renderer uses flat ## headings without separators", () => {
    const output = renderForTarget("claude", modules, {});

    expect(output).toContain("## Shared");
    expect(output).toContain("## Backend");
    expect(output).toContain("- Rule 1");
    expect(output).toContain("- Use DI");
    // Claude renderer should NOT use --- separators
    expect(output).not.toContain("---");
  });

  it("claude renderer strips redundant # heading from content", () => {
    const output = renderForTarget("claude", modules, {});

    // Should have "## Backend" from renderer but NOT the raw "# Backend" heading from content
    expect(output).toContain("## Backend");
    expect(output).not.toMatch(/^# Backend$/m);
  });

  it("default renderer uses --- separators", () => {
    const output = renderForTarget("gemini", modules, {});

    expect(output).toContain("---");
  });

  it("copilot renderer uses ### headings", () => {
    const output = renderForTarget("copilot", modules, {});

    expect(output).toContain("### Shared");
    expect(output).toContain("### Backend");
  });

  it("cursor renderer includes glob hints", () => {
    const modulesWithGlobs = [
      makeModule("frontend", "- Use React", { globs: ["src/components/**/*.tsx", "src/pages/**"] }),
    ];

    const output = renderForTarget("cursor", modulesWithGlobs, {});

    expect(output).toContain("<!-- Applies to: src/components/**/*.tsx, src/pages/** -->");
  });

  it("includes header and footer", () => {
    const output = renderForTarget("claude", modules, {
      header: "# Project Rules",
      footer: "End.",
    });

    expect(output).toContain("# Project Rules");
    expect(output).toContain("End.");
  });

  it("falls back to default renderer for unknown targets", () => {
    const output = renderForTarget("unknown-tool", modules, {});

    expect(output).toContain("## Shared");
    expect(output).toContain("---");
  });
});
