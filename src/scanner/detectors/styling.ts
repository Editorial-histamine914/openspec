import type { Detector, StylingInfo } from "../types.js";

export const detectStyling: Detector = async (ctx) => {
  const styling: StylingInfo[] = [];
  const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };

  if (deps?.["tailwindcss"] || ctx.fileTree.some((f) => f.startsWith("tailwind.config"))) {
    styling.push({ name: "Tailwind CSS" });
  }

  if (deps?.["sass"] || deps?.["node-sass"]) {
    styling.push({ name: "SCSS/Sass" });
  }

  if (deps?.["styled-components"]) {
    styling.push({ name: "styled-components" });
  }

  if (deps?.["@emotion/react"] || deps?.["@emotion/styled"]) {
    styling.push({ name: "Emotion" });
  }

  // CSS Modules detection via file tree
  if (ctx.fileTree.some((f) => f.includes(".module.css") || f.includes(".module.scss"))) {
    styling.push({ name: "CSS Modules" });
  }

  return { styling };
};
