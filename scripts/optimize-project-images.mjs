import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "content.js"), "utf8"), context);
const sources = new Map();
for (const project of context.window.PORTFOLIO_DATA.projects) {
  if (project.cover) sources.set(project.cover, 1440);
  for (const item of project.media || []) {
    if (!sources.has(item.src)) sources.set(item.src, 1080);
  }
}
for (const filename of ["production-room.jpg", "production-location.jpg", "production-sound.jpg", "camera-monitor.jpg", "editing-timeline.jpg"]) {
  sources.set(`assets/behind-scenes/${filename}`, 1280);
}

let created = 0;
let originalBytes = 0;
let previewBytes = 0;
for (const [source, size] of sources) {
  const input = path.join(root, source);
  const output = path.join(root, "assets/previews", source.replace(/^assets\//, "").replace(/\.[^.]+$/, ".jpg"));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  if (!fs.existsSync(output)) {
    execFileSync("sips", ["--resampleHeightWidthMax", String(size), "--setProperty", "format", "jpeg", "--setProperty", "formatOptions", "74", input, "--out", output], { stdio: "ignore" });
    created += 1;
  }
  originalBytes += fs.statSync(input).size;
  previewBytes += fs.statSync(output).size;
}
console.log(JSON.stringify({ created, images: sources.size, originalBytes, previewBytes, reductionPercent: Math.round((1 - previewBytes / originalBytes) * 100) }));
