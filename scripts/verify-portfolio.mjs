import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "content.js"), "utf8"), dataContext);
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/image-dimensions.js"), "utf8"), dataContext);
const data = dataContext.window.PORTFOLIO_DATA;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const preview = source => `assets/previews/${source.replace(/^assets\//, "").replace(/\.[^.]+$/, ".jpg")}`;
const exists = source => assert.ok(fs.existsSync(path.join(root, source)), `Missing asset: ${source}`);
let mediaCount = 0;
for (const project of data.projects) {
  if (project.cover) { exists(project.cover); exists(preview(project.cover)); }
  for (const item of project.media || []) { exists(item.src); exists(preview(item.src)); mediaCount += 1; }
  for (const link of project.links || (project.link ? [{ href:project.link }] : [])) {
    assert.equal(new URL(link.href).protocol, "https:");
  }
}
for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)[^"]*"/g)) exists(match[1]);
assert.ok(!html.includes("profile-intro-title"));
assert.ok(!/20\s*人/.test(html));
assert.equal(data.projects.find(project => project.id === "foreign-language").year, "2026.07");
const titles = data.projects.map(project => project.id);
assert.equal(titles.indexOf("beyond-wide"), titles.indexOf("ball-astronomy") + 1);
assert.deepEqual(Array.from(titles.slice(0,3)), ["unwritten-rain", "liancheng", "oxs"]);

// Exercise the actual renderer and image observer without a browser or network.
const projectList = { innerHTML:"", querySelectorAll:() => [] };
const runtime = {
  data, projectList, activeCategory:"all", URL,
  expandedProjectIds:new Set(titles.slice(0,3)),
  window:dataContext.window,
  document:{ querySelectorAll:() => [] },
  projectMediaObserver:null,
  observeReveals:() => {},
  IntersectionObserver:class {
    constructor(callback) { this.callback = callback; this.targets = []; }
    observe(target) { this.targets.push(target); }
    unobserve(target) { this.targets = this.targets.filter(item => item !== target); }
    disconnect() { this.targets = []; }
  }
};
const start = app.indexOf("function escapeHtml");
const end = app.indexOf("function renderProjectSlide");
assert.ok(start > 0 && end > start);
vm.runInNewContext(app.slice(start,end), runtime);
runtime.renderProjects();
const openCount = () => (projectList.innerHTML.match(/class="project-inline-case open"/g) || []).length;
assert.equal(openCount(), 3);
assert.equal((projectList.innerHTML.match(/<img data-src=/g) || []).length, 24);
assert.ok(projectList.innerHTML.includes("project-watch-link"));
assert.ok(projectList.innerHTML.includes("观看完整影片"));
assert.ok(!projectList.innerHTML.includes('<span>https://'));
const oxs = runtime.projectExpandedMarkup(data.projects.find(project => project.id === "oxs"));
assert.ok(oxs.includes("is-original"));

runtime.setProjectExpanded("unwritten-rain",false);
runtime.renderProjects();
assert.equal(openCount(),2);
runtime.activeCategory = "commissioned";
runtime.renderProjects();
runtime.activeCategory = "all";
runtime.renderProjects();
assert.equal(openCount(),2);

const deferredImage = { dataset:{ src:"preview.jpg" }, removeAttribute(name) { if(name === "data-src") delete this.dataset.src; } };
projectList.querySelectorAll = () => [deferredImage];
runtime.observeProjectMedia();
assert.equal(deferredImage.src,undefined);
runtime.projectMediaObserver.callback([{ target:deferredImage, isIntersecting:false }]);
assert.equal(deferredImage.src,undefined);
runtime.projectMediaObserver.callback([{ target:deferredImage, isIntersecting:true }]);
assert.equal(deferredImage.src,"preview.jpg");
assert.equal(deferredImage.dataset.src,undefined);
console.log(JSON.stringify({ projects:data.projects.length, mediaAssets:mediaCount, initiallyExpanded:3, collapsedStatePreserved:true, imageLoading:"viewport-only", result:"passed" }));
