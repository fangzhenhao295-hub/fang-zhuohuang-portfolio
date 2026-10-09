const data = window.PORTFOLIO_DATA;
const filters = document.querySelector("#filters");
const projectList = document.querySelector("#projectList");
const projectDialog = document.querySelector("#projectDialog");
const dialogInfo = document.querySelector("#dialogInfo");
const dialogClose = document.querySelector("#dialogClose");
const dialogMedia = document.querySelector("#dialogMedia");
const dialogPanel = document.querySelector("#dialogPanel");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogCount = document.querySelector("#dialogCount");
const aboutDialog = document.querySelector("#aboutDialog");
const imageDialog = document.querySelector("#imageDialog");
const imageInfo = document.querySelector("#imageInfo");
const imageClose = document.querySelector("#imageClose");
const imageStage = document.querySelector("#imageStage");
const imageDetail = document.querySelector("#imageDetail");
const imagePanel = document.querySelector("#imagePanel");
const imageTitle = document.querySelector("#imageTitle");
const imageCount = document.querySelector("#imageCount");
const gallerySection = document.querySelector("#observations");
const galleryTrack = document.querySelector("#galleryViewport");
const profileEssay = document.querySelector(".profile-essay");

if (aboutDialog && profileEssay) profileEssay.insertAdjacentElement("afterend", aboutDialog);

const main = document.querySelector("#top");
const orderedSectionIds = ["observations", "work", "behind-scenes", "profile", "capabilities"];
if (main) orderedSectionIds.forEach(id => main.append(document.querySelector(`#${id}`)));

const archiveIntro = document.querySelector(".archive-intro");
if (archiveIntro && galleryTrack) {
  archiveIntro.classList.add("section-postscript");
  galleryTrack.insertAdjacentElement("afterend", archiveIntro);
}

const taxonomyNote = document.querySelector(".taxonomy-note");
if (taxonomyNote && projectList) {
  taxonomyNote.classList.add("section-postscript");
  projectList.insertAdjacentElement("afterend", taxonomyNote);
}

let activeCategory = "all";
let activeProject = null;
let activeSlide = 0;
let galleryIndex = 0;
let imageIndex = 0;
let imageGalleryIndex = 0;
let galleryIdleTimer = 0;
let gallerySwapTimer = 0;
let galleryIsVisible = false;
let galleryDirection = 1;
const galleryLayoutFrames = new WeakMap();
let galleryResizeTimer = 0;
let archiveLoadObserver;
const inlineTransitionMs = 720;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const numberedImages = (base, prefix, count, credit, note) => Array.from({ length: count }, (_, index) => ({
  src: `${base}/${prefix}-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `${note} ${String(index + 1).padStart(2, "0")}`,
  credit
}));

const galleryItems = [
  {
    title: "手机摄影",
    description: "在移动中接近现场，让日常先于器材发生",
    code: "MOBILE",
    credit: "华为影像学院",
    note: "城市、市场、旅行与日常光线的即时观察。",
    images: numberedImages("assets/photography/mobile/huawei-image-academy", "mobile", 37, "华为影像学院", "手机摄影")
      .filter(image => !["01", "02", "05", "06", "13", "17", "20", "30", "32"].some(number => image.src.endsWith(`mobile-${number}.jpg`)))
  },
  {
    title: "相机摄影",
    description: "为人物、空间与不可重来的现场预留时间",
    code: "CAMERA",
    credit: "Fang Zhuohuang",
    note: "校园人物、城市空间、地方文化与航拍观察。",
    images: [
      ...numberedImages("assets/photography/camera", "camera", 4, "Fang Zhuohuang", "校园人物摄影"),
      { src:"assets/photography/camera/camera-05.jpg", alt:"泉州师范学院校园航拍一", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-06.jpg", alt:"泉州师范学院校园航拍二", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-07.jpg", alt:"惠安女人物纪实", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-08.jpg", alt:"潮汐宙和城市景观", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-09.jpg", alt:"金花人民广场城市摄影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-10.jpg", alt:"金色崇武地方景观", credit:"Fang Zhuohuang" }
    ]
  },
  {
    title: "产品摄影",
    description: "Book & Poster Design Photography",
    code: "PRODUCT",
    credit: "PT: Zhuohuang Fang & Second Chapter Studio",
    note: "以留白、尺度与手的动作呈现书籍、海报的结构、材料与制作过程。",
    images: [
      ...numberedImages("assets/photography/product/book-design-recurrence", "recurrence", 7, "D: Vincent Hong, Zheng Li · PT: Zhuohuang Fang", "Book Design | Recurrence"),
      {
        src: "assets/photography/product/book-design-recurrence/process/studio-process.jpg",
        alt: "Book Design | Recurrence 产品摄影花絮",
        credit: "PT: Zhuohuang Fang"
      },
      { src:"assets/photography/product/bound-by-two/poster-01.jpg", alt:"Poster Design | BOUND BY TWO 海报一", credit:"D: Vincent Hong · PT: Zhuohuang Fang & Second Chapter Studio" },
      { src:"assets/photography/product/bound-by-two/poster-02.jpg", alt:"Poster Design | BOUND BY TWO 海报二", credit:"D: Vincent Hong · PT: Zhuohuang Fang & Second Chapter Studio" },
      { src:"assets/photography/product/bound-by-two/poster-03.jpg", alt:"Poster Design | BOUND BY TWO 海报三", credit:"D: Vincent Hong · PT: Zhuohuang Fang & Second Chapter Studio" },
      { src:"assets/photography/product/bound-by-two/process-01.jpg", alt:"Poster Design | BOUND BY TWO 制作花絮一", credit:"PT: Zhuohuang Fang & Second Chapter Studio" },
      { src:"assets/photography/product/bound-by-two/process-02.jpg", alt:"Poster Design | BOUND BY TWO 制作花絮二", credit:"PT: Zhuohuang Fang & Second Chapter Studio" },
      { src:"assets/photography/product/bound-by-two/process-03.jpg", alt:"Poster Design | BOUND BY TWO 成品合影", credit:"PT: Zhuohuang Fang & Second Chapter Studio" },
      { src:"assets/projects/oxs/oxs-gaming-01.jpg", alt:"OXS 游戏音响桌面场景一", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/oxs/oxs-gaming-02.jpg", alt:"OXS 游戏耳机产品特写", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/oxs/oxs-gaming-03.jpg", alt:"OXS 游戏桌面完整场景", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/oxs/oxs-gaming-04.jpg", alt:"OXS 游戏桌面正面场景", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/oxs/oxs-gaming-06.jpg", alt:"OXS 游戏音响灯效特写", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-02.jpg", alt:"泉州师范学院中秋月饼礼盒开箱陈列", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-04.jpg", alt:"校徽月饼与泉州师范学院教学楼", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-05.jpg", alt:"校徽月饼与校园标识空间", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-06.jpg", alt:"泉州师范学院中秋月饼礼盒手持场景", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-08.jpg", alt:"校园人物手持中秋月饼礼盒", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-09.jpg", alt:"中秋月饼礼盒户外静物场景", credit:"PT: Zhuohuang Fang" }
    ]
  },
  {
    title: "个人创作",
    description: "长期主题、生活现场与仍在生长的观看练习",
    code: "PERSONAL",
    credit: "Fang Zhuohuang",
    note: "从大丰山雨雾延伸到日常劳动、街巷人物、田野、建筑与夜间观测，在不同现场练习观看人与环境的关系。",
    images: [
      { src:"assets/photography/personal/dafeng-mountain/dafeng-01.jpg", alt:"大丰山雨雾系列：雾散曙光", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-02.jpg", alt:"大丰山雨雾系列：迷雾前行", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-03.jpg", alt:"大丰山雨雾系列：喘息", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-04.jpg", alt:"大丰山雨雾系列：雾障破晓", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-01.jpg", alt:"夕阳下在水边清洗蔬菜的劳动者", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-02.jpg", alt:"水面上行人与孩子交错的脚步和倒影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-03.jpg", alt:"浅水中孩子与行人的倒影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-04.jpg", alt:"强烈明暗分界中的老街与骑行者", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-05.jpg", alt:"老街路口坐在木凳上的老人", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-06.jpg", alt:"方窗前的人物剪影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-07.jpg", alt:"积云映衬下的现代建筑", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-08.jpg", alt:"层叠田野中独自行走的人", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-09.jpg", alt:"夜间天文台中的望远镜", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-10.jpg", alt:"天文台内使用望远镜观测的人们", credit:"Fang Zhuohuang" }
    ]
  }
];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;" })[char]);
}

function imageSizeAttributes(src) {
  const dimensions = window.IMAGE_DIMENSIONS?.[src];
  return dimensions ? ` width="${dimensions[0]}" height="${dimensions[1]}"` : "";
}

function imageAspectRatio(image) {
  const src = image.currentSrc || image.getAttribute("src") || image.dataset.src;
  const dimensions = window.IMAGE_DIMENSIONS?.[src];
  if (dimensions) return dimensions[0] / dimensions[1];
  return image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
}

function projectLinks(project) {
  if (Array.isArray(project.links) && project.links.length) return project.links;
  return project.link ? [{ href: project.link, label: project.linkLabel || "观看原片" }] : [];
}

function projectSummaryMarkup(project) {
  return String(project.summary || "")
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function projectLinkMarkup(project, className) {
  return projectLinks(project).map(item => `<a class="${className}" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer"><span>${escapeHtml(item.label || "相关链接")}</span><span>${escapeHtml(item.href)} ↗</span></a>`).join("");
}

function projectExpandedMarkup(project) {
  const media = project.media || [];
  return `
    <header>
      <span>PROJECT MEDIA / 作品影像与链接</span>
      <button class="project-collapse" type="button" data-project-collapse="${project.id}" aria-label="收起${escapeHtml(project.title)}完整项目" title="收起项目"><span class="project-toggle-arrow is-open" aria-hidden="true"></span></button>
    </header>
    ${media.length ? `<div class="project-inline-media ${media.length === 1 ? "is-single" : ""}">${media.map((item, index) => `<figure><img src="${item.src}" alt="${escapeHtml(item.alt || `${project.title}案例图片 ${index + 1}`)}"${imageSizeAttributes(item.src)} loading="lazy" decoding="async"><figcaption>${escapeHtml(item.label || `IMAGE ${String(index + 1).padStart(2, "0")}`)}</figcaption></figure>`).join("")}</div>` : ""}
    ${projectLinks(project).length ? `<div class="project-inline-links">${projectLinkMarkup(project, "project-inline-link")}</div>` : ""}`;
}

function renderFilters() {
  filters.innerHTML = data.categories.map(category => {
    const count = category.id === "all" ? data.projects.length : data.projects.filter(item => item.category === category.id).length;
    return `<button type="button" data-filter="${category.id}" class="${activeCategory === category.id ? "active" : ""}">${category.zh}<span>${category.en} · ${String(count).padStart(2,"0")}</span></button>`;
  }).join("");
}

function renderProjects() {
  const projects = activeCategory === "all" ? data.projects : data.projects.filter(item => item.category === activeCategory);
  projectList.innerHTML = projects.map((project, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const cover = project.cover ? `
      <span class="project-cover-frame" aria-hidden="true">
        <img class="project-cover" src="${project.cover}" alt=""${imageSizeAttributes(project.cover)} loading="lazy" decoding="async" fetchpriority="low">
        <span class="project-corner project-corner-a"></span>
        <span class="project-corner project-corner-b"></span>
        <span class="project-corner project-corner-c"></span>
        <span class="project-corner project-corner-d"></span>
      </span>` : "";
    return `
      <article class="project-row project-${escapeHtml(project.id)} project-side-${side} reveal-section ${project.importance === "secondary" ? "is-secondary" : ""}">
        <button class="project-media visual-${escapeHtml(project.visual || "default")} ${project.cover ? "has-cover" : ""}" ${project.cover ? `style="--project-cover:url('${project.cover}')"` : ""} type="button" data-project="${project.id}" aria-expanded="true" aria-label="收起${escapeHtml(project.title)}完整项目">
          ${cover}
          <div class="media-top"><span>PROJECT ${project.no}</span><span>${escapeHtml(project.year)}</span></div>
          <div class="project-card-copy">
            <p>${escapeHtml(project.relation)}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <span>${escapeHtml(project.type)}</span>
          </div>
          <div class="media-bottom"><span>${escapeHtml(project.role)}</span><span class="project-media-action">项目详情 <i class="project-toggle-arrow is-open" aria-hidden="true"></i></span></div>
        </button>
        <div class="project-copy">
          <div class="project-summary">${projectSummaryMarkup(project)}</div>
          <div class="project-facts">
            <div><b>ROLE</b><span>${escapeHtml(project.role)}</span></div>
            <div><b>RESULT</b><span>${escapeHtml(project.result)}</span></div>
          </div>
          <div class="project-actions">
            <button class="project-toggle" type="button" data-project="${project.id}" aria-expanded="true" aria-label="收起${escapeHtml(project.title)}完整项目"><span class="project-toggle-label">收起完整项目</span><span class="project-toggle-arrow is-open" aria-hidden="true"></span></button>
          </div>
        </div>
        <section class="project-inline-case open" data-project-inline="${project.id}" style="height:auto">${projectExpandedMarkup(project)}</section>
      </article>`;
  }).join("");
  observeReveals();
}

function setProjectExpanded(id, expanded) {
  document.querySelectorAll(`[data-project="${id}"]`).forEach(button => {
    button.setAttribute("aria-expanded", String(expanded));
    const project = data.projects.find(item => item.id === id);
    button.setAttribute("aria-label", `${expanded ? "收起" : "展开"}${project ? project.title : ""}完整项目`);
    const label = button.querySelector(".project-toggle-label");
    if (label) label.textContent = expanded ? "收起完整项目" : "展开完整项目";
    button.querySelectorAll(".project-toggle-arrow").forEach(arrow => arrow.classList.toggle("is-open", expanded));
  });
}

function settleInlineHeight(inline) {
  if (inline.hidden || !inline.classList.contains("open")) return;
  inline.style.height = "auto";
}

function openProject(id) {
  const project = data.projects.find(item => item.id === id);
  if (!project) return;
  const inline = document.querySelector(`[data-project-inline="${id}"]`);
  if (!inline) return;
  if (!inline.hidden && inline.classList.contains("open")) {
    closeInlineProject(id);
    return;
  }

  inline.innerHTML = projectExpandedMarkup(project);
  window.clearTimeout(inline._closeTimer);
  window.clearTimeout(inline._openTimer);
  inline.hidden = false;
  inline.classList.remove("open");
  inline.style.height = "0px";
  setProjectExpanded(id, true);

  if (reduceMotion.matches) {
    inline.classList.add("open");
    inline.style.height = "auto";
    return;
  }

  requestAnimationFrame(() => {
    inline.classList.add("open");
    inline.style.height = `${inline.scrollHeight}px`;
    inline.querySelectorAll("img").forEach(image => image.addEventListener("load", () => {
      if (inline.classList.contains("open") && inline.style.height !== "auto") {
        inline.style.height = `${inline.scrollHeight}px`;
      }
    }, { once:true }));
    inline._openTimer = window.setTimeout(() => settleInlineHeight(inline), inlineTransitionMs + 40);
  });
}

function closeInlineProject(id) {
  const inline = document.querySelector(`[data-project-inline="${id}"]`);
  if (!inline || inline.hidden) return;
  window.clearTimeout(inline._openTimer);
  window.clearTimeout(inline._closeTimer);
  setProjectExpanded(id, false);

  if (reduceMotion.matches) {
    inline.classList.remove("open");
    inline.hidden = true;
    inline.innerHTML = "";
    inline.style.removeProperty("height");
    return;
  }

  inline.style.height = `${inline.scrollHeight}px`;
  inline.offsetHeight;
  inline.classList.remove("open");
  inline.style.height = "0px";
  inline._closeTimer = window.setTimeout(() => {
    inline.hidden = true;
    inline.innerHTML = "";
    inline.style.removeProperty("height");
  }, inlineTransitionMs + 40);
}

function renderProjectSlide(direction = 0) {
  if (!activeProject) return;
  const slides = activeProject.media || [
    { label: "COVER / 项目封面" },
    { label: "STILLS / 成片静帧" },
    { label: "PROCESS / 创作过程" }
  ];
  activeSlide = (activeSlide + direction + slides.length) % slides.length;
  const slide = slides[activeSlide];
  dialogMedia.className = `dialog-media visual-${escapeHtml(activeProject.visual || "default")} slide-${activeSlide}`;
  dialogMedia.innerHTML = slide.src
    ? `<img src="${slide.src}" alt="${escapeHtml(slide.alt || activeProject.title)}">`
    : `<strong>${escapeHtml(activeProject.title)}</strong><span class="slide-label">${escapeHtml(slide.label)}</span>`;
  dialogCount.textContent = `${activeSlide + 1} / ${slides.length}`;
}

function openAbout(tab = "bio") {
  switchAboutTab(tab);
  aboutDialog.hidden = false;
  requestAnimationFrame(() => aboutDialog.classList.add("open"));
}

function closeAbout() {
  aboutDialog.classList.remove("open");
  window.setTimeout(() => { aboutDialog.hidden = true; }, 460);
}

function switchAboutTab(tab) {
  document.querySelectorAll("[data-about-tab]").forEach(button => button.classList.toggle("active", button.dataset.aboutTab === tab));
  document.querySelectorAll("[data-about-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.aboutPanel === tab));
}

function placeholderMarkup(item, index) {
  return `<span class="archive-placeholder"><i>${item.code}</i><b>${String(index + 1).padStart(2,"0")}</b></span><em>IMAGE SLOT ${String(index + 1).padStart(2,"0")}</em>`;
}

function layoutArchiveGrid(grid) {
  const previousFrame = galleryLayoutFrames.get(grid);
  if (previousFrame) window.cancelAnimationFrame(previousFrame);
  const buttons = [...grid.querySelectorAll(".archive-thumb")]
    .sort((a, b) => Number(a.dataset.layoutOrder || 0) - Number(b.dataset.layoutOrder || 0));
  const images = buttons.map(button => button.querySelector("img")).filter(Boolean);

  grid.classList.toggle("is-placeholder-grid", images.length === 0);
  grid.classList.remove("is-loading-layout");
  if (!images.length) return;

  const hasStableDimensions = images.every(image => Boolean(window.IMAGE_DIMENSIONS?.[image.getAttribute("src") || image.dataset.src]));
  const imagesReady = hasStableDimensions
    ? Promise.resolve()
    : Promise.allSettled(images.map(image => image.complete
      ? Promise.resolve()
      : image.decode().catch(() => undefined)));
  const fallbackReady = new Promise(resolve => window.setTimeout(resolve, 900));

  Promise.race([imagesReady, fallbackReady]).then(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!buttons.every(button => grid.contains(button))) return;
      const width = grid.clientWidth;
      if (!width) return;

      if (window.innerWidth <= 760) {
        const columns = [document.createElement("div"), document.createElement("div")];
        const columnHeights = [0, 0];
        columns.forEach(column => { column.className = "archive-column"; });
        buttons.forEach((button, index) => {
          button.style.removeProperty("width");
          const image = images[index];
          const ratio = imageAspectRatio(image);
          const columnIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1;
          columns[columnIndex].append(button);
          columnHeights[columnIndex] += (width / 2) / ratio + 28;
        });
        grid.replaceChildren(...columns);
        grid.classList.remove("is-placeholder-grid", "is-loading-layout", "is-justified", "is-deferred");
        grid.classList.add("is-mobile-masonry");
        return;
      }

      grid.classList.remove("is-mobile-masonry");

      const gap = window.innerWidth <= 760 ? 7 : 12;
      const targetHeight = window.innerWidth <= 760 ? 220 : 260;
      const ratios = images.map(imageAspectRatio);
      const ratioSum = ratios.reduce((sum, ratio) => sum + ratio, 0);
      const naturalRowCount = Math.round((ratioSum * targetHeight) / width);
      const rowCount = Math.max(1, Math.min(buttons.length, images.length <= 8 ? 2 : naturalRowCount));
      const rows = [];
      let cursor = 0;
      let remainingRatio = ratioSum;

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        const rowsLeft = rowCount - rowIndex;
        const maxEnd = buttons.length - (rowsLeft - 1);
        const targetRatio = remainingRatio / rowsLeft;
        let end = cursor;
        let rowRatio = 0;

        while (end < maxEnd) {
          const nextRatio = rowRatio + ratios[end];
          if (end > cursor && Math.abs(targetRatio - rowRatio) <= Math.abs(targetRatio - nextRatio)) break;
          rowRatio = nextRatio;
          end += 1;
        }
        if (rowIndex === rowCount - 1) {
          end = buttons.length;
          rowRatio = ratios.slice(cursor).reduce((sum, ratio) => sum + ratio, 0);
        }
        rows.push({ start: cursor, end, ratio: rowRatio });
        remainingRatio -= rowRatio;
        cursor = end;
      }

      const fragment = document.createDocumentFragment();
      rows.forEach(row => {
        const rowElement = document.createElement("div");
        rowElement.className = "archive-row";
        const itemCount = row.end - row.start;
        const rowHeight = (width - gap * (itemCount - 1)) / row.ratio;
        rowElement.style.height = `${rowHeight}px`;
        for (let index = row.start; index < row.end; index += 1) {
          const button = buttons[index];
          button.style.width = `${ratios[index] * rowHeight}px`;
          rowElement.append(button);
        }
        fragment.append(rowElement);
      });

      grid.replaceChildren(fragment);
      grid.classList.remove("is-placeholder-grid", "is-loading-layout", "is-deferred");
      grid.classList.add("is-justified");
    });
    galleryLayoutFrames.set(grid, frame);
  });
}

function updateGallery(direction = 0, isAutomatic = false) {
  galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
  galleryDirection = direction || galleryDirection;
  const item = galleryItems[galleryIndex];
  document.querySelector("#galleryTitle").textContent = item.title;
  document.querySelector("#galleryDescription").textContent = item.images.length
    ? `${item.description} · ${item.images.length} 张`
    : item.description;
  document.querySelector("#galleryCounter").textContent = `${String(galleryIndex + 1).padStart(2,"0")} / ${String(galleryItems.length).padStart(2,"0")}`;
  const grid = document.querySelector("#galleryGrid");
  const preview = item.images.length ? item.images : Array.from({ length: 8 }, () => null);
  grid.innerHTML = preview.map((image, index) => `
    <button class="archive-thumb archive-thumb-${index + 1}" type="button" data-layout-order="${index}" data-image-index="${index}" aria-label="查看${item.title}第 ${index + 1} 张图片">
      ${image ? `<img src="${image.src}" alt="${escapeHtml(image.alt)}"${imageSizeAttributes(image.src)} loading="lazy" decoding="async">` : placeholderMarkup(item, index)}
      <em>${image ? `${escapeHtml(item.code)} ${String(index + 1).padStart(2,"0")}` : `IMAGE SLOT ${String(index + 1).padStart(2,"0")}`}</em>
    </button>`).join("");
  grid.className = `archive-grid gallery-${item.code.toLowerCase()} ${isAutomatic ? "is-drifting" : "pop"} ${galleryDirection < 0 ? "from-left" : "from-right"}`;
  layoutArchiveGrid(grid);
}

function renderAllGalleries() {
  const toolbar = document.querySelector(".archive-toolbar");
  if (toolbar) toolbar.hidden = true;
  const viewport = document.querySelector("#galleryViewport");
  viewport.innerHTML = galleryItems.map((item, groupIndex) => {
    const preview = item.images.length ? item.images : Array.from({ length: 4 }, () => null);
    return `<section class="archive-chapter archive-chapter-${groupIndex + 1}" style="--chapter-index:${groupIndex}" aria-labelledby="archive-title-${groupIndex}">
      <header class="archive-chapter-head"><div><span>${String(groupIndex + 1).padStart(2,"0")} / ${String(galleryItems.length).padStart(2,"0")}</span><h3 id="archive-title-${groupIndex}">${escapeHtml(item.title)}</h3></div><p>${escapeHtml(item.description)}${item.images.length ? ` · ${item.images.length} 张` : " · 待补充"}</p></header>
      <div class="archive-grid gallery-${item.code.toLowerCase()}" data-gallery-grid="${groupIndex}">
        ${preview.map((image, index) => `<button class="archive-thumb archive-thumb-${index + 1}" type="button" data-layout-order="${index}" data-gallery-index="${groupIndex}" data-image-index="${index}" aria-label="查看${item.title}第 ${index + 1} 张图片">${image ? `<img data-src="${image.src}" alt="${escapeHtml(image.alt)}"${imageSizeAttributes(image.src)} loading="lazy" decoding="async">` : placeholderMarkup(item, index)}<em>${image ? `${escapeHtml(item.code)} ${String(index + 1).padStart(2,"0")}` : `IMAGE SLOT ${String(index + 1).padStart(2,"0")}`}</em></button>`).join("")}
      </div>
    </section>`;
  }).join("");
  const grids = [...viewport.querySelectorAll("[data-gallery-grid]")];
  grids.forEach(layoutArchiveGrid);
  archiveLoadObserver?.disconnect();
  archiveLoadObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const image = entry.target;
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
    archiveLoadObserver.unobserve(image);
  }), { rootMargin:"1000px 0px" });
  viewport.querySelectorAll("img[data-src]").forEach(image => archiveLoadObserver.observe(image));
}

function scheduleGalleryRotation() {
  window.clearTimeout(galleryIdleTimer);
  gallerySection.classList.remove("is-gallery-drifting");
}

function switchGallery(direction, isAutomatic = false) {
  if (isAutomatic && !galleryIsVisible) return;
  window.clearTimeout(gallerySwapTimer);
  window.clearTimeout(galleryIdleTimer);
  galleryDirection = direction;
  gallerySection.classList.remove("is-gallery-drifting");
  gallerySection.classList.toggle("gallery-exit-left", direction > 0);
  gallerySection.classList.toggle("gallery-exit-right", direction < 0);
  gallerySection.classList.add("is-gallery-changing");
  gallerySwapTimer = window.setTimeout(() => {
    updateGallery(direction, isAutomatic);
    gallerySection.classList.remove("gallery-exit-left", "gallery-exit-right", "is-gallery-changing");
    gallerySection.classList.add(direction > 0 ? "gallery-enter-right" : "gallery-enter-left");
    window.setTimeout(() => gallerySection.classList.remove("gallery-enter-right", "gallery-enter-left"), 760);
    scheduleGalleryRotation();
  }, 420);
}

function openImage(index, groupIndex = galleryIndex) {
  window.clearTimeout(galleryIdleTimer);
  window.clearTimeout(gallerySwapTimer);
  gallerySection.classList.remove("is-gallery-changing", "is-gallery-drifting", "gallery-exit-left", "gallery-exit-right");
  imageGalleryIndex = groupIndex;
  imageIndex = index;
  imageDialog.showModal();
  document.body.classList.add("dialog-open");
  imageDialog.classList.remove("info-open");
  renderImageDetail();
}

function renderImageDetail(direction = 0) {
  const item = galleryItems[imageGalleryIndex];
  const count = Math.max(1, item.images.length);
  imageIndex = (imageIndex + direction + count) % count;
  const image = item.images[imageIndex];
  imageDetail.innerHTML = image
    ? `<img src="${image.src}" alt="${escapeHtml(image.alt)}">`
    : `<span>${escapeHtml(item.code)}</span><b>${String(imageIndex + 1).padStart(2,"0")}</b><i>IMAGE PLACEHOLDER</i>`;
  imageTitle.textContent = `${item.title} / ${item.description}`;
  imageCount.textContent = `${imageIndex + 1} / ${count}`;
  imagePanel.innerHTML = `<p class="overline">${escapeHtml(item.code)} / 图片说明</p><h3>${escapeHtml(item.title)} · ${String(imageIndex + 1).padStart(2,"0")}</h3><p>${escapeHtml(item.note)}</p><dl><dt>CATEGORY</dt><dd>${escapeHtml(item.title)}</dd><dt>CREDIT</dt><dd>${escapeHtml(image?.credit || item.credit)}</dd><dt>STATUS</dt><dd>${image ? "已收录" : "等待补充正式图片"}</dd></dl>`;
}

const cover = document.querySelector(".cover");
const coverMark = document.querySelector(".cover-mark");
let proximityReady = false;
let targetBlur = 7;
let currentBlur = 0;
let focusFrame = 0;
let coverIsVisible = true;

function canUseCoverMotion() {
  return finePointer.matches && !reduceMotion.matches && coverIsVisible && !document.hidden;
}

window.setTimeout(() => cover.classList.remove("is-initial-focus"), 3000);
window.setTimeout(() => {
  if (!finePointer.matches || reduceMotion.matches) return;
  proximityReady = true;
  currentBlur = 7;
  cover.classList.add("is-proximity-ready");
  runFocusEase();
}, 8000);

function runFocusEase() {
  if (!proximityReady || !canUseCoverMotion()) {
    focusFrame = 0;
    return;
  }
  currentBlur += (targetBlur - currentBlur) * .075;
  cover.style.setProperty("--proximity-blur", `${currentBlur.toFixed(3)}px`);
  focusFrame = requestAnimationFrame(runFocusEase);
}

function updateFocusTarget(event) {
  if (!proximityReady) return;
  const rect = coverMark.getBoundingClientRect();
  const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
  const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
  const distance = Math.hypot(dx, dy);
  const radius = Math.max(260, Math.min(window.innerWidth, window.innerHeight) * .5);
  targetBlur = Math.min(7, Math.max(0, distance / radius * 7));
  const x = ((event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1));
  const y = ((event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1));
  cover.style.setProperty("--mx", Math.max(-1, Math.min(1, x)).toFixed(3));
  cover.style.setProperty("--my", Math.max(-1, Math.min(1, y)).toFixed(3));
}

function enterPortfolio() {
  animateScrollTo(Math.max(0, document.querySelector("#profile").offsetTop - 58), 820);
}

if (finePointer.matches && !reduceMotion.matches) {
  document.addEventListener("pointermove", updateFocusTarget, { passive: true });
}
document.documentElement.addEventListener("pointerleave", () => { targetBlur = 7; });
window.addEventListener("blur", () => { targetBlur = 7; });
new IntersectionObserver(entries => {
  coverIsVisible = entries[0]?.isIntersecting ?? false;
  if (coverIsVisible && proximityReady && !focusFrame) runFocusEase();
}, { threshold:0 }).observe(cover);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && proximityReady && !focusFrame) runFocusEase();
});
coverMark.addEventListener("click", enterPortfolio);
coverMark.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); enterPortfolio(); }
});

function updateCoverScroll() {
  const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * .72)));
  cover.style.setProperty("--cover-progress", progress.toFixed(3));
}

const sceneIds = ["profile", "capabilities", "observations", "work", "behind-scenes", "contact"];
function updateActiveNav() {
  const readingLine = window.scrollY + window.innerHeight * .32;
  let current = sceneIds[0];
  sceneIds.forEach(id => {
    const scene = document.getElementById(id);
    if (scene && scene.offsetTop <= readingLine) current = id;
  });
  document.querySelectorAll(".top-nav a").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
}

function updateSceneReveal() {
  document.querySelectorAll(".scene").forEach(scene => {
    const rect = scene.getBoundingClientRect();
    const start = window.innerHeight * .94;
    const end = window.innerHeight * .14;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    scene.style.setProperty("--scene-reveal", `${(progress * 100).toFixed(2)}%`);
    scene.style.setProperty("--scene-frost", (1 - progress).toFixed(3));
    scene.classList.toggle("is-revealed", progress > .995);
  });
}

let scrollFrame = 0;
function scheduleScrollWork() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateCoverScroll();
    updateActiveNav();
    updateSceneReveal();
    scrollFrame = 0;
  });
}
window.addEventListener("scroll", scheduleScrollWork, { passive: true });
window.addEventListener("resize", scheduleScrollWork, { passive: true });

function animateScrollTo(targetY, customDuration = 660) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : customDuration;
  if (!duration) { window.scrollTo(0, targetY); return; }
  const startedAt = performance.now();
  const tick = now => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll('.site-header a[href^="#"]').forEach(link => link.addEventListener("click", event => {
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  history.replaceState(null, "", link.getAttribute("href"));
  animateScrollTo(Math.max(0, target.offsetTop - 58));
}));

document.addEventListener("click", event => {
  const filter = event.target.closest("[data-filter]");
  const project = event.target.closest("[data-project]");
  const aboutOpen = event.target.closest("[data-about-open]");
  const aboutClose = event.target.closest("[data-about-close]");
  const aboutTab = event.target.closest("[data-about-tab]");
  const projectCollapse = event.target.closest("[data-project-collapse]");
  const imageThumb = event.target.closest("[data-image-index]");
  if (filter) { activeCategory = filter.dataset.filter; renderFilters(); renderProjects(); }
  if (project) openProject(project.dataset.project);
  if (projectCollapse) closeInlineProject(projectCollapse.dataset.projectCollapse);
  if (aboutOpen) openAbout();
  if (aboutClose) closeAbout();
  if (aboutTab) switchAboutTab(aboutTab.dataset.aboutTab);
  if (imageThumb) openImage(Number(imageThumb.dataset.imageIndex), Number(imageThumb.dataset.galleryIndex ?? galleryIndex));
  if (event.target === dialogInfo) projectDialog.classList.toggle("info-open");
  if (event.target === dialogClose) projectDialog.close();
  if (event.target === imageInfo) imageDialog.classList.toggle("info-open");
  if (event.target === imageClose) imageDialog.close();
  if (event.target.closest("#imagePrev")) renderImageDetail(-1);
  if (event.target.closest("#imageNext")) renderImageDetail(1);
  if (event.target.closest("#dialogPrev")) renderProjectSlide(-1);
  if (event.target.closest("#dialogNext")) renderProjectSlide(1);
  if (event.target.closest("#galleryPrev")) switchGallery(-1);
  if (event.target.closest("#galleryNext")) switchGallery(1);
});

projectDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
imageDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (galleryIsVisible) scheduleGalleryRotation();
});
document.addEventListener("keydown", event => {
  if (projectDialog.open) {
    if (event.key === "ArrowLeft") renderProjectSlide(-1);
    if (event.key === "ArrowRight") renderProjectSlide(1);
    if (event.key === "i" || event.key === "I") projectDialog.classList.toggle("info-open");
  }
  if (imageDialog.open) {
    if (event.key === "ArrowLeft") renderImageDetail(-1);
    if (event.key === "ArrowRight") renderImageDetail(1);
    if (event.key === "i" || event.key === "I") imageDialog.classList.toggle("info-open");
  }
});

let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.target.classList.contains("project-row")) {
        entry.target.classList.toggle("visible", entry.isIntersecting);
      } else if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .06 });
  }
  document.querySelectorAll(".reveal-section:not(.visible)").forEach(element => revealObserver.observe(element));
}

function prepareScenes() {
  document.querySelectorAll("#profile, #capabilities, #observations, #work, #behind-scenes, #contact").forEach(scene => scene.classList.add("scene"));
  document.body.classList.add("motion-ready");
  scheduleScrollWork();
}

renderFilters();
renderProjects();
renderAllGalleries();
gallerySection.addEventListener("pointermove", scheduleGalleryRotation, { passive: true });
gallerySection.addEventListener("pointerdown", scheduleGalleryRotation, { passive: true });
gallerySection.addEventListener("keydown", scheduleGalleryRotation);
window.addEventListener("resize", () => {
  window.clearTimeout(galleryResizeTimer);
  galleryResizeTimer = window.setTimeout(() => document.querySelectorAll("[data-gallery-grid]").forEach(layoutArchiveGrid), 140);
}, { passive: true });
const galleryObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  galleryIsVisible = entry.isIntersecting;
  if (galleryIsVisible) scheduleGalleryRotation();
  else {
    window.clearTimeout(galleryIdleTimer);
    window.clearTimeout(gallerySwapTimer);
    gallerySection.classList.remove("is-gallery-changing", "is-gallery-drifting");
  }
}), { threshold: .12 });
galleryObserver.observe(gallerySection);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) window.clearTimeout(galleryIdleTimer);
  else scheduleGalleryRotation();
});
observeReveals();
prepareScenes();
