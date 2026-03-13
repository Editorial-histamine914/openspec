export interface DetectorContext {
  root: string;
  packageJson: Record<string, any> | null;
  fileTree: string[];
}

export interface LanguageInfo {
  name: string;
  config?: string;
  fileCount: number;
}

export interface FrameworkInfo {
  name: string;
  category: "frontend" | "backend" | "fullstack";
  version?: string;
}

export interface BuildToolInfo {
  name: string;
  config?: string;
}

export interface TestingToolInfo {
  name: string;
  config?: string;
  testPattern?: string;
}

export interface LintingInfo {
  name: string;
  config?: string;
}

export interface StylingInfo {
  name: string;
}

export interface ProjectStructure {
  directories: string[];
  entryPoints: string[];
}

export interface CodeSample {
  filePath: string;
  category: "component" | "api" | "model" | "test" | "config" | "util";
  excerpt: string;
  patterns: string[];
}

export interface ScanResult {
  projectName: string | null;
  languages: LanguageInfo[];
  frameworks: FrameworkInfo[];
  buildTools: BuildToolInfo[];
  testingTools: TestingToolInfo[];
  linting: LintingInfo[];
  styling: StylingInfo[];
  packageManager: string | null;
  projectStructure: ProjectStructure;
  databases: string[];
  cicd: string[];
  codeSamples: CodeSample[];
}

export type Detector = (ctx: DetectorContext) => Promise<Partial<ScanResult>>;
