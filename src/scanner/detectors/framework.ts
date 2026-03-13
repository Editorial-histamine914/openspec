import type { Detector, FrameworkInfo } from "../types.js";

export const detectFrameworks: Detector = async (ctx) => {
  const frameworks: FrameworkInfo[] = [];
  const deps = getAllDeps(ctx.packageJson);

  // Frontend frameworks
  if (deps["next"]) {
    frameworks.push({
      name: "Next.js",
      category: "fullstack",
      version: deps["next"],
    });
  } else if (deps["react"]) {
    frameworks.push({
      name: "React",
      category: "frontend",
      version: deps["react"],
    });
  }
  if (deps["vue"]) {
    frameworks.push({
      name: "Vue",
      category: "frontend",
      version: deps["vue"],
    });
  }
  if (deps["nuxt"]) {
    frameworks.push({
      name: "Nuxt",
      category: "fullstack",
      version: deps["nuxt"],
    });
  }
  if (deps["svelte"] || deps["@sveltejs/kit"]) {
    frameworks.push({
      name: deps["@sveltejs/kit"] ? "SvelteKit" : "Svelte",
      category: deps["@sveltejs/kit"] ? "fullstack" : "frontend",
      version: deps["svelte"] || deps["@sveltejs/kit"],
    });
  }
  if (deps["angular"] || deps["@angular/core"]) {
    frameworks.push({
      name: "Angular",
      category: "frontend",
      version: deps["@angular/core"] || deps["angular"],
    });
  }

  // Backend frameworks
  if (deps["express"]) {
    frameworks.push({
      name: "Express",
      category: "backend",
      version: deps["express"],
    });
  }
  if (deps["fastify"]) {
    frameworks.push({
      name: "Fastify",
      category: "backend",
      version: deps["fastify"],
    });
  }
  if (deps["hono"]) {
    frameworks.push({
      name: "Hono",
      category: "backend",
      version: deps["hono"],
    });
  }
  if (deps["koa"]) {
    frameworks.push({
      name: "Koa",
      category: "backend",
      version: deps["koa"],
    });
  }
  if (deps["nestjs"] || deps["@nestjs/core"]) {
    frameworks.push({
      name: "NestJS",
      category: "backend",
      version: deps["@nestjs/core"] || deps["nestjs"],
    });
  }

  // Python frameworks (detected by file tree)
  if (ctx.fileTree.some((f) => f === "requirements.txt" || f === "pyproject.toml")) {
    // We can't read requirements.txt contents here, but we check common markers
    if (ctx.fileTree.some((f) => f.includes("manage.py"))) {
      frameworks.push({ name: "Django", category: "fullstack" });
    }
  }

  // CLI frameworks
  if (deps["commander"]) {
    frameworks.push({
      name: "Commander.js",
      category: "backend",
      version: deps["commander"],
    });
  }

  return { frameworks };
};

function getAllDeps(
  packageJson: Record<string, any> | null
): Record<string, string> {
  if (!packageJson) return {};
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
}
