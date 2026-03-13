import type { Detector } from "../types.js";

export const detectPackageManager: Detector = async (ctx) => {
  if (ctx.fileTree.includes("pnpm-lock.yaml")) {
    return { packageManager: "pnpm" };
  }
  if (ctx.fileTree.includes("yarn.lock")) {
    return { packageManager: "yarn" };
  }
  if (ctx.fileTree.includes("bun.lockb") || ctx.fileTree.includes("bun.lock")) {
    return { packageManager: "bun" };
  }
  if (ctx.fileTree.includes("package-lock.json")) {
    return { packageManager: "npm" };
  }
  return { packageManager: null };
};
