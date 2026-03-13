import type { Detector } from "../types.js";

export const detectCicd: Detector = async (ctx) => {
  const cicd: string[] = [];

  if (ctx.fileTree.some((f) => f.startsWith(".github/"))) {
    cicd.push("GitHub Actions");
  }
  if (ctx.fileTree.includes(".gitlab-ci.yml")) {
    cicd.push("GitLab CI");
  }
  if (ctx.fileTree.includes("Jenkinsfile")) {
    cicd.push("Jenkins");
  }
  if (ctx.fileTree.includes(".circleci/")) {
    cicd.push("CircleCI");
  }
  if (ctx.fileTree.includes(".travis.yml")) {
    cicd.push("Travis CI");
  }
  if (ctx.fileTree.includes("Dockerfile") || ctx.fileTree.includes("docker-compose.yml")) {
    cicd.push("Docker");
  }

  return { cicd };
};
