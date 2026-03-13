import { writeFile, mkdir, access, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";

const SLASH_COMMAND = `You are an expert codebase analyst. Your job is to deeply analyze the current project and generate accurate, project-specific OpenSpec modules so that every AI coding tool gets proper context about this codebase.

## Step 1: Analyze the Codebase

Thoroughly explore the project to understand:

1. **Tech stack** — Read \`package.json\`, \`requirements.txt\`, \`go.mod\`, \`Cargo.toml\`, or equivalent. Identify languages, frameworks, libraries, build tools, test frameworks, linters, styling, databases, CI/CD.
2. **Architecture** — Read the directory structure and key entry points. Understand the overall architecture pattern (monorepo, microservices, MVC, domain-driven, etc).
3. **Code patterns** — Read 5-10 representative source files across the codebase. Identify:
   - Naming conventions (file naming, variable/function casing, type prefixes/suffixes)
   - Import/export patterns (default vs named, barrel files)
   - State management approach
   - Error handling patterns
   - API/endpoint patterns
   - Component/module structure
4. **Existing rules** — Check for any existing \`CLAUDE.md\`, \`.cursorrules\`, \`GEMINI.md\`, \`.aiderrules\`, \`AGENTS.md\`, \`.windsurfrules\`, \`.github/copilot-instructions.md\`. Extract valuable rules from them.
5. **Config files** — Read \`.eslintrc*\`, \`tsconfig.json\`, \`prettier*\`, \`.editorconfig\`, etc. to understand enforced conventions.
6. **Domain knowledge** — Understand what the project does, its core domain concepts, key abstractions, and important business logic.

## Step 2: Initialize OpenSpec (if needed)

Check if \`.openspec/\` directory exists. If not, run:
\`\`\`bash
npx @menukfernando/openspec init
\`\`\`

## Step 3: Generate Modules

Based on your analysis, create focused, accurate module files in \`.openspec/modules/\`. Delete the generic starter modules and replace them with project-specific ones.

Each module must use this format:
\`\`\`markdown
---
name: <Module Name>
description: <One-line description>
priority: <number>
tags: [<relevant tags>]
---

<Actual project-specific rules as Markdown>
\`\`\`

### Module guidelines:

- **Be specific** — Don't write "use clean code". Write "use \`useReducer\` with a controller pattern for complex state, not Redux or Context" if that's what the project does.
- **Include real examples** — Reference actual file paths, function names, patterns from the codebase.
- **Cover what an AI needs to know** — Think about what mistakes an AI tool would make without this context.
- **Split by concern** — Create separate modules for different areas (shared, backend, frontend, testing, API, etc). Only create modules that are relevant to this project.
- **Set priorities** — Shared/overview module at 10, domain-specific at 20-30, testing/tooling at 40.

### Typical modules to create (adapt to the project):

1. **\`shared.md\`** (priority: 10) — Project overview, architecture, commands, environment setup, naming conventions that apply everywhere
2. **\`backend.md\`** (priority: 20) — Backend-specific patterns, API conventions, error handling, data layer patterns (only if project has a backend)
3. **\`frontend.md\`** (priority: 20) — Component patterns, state management, styling approach, routing (only if project has a frontend)
4. **\`api.md\`** (priority: 25) — API contracts, socket events, REST conventions, authentication patterns (only if relevant)
5. **\`testing.md\`** (priority: 30) — Test patterns, what to mock, naming conventions, coverage expectations

## Step 4: Generate Config

Update \`.openspec/config.yaml\` if needed. Enable/disable targets based on what AI tools the project uses (enable all by default).

## Step 5: Sync

Run the sync command to generate all AI context files:
\`\`\`bash
npx @menukfernando/openspec sync
\`\`\`

## Step 6: Verify

Read the generated \`CLAUDE.md\` (or another target) and verify it accurately represents the project. If anything is wrong or missing, fix the modules and re-sync.

## Step 7: Report

Show the user a summary of:
- How many modules were created and what they cover
- Which targets were generated
- Any recommendations for additional modules they might want to add manually (domain-specific knowledge you couldn't infer)
`;

export async function runSetupCommand(projectRoot: string): Promise<void> {
  const commandDir = join(projectRoot, ".claude", "commands");
  const commandPath = join(commandDir, "openspec.md");

  // Check if it already exists
  try {
    await access(commandPath);
    console.log(chalk.yellow("⚠ .claude/commands/openspec.md already exists."));
    console.log(chalk.dim("  Delete it first if you want to reinstall."));
    return;
  } catch {
    // Good, doesn't exist yet
  }

  // Create directory
  await mkdir(commandDir, { recursive: true });

  // Write the slash command
  await writeFile(commandPath, SLASH_COMMAND);

  console.log(chalk.green("✓ Installed Claude Code slash command!\n"));
  console.log("  Usage:");
  console.log(chalk.cyan("  Open Claude Code in this project and run:"));
  console.log(chalk.bold("  /openspec\n"));
  console.log(
    chalk.dim(
      "  This will analyze your codebase and generate project-specific\n  OpenSpec modules automatically — no manual editing needed."
    )
  );
}
