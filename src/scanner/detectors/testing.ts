import type { Detector, TestingToolInfo } from "../types.js";

export const detectTesting: Detector = async (ctx) => {
  const testingTools: TestingToolInfo[] = [];
  const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };

  if (deps?.["vitest"]) {
    const config = ctx.fileTree.find((f) =>
      /^vitest\.config\.(ts|js|mjs)$/.test(f)
    );
    testingTools.push({
      name: "Vitest",
      config,
      testPattern: "**/*.test.{ts,tsx,js,jsx}",
    });
  }

  if (deps?.["jest"] || ctx.fileTree.some((f) => f === "jest.config.js" || f === "jest.config.ts")) {
    const config = ctx.fileTree.find((f) => f.startsWith("jest.config"));
    testingTools.push({
      name: "Jest",
      config,
      testPattern: "**/*.test.{ts,tsx,js,jsx}",
    });
  }

  if (deps?.["mocha"]) {
    testingTools.push({ name: "Mocha", testPattern: "test/**/*.{ts,js}" });
  }

  if (deps?.["playwright"] || deps?.["@playwright/test"]) {
    const config = ctx.fileTree.find((f) => f.startsWith("playwright.config"));
    testingTools.push({
      name: "Playwright",
      config,
      testPattern: "**/*.spec.{ts,js}",
    });
  }

  if (deps?.["cypress"]) {
    const config = ctx.fileTree.find((f) => f.startsWith("cypress.config"));
    testingTools.push({
      name: "Cypress",
      config,
      testPattern: "cypress/e2e/**/*.cy.{ts,js}",
    });
  }

  if (deps?.["@testing-library/react"]) {
    testingTools.push({ name: "React Testing Library" });
  }

  return { testingTools };
};
