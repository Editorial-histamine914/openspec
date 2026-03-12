import type { ParsedModule } from "../types.js";

interface RenderOptions {
  header?: string;
  footer?: string;
}

type TargetRenderer = (modules: ParsedModule[], options: RenderOptions) => string;

/**
 * Strip the leading top-level heading from module content if it matches the
 * frontmatter name/slug, since the renderer adds its own heading.
 */
function stripLeadingHeading(content: string, title: string): string {
  const match = content.match(/^#\s+(.+)\n*/);
  if (match) {
    return content.slice(match[0].length).trim();
  }
  return content;
}

function defaultRenderer(modules: ParsedModule[], options: RenderOptions): string {
  const sections: string[] = [];

  if (options.header) {
    sections.push(options.header);
  }

  for (const mod of modules) {
    const title = mod.frontmatter.name ?? mod.slug;
    const desc = mod.frontmatter.description
      ? `\n> ${mod.frontmatter.description}\n`
      : "";
    sections.push(`## ${title}${desc}\n${stripLeadingHeading(mod.content, title)}`);
  }

  if (options.footer) {
    sections.push(options.footer);
  }

  return sections.join("\n\n---\n\n") + "\n";
}

function claudeRenderer(modules: ParsedModule[], options: RenderOptions): string {
  const sections: string[] = [];

  if (options.header) {
    sections.push(options.header);
  }

  // Claude Code prefers a flat structure with clear headings
  for (const mod of modules) {
    const title = mod.frontmatter.name ?? mod.slug;
    sections.push(`## ${title}\n\n${stripLeadingHeading(mod.content, title)}`);
  }

  if (options.footer) {
    sections.push(options.footer);
  }

  return sections.join("\n\n") + "\n";
}

function cursorRenderer(modules: ParsedModule[], options: RenderOptions): string {
  // Cursor uses a single flat file, similar to default
  const sections: string[] = [];

  if (options.header) {
    sections.push(options.header);
  }

  for (const mod of modules) {
    const title = mod.frontmatter.name ?? mod.slug;
    const globHint = mod.frontmatter.globs
      ? `\n<!-- Applies to: ${mod.frontmatter.globs.join(", ")} -->`
      : "";
    sections.push(`## ${title}${globHint}\n\n${stripLeadingHeading(mod.content, title)}`);
  }

  if (options.footer) {
    sections.push(options.footer);
  }

  return sections.join("\n\n") + "\n";
}

function copilotRenderer(modules: ParsedModule[], options: RenderOptions): string {
  const sections: string[] = [];

  if (options.header) {
    sections.push(options.header);
  }

  // Copilot instructions should be concise and direct
  for (const mod of modules) {
    const title = mod.frontmatter.name ?? mod.slug;
    sections.push(`### ${title}\n\n${stripLeadingHeading(mod.content, title)}`);
  }

  if (options.footer) {
    sections.push(options.footer);
  }

  return sections.join("\n\n") + "\n";
}

const renderers: Record<string, TargetRenderer> = {
  claude: claudeRenderer,
  cursor: cursorRenderer,
  copilot: copilotRenderer,
  gemini: defaultRenderer,
  aider: defaultRenderer,
  codex: defaultRenderer,
  windsurf: defaultRenderer,
};

export function renderForTarget(
  targetName: string,
  modules: ParsedModule[],
  options: RenderOptions
): string {
  const renderer = renderers[targetName] ?? defaultRenderer;
  return renderer(modules, options);
}
