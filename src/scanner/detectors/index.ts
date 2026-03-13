import type { DetectorContext, ScanResult } from "../types.js";
import { detectLanguages } from "./language.js";
import { detectFrameworks } from "./framework.js";
import { detectBuildTools } from "./build-tool.js";
import { detectTesting } from "./testing.js";
import { detectLinting } from "./linting.js";
import { detectStyling } from "./styling.js";
import { detectStructure } from "./structure.js";
import { detectPackageManager } from "./package-manager.js";
import { detectDatabases } from "./database.js";
import { detectCicd } from "./cicd.js";

const detectors = [
  detectLanguages,
  detectFrameworks,
  detectBuildTools,
  detectTesting,
  detectLinting,
  detectStyling,
  detectStructure,
  detectPackageManager,
  detectDatabases,
  detectCicd,
];

export async function runDetectors(
  ctx: DetectorContext
): Promise<ScanResult> {
  const results = await Promise.all(detectors.map((d) => d(ctx)));

  const merged: ScanResult = {
    projectName: ctx.packageJson?.name ?? null,
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

  for (const result of results) {
    if (result.languages) merged.languages.push(...result.languages);
    if (result.frameworks) merged.frameworks.push(...result.frameworks);
    if (result.buildTools) merged.buildTools.push(...result.buildTools);
    if (result.testingTools) merged.testingTools.push(...result.testingTools);
    if (result.linting) merged.linting.push(...result.linting);
    if (result.styling) merged.styling.push(...result.styling);
    if (result.packageManager) merged.packageManager = result.packageManager;
    if (result.projectStructure) {
      merged.projectStructure.directories.push(
        ...result.projectStructure.directories
      );
      merged.projectStructure.entryPoints.push(
        ...result.projectStructure.entryPoints
      );
    }
    if (result.databases) merged.databases.push(...result.databases);
    if (result.cicd) merged.cicd.push(...result.cicd);
    if (result.codeSamples) merged.codeSamples.push(...result.codeSamples);
  }

  return merged;
}
