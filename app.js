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
const behindScenesGrid = document.querySelector(".behind-scenes-grid");

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
let behindScenesLayoutFrame = 0;
let archiveLoadObserver;
let projectMediaObserver;
const inlineTransitionMs = 360;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactLayout = window.matchMedia("(max-width: 900px)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const numberedImages = (base, prefix, count, credit, note) => Array.from({ length: count }, (_, index) => ({
  src: `${base}/${prefix}-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `${note} ${String(index + 1).padStart(2, "0")}`,
  credit
}));

const galleryItems = [
  {
    title: "手机摄影",
    description: "使用手机完成的城市、旅途与日常记录",
    code: "MOBILE",
    credit: "华为影像学院",
    note: "以手机作为随身相机，记录城市、市场、旅途与日常光线。",
    images: numberedImages("assets/photography/mobile/huawei-image-academy", "mobile", 37, "华为影像学院", "日常观察")
      .filter(image => !["01", "02", "05", "06", "13", "17", "20", "21", "22", "24", "26", "30", "32"].some(number => image.src.endsWith(`mobile-${number}.jpg`)))
  },
  {
    title: "人物与地方",
    description: "人物、空间与地方文化中的关系线索",
    code: "CAMERA",
    credit: "Fang Zhuohuang",
    note: "围绕校园人物、城市空间、地方文化与地景展开的摄影记录。",
    images: [
      ...numberedImages("assets/photography/camera", "camera", 4, "Fang Zhuohuang", "校园人物摄影"),
      { src:"assets/photography/camera/camera-05.jpg", alt:"泉州师范学院校园航拍一", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-06.jpg", alt:"泉州师范学院校园航拍二", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-07.jpg", alt:"惠安女人物纪实", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-08.jpg", alt:"潮汐昼合航拍摄影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-09.jpg", alt:"金花人民广场城市摄影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/camera/camera-10.jpg", alt:"金色崇武地方景观", credit:"Fang Zhuohuang" }
    ]
  },
  {
    title: "产品与静物",
    description: "书籍、海报与消费电子产品的视觉呈现",
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
      { src:"assets/projects/qnu-mooncake/mooncake-04.jpg", alt:"校徽月饼与泉州师范学院教学楼", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-05.jpg", alt:"校徽月饼与校园标识空间", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-06.jpg", alt:"泉州师范学院中秋月饼礼盒手持场景", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-08.jpg", alt:"校园人物手持中秋月饼礼盒", credit:"PT: Zhuohuang Fang" },
      { src:"assets/projects/qnu-mooncake/mooncake-09.jpg", alt:"中秋月饼礼盒户外静物场景", credit:"PT: Zhuohuang Fang" }
    ]
  },
  {
    title: "个人创作",
    description: "围绕长期主题展开的摄影创作与观看练习",
    code: "PERSONAL",
    credit: "Fang Zhuohuang",
    note: "从舞台、雾中人群与田野拍摄现场，延伸到大丰山雨雾、日常劳动、街巷人物、建筑与夜间观测，在不同现场练习观看人与环境的关系。",
    images: [
      { src:"assets/photography/personal/recent/stage-piano.jpg", alt:"舞台灯光下的钢琴演奏与观众", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/recent/fog-crowd.jpg", alt:"浓雾中等待的人群与近处剪影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/recent/silhouettes.jpg", alt:"明亮出口前并肩观看的四个人影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/recent/ridge-filmmaker.jpg", alt:"山脊上俯瞰村落的拍摄者", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-04.jpg", alt:"大丰山雨雾系列：雾障破晓", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-01.jpg", alt:"大丰山雨雾系列：雾散曙光", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-02.jpg", alt:"大丰山雨雾系列：迷雾前行", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/dafeng-mountain/dafeng-03.jpg", alt:"大丰山雨雾系列：喘息", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-08.jpg", alt:"层叠田野中独自行走的人", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-07.jpg", alt:"积云映衬下的现代建筑", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-05.jpg", alt:"老街路口坐在木凳上的老人", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-06.jpg", alt:"方窗前的人物剪影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-01.jpg", alt:"夕阳下在水边清洗蔬菜的劳动者", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-02.jpg", alt:"水面上行人与孩子交错的脚步和倒影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-03.jpg", alt:"浅水中孩子与行人的倒影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-04.jpg", alt:"强烈明暗分界中的老街与骑行者", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/field-notes/field-note-10.jpg", alt:"天文台内使用望远镜观测的人们", credit:"Fang Zhuohuang" }
    ]
  },
  {
    title: "童年，总是不具象的",
    description: "关于童年、亲密关系与水中倒影的六张摄影练习",
    code: "PERSONAL 01",
    credit: "Fang Zhuohuang",
    note: "孩子、家人与水面在行走、停留和倒影中彼此重叠。这个系列不试图还原一个具体童年，而把记忆保留为动作、光线与模糊的轮廓。",
    images: [
      { src:"assets/photography/personal/childhood/childhood-05.jpg", alt:"一大一小两个人影在水面中变形", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/childhood/childhood-06.jpg", alt:"孩子举起手臂走过浅水，远处是家人与山峦", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/childhood/childhood-01.jpg", alt:"家人与孩子在山脚浅水中行走", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/childhood/childhood-03.jpg", alt:"夕阳下在水边清洗蔬菜的人", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/childhood/childhood-02.jpg", alt:"浅水中的脚步与交叠倒影", credit:"Fang Zhuohuang" },
      { src:"assets/photography/personal/childhood/childhood-04.jpg", alt:"水中倒映的成人与孩子", credit:"Fang Zhuohuang" }
    ]
  }
];

const personalCreation = galleryItems.find(item => item.title === "个人创作");
const childhoodSeries = galleryItems.find(item => item.title === "童年，总是不具象的");
const peopleAndPlaces = galleryItems.find(item => item.title === "人物与地方");

personalCreation.title = "个人摄影";
personalCreation.description = "一个主题组照与两组按色调整理的近期观察";
personalCreation.note = "保留明确命名的组照，其余作品不再假定地点或事件，而按黑白灰与综合色调整理。";

const personalPool = [...personalCreation.images, ...peopleAndPlaces.images]
  .filter(image => !["fog-crowd.jpg", "field-note-01.jpg", "field-note-02.jpg"]
    .some(file => image.src.endsWith(file)));
const imagesByFile = files => files.map(file => personalPool.find(image => image.src.endsWith(file))).filter(Boolean);

personalCreation.series = [
  { title:childhoodSeries.title, description:"童年、亲密关系与水中倒影", note:childhoodSeries.note, images:childhoodSeries.images },
  {
    title:"近期观察｜黑白与灰",
    description:"雾、剪影、舞台与低照度空间",
    note:"把原本分散在近期观察与山中雨雾中的照片合并，以明暗、雾气和低饱和度作为观看线索。",
    images:imagesByFile([
      "stage-piano.jpg", "silhouettes.jpg",
      "dafeng-04.jpg", "dafeng-01.jpg", "dafeng-02.jpg", "dafeng-03.jpg",
      "field-note-04.jpg", "field-note-06.jpg", "field-note-05.jpg"
    ])
  },
  {
    title:"近期观察｜综合色调",
    description:"青绿、暖色与夜间光线",
    note:"按画面的综合色调组织人物、地景与日常现场，不再为不确定的照片添加地点判断。",
    images:imagesByFile([
      "field-note-10.jpg", "camera-01.jpg", "camera-02.jpg",
      "camera-03.jpg", "ridge-filmmaker.jpg", "field-note-08.jpg",
      "field-note-07.jpg", "field-note-03.jpg", "camera-04.jpg",
      "camera-05.jpg", "camera-06.jpg", "camera-07.jpg",
      "camera-08.jpg", "camera-09.jpg", "camera-10.jpg"
    ])
  }
];
personalCreation.images = personalCreation.series.flatMap(series => series.images.map(image => ({
  ...image,
  seriesTitle:series.title,
  seriesNote:series.note
})));

galleryItems.splice(galleryItems.indexOf(childhoodSeries), 1);
galleryItems.splice(galleryItems.indexOf(peopleAndPlaces), 1);

const galleryOrder = ["个人摄影", "产品与静物", "手机摄影"];
galleryItems.sort((a, b) => galleryOrder.indexOf(a.title) - galleryOrder.indexOf(b.title));

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
  const widthAttribute = Number(image.getAttribute("width"));
  const heightAttribute = Number(image.getAttribute("height"));
  if (widthAttribute && heightAttribute) return widthAttribute / heightAttribute;
  return image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
}

function layoutBehindScenes() {
  if (!behindScenesGrid) return;
  window.cancelAnimationFrame(behindScenesLayoutFrame);
  const cards = [...behindScenesGrid.querySelectorAll(".behind-card")];

  if (window.innerWidth > 900) {
    behindScenesGrid.classList.remove("is-mobile-masonry");
    behindScenesGrid.style.removeProperty("height");
    cards.forEach(card => {
      card.style.removeProperty("width");
      card.style.removeProperty("transform");
    });
    return;
  }

  behindScenesGrid.classList.add("is-mobile-masonry");
  const gap = window.innerWidth <= 380 ? 6 : 8;
  const columnWidth = (behindScenesGrid.clientWidth - gap) / 2;
  cards.forEach(card => { card.style.width = `${columnWidth}px`; });

  behindScenesLayoutFrame = window.requestAnimationFrame(() => {
    const heights = [0, 0];
    cards.forEach(card => {
      const column = heights[0] <= heights[1] ? 0 : 1;
      card.style.transform = `translate3d(${column * (columnWidth + gap)}px, ${heights[column]}px, 0)`;
      heights[column] += card.getBoundingClientRect().height + gap;
    });
    behindScenesGrid.style.height = `${Math.max(...heights) - gap}px`;
  });
}

function galleryPreviewSrc(src) {
  return `assets/previews/${src.replace(/^assets\//, "")}`;
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
    ${media.length ? `<div class="project-inline-media ${media.length === 1 ? "is-single" : ""}">${media.map((item, index) => `<figure><img data-src="${item.src}" alt="${escapeHtml(item.alt || `${project.title}案例图片 ${index + 1}`)}"${imageSizeAttributes(item.src)} loading="lazy" decoding="async" fetchpriority="low"><figcaption>${escapeHtml(item.label || `IMAGE ${String(index + 1).padStart(2, "0")}`)}</figcaption></figure>`).join("")}</div>` : ""}
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
  observeProjectMedia();
  observeReveals();
}

function hydrateProjectMedia(inline) {
  inline.querySelectorAll("img[data-src]").forEach(image => {
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  });
}

function observeProjectMedia() {
  projectMediaObserver?.disconnect();
  projectMediaObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    hydrateProjectMedia(entry.target);
    projectMediaObserver.unobserve(entry.target);
  }), { rootMargin:"900px 0px" });
  projectList.querySelectorAll(".project-inline-case.open").forEach(inline => projectMediaObserver.observe(inline));
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
  hydrateProjectMedia(inline);
  window.clearTimeout(inline._closeTimer);
  window.clearTimeout(inline._openTimer);
  inline.hidden = false;
  inline.classList.remove("open");
  inline.style.height = "0px";
  setProjectExpanded(id, true);

  if (reduceMotion.matches || compactLayout.matches) {
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

  if (reduceMotion.matches || compactLayout.matches) {
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
  requestAnimationFrame(() => {
    aboutDialog.classList.add("open");
    requestAnimationFrame(() => animateScrollTo(() => sectionScrollTarget(aboutDialog), 680));
  });
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
      ${image ? `<img src="${galleryPreviewSrc(image.src)}" alt="${escapeHtml(image.alt)}"${imageSizeAttributes(image.src)} loading="lazy" decoding="async">` : placeholderMarkup(item, index)}
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
    let imageOffset = 0;
    const renderGrid = (images, seriesIndex = null) => {
      const startIndex = imageOffset;
      imageOffset += images.length;
      return `<div class="archive-grid gallery-${item.code.toLowerCase()}" data-gallery-grid="${groupIndex}"${seriesIndex === null ? "" : ` data-series-index="${seriesIndex}"`}>
        ${images.map((image, index) => {
          const imageIndex = startIndex + index;
          return `<button class="archive-thumb archive-thumb-${index + 1}" type="button" data-layout-order="${index}" data-gallery-index="${groupIndex}" data-image-index="${imageIndex}" aria-label="查看${escapeHtml(image?.seriesTitle || item.title)}第 ${index + 1} 张图片">${image ? `<img data-src="${galleryPreviewSrc(image.src)}" alt="${escapeHtml(image.alt)}"${imageSizeAttributes(image.src)} loading="lazy" decoding="async">` : placeholderMarkup(item, index)}<em>${image ? `${escapeHtml(item.code)} ${String(imageIndex + 1).padStart(2,"0")}` : `IMAGE SLOT ${String(index + 1).padStart(2,"0")}`}</em></button>`;
        }).join("")}
      </div>`;
    };
    const galleryMarkup = item.series?.length
      ? item.series.map((series, seriesIndex) => `<section class="archive-series">
          <header><div><span>${String(seriesIndex + 1).padStart(2,"0")}</span><h4>${escapeHtml(series.title)}</h4></div><p>${escapeHtml(series.description)} · ${series.images.length} 张</p></header>
          ${renderGrid(series.images.map(image => ({ ...image, seriesTitle:series.title, seriesNote:series.note })), seriesIndex)}
        </section>`).join("")
      : renderGrid(preview);
    return `<section class="archive-chapter archive-chapter-${groupIndex + 1}" style="--chapter-index:${groupIndex}" aria-labelledby="archive-title-${groupIndex}">
      <header class="archive-chapter-head"><div><span>${String(groupIndex + 1).padStart(2,"0")} / ${String(galleryItems.length).padStart(2,"0")}</span><h3 id="archive-title-${groupIndex}">${escapeHtml(item.title)}</h3></div><p>${escapeHtml(item.description)}${item.images.length ? ` · ${item.images.length} 张` : " · 待补充"}</p></header>
      ${galleryMarkup}
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
  imageDialog.classList.add("info-open");
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
  const displayTitle = image?.seriesTitle || item.title;
  const displayNote = image?.seriesNote || item.note;
  imageTitle.textContent = `${displayTitle} / ${item.title}`;
  imageCount.textContent = `${imageIndex + 1} / ${count}`;
  imagePanel.innerHTML = `<p class="overline">${escapeHtml(item.code)} / 图片说明</p><h3>${escapeHtml(displayTitle)} · ${String(imageIndex + 1).padStart(2,"0")}</h3><p>${escapeHtml(displayNote)}</p><dl><dt>CATEGORY</dt><dd>${escapeHtml(item.title)}</dd><dt>CREDIT</dt><dd>${escapeHtml(image?.credit || item.credit)}</dd><dt>STATUS</dt><dd>${image ? "已收录" : "等待补充正式图片"}</dd></dl>`;
}

const cover = document.querySelector(".cover");
const siteHeader = document.querySelector(".site-header");
const coverSlides = [...cover.querySelectorAll("[data-cover-slide]")];
const coverControls = [...cover.querySelectorAll("[data-cover-control]")];
const coverCount = cover.querySelector("[data-cover-count]");
const coverTitle = cover.querySelector("[data-cover-title]");
const coverMeta = cover.querySelector("[data-cover-meta]");
const coverEnter = cover.querySelector("[data-cover-enter]");
const coverParticleCanvas = cover.querySelector("[data-cover-particles]");
const coverParticleContext = coverParticleCanvas?.getContext("2d", { alpha:true });
let coverIndex = 0;
let coverTimer = 0;
let coverIsVisible = true;
let coverParticleFrame = 0;
let coverParticleWidth = 0;
let coverParticleHeight = 0;
let coverParticles = [];
const coverParticlePointer = { x:.5, y:.5, active:false };

function resetCoverParticles() {
  if (!coverParticleCanvas || !coverParticleContext) return;
  const rect = cover.getBoundingClientRect();
  const ratio = Math.min(1.5, window.devicePixelRatio || 1);
  coverParticleWidth = Math.max(1, rect.width);
  coverParticleHeight = Math.max(1, rect.height);
  coverParticleCanvas.width = Math.round(coverParticleWidth * ratio);
  coverParticleCanvas.height = Math.round(coverParticleHeight * ratio);
  coverParticleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = compactLayout.matches ? 14 : 26;
  coverParticles = Array.from({ length:count }, (_, index) => ({
    x:((index * 47) % 97) / 97,
    y:((index * 71 + 19) % 101) / 101,
    radius:index % 5 === 0 ? 1.55 : .8 + (index % 3) * .22,
    drift:.000035 + (index % 4) * .000009,
    phase:index * .73
  }));
}

function drawCoverParticles(timestamp = 0) {
  if (!coverParticleContext || !coverParticleCanvas || !coverIsVisible || document.hidden || reduceMotion.matches) {
    coverParticleFrame = 0;
    return;
  }
  const context = coverParticleContext;
  context.clearRect(0, 0, coverParticleWidth, coverParticleHeight);
  const points = coverParticles.map((particle, index) => {
    const driftX = Math.sin(timestamp * particle.drift + particle.phase) * 10;
    const driftY = Math.cos(timestamp * particle.drift * .82 + particle.phase) * 8;
    const pointerX = coverParticlePointer.active ? (coverParticlePointer.x - .5) * (index % 2 ? 7 : -5) : 0;
    const pointerY = coverParticlePointer.active ? (coverParticlePointer.y - .5) * (index % 3 ? 5 : -4) : 0;
    return {
      x:particle.x * coverParticleWidth + driftX + pointerX,
      y:particle.y * coverParticleHeight + driftY + pointerY,
      radius:particle.radius
    };
  });

  context.lineWidth = .6;
  for (let first = 0; first < points.length; first += 1) {
    for (let second = first + 1; second < points.length; second += 1) {
      const dx = points[first].x - points[second].x;
      const dy = points[first].y - points[second].y;
      const distance = Math.hypot(dx, dy);
      if (distance > 116) continue;
      context.strokeStyle = `rgba(255,255,255,${((1 - distance / 116) * .12).toFixed(3)})`;
      context.beginPath();
      context.moveTo(points[first].x, points[first].y);
      context.lineTo(points[second].x, points[second].y);
      context.stroke();
    }
  }
  points.forEach((point, index) => {
    context.fillStyle = `rgba(255,255,255,${index % 5 === 0 ? .42 : .24})`;
    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fill();
  });
  coverParticleFrame = window.requestAnimationFrame(drawCoverParticles);
}

function scheduleCoverParticles() {
  window.cancelAnimationFrame(coverParticleFrame);
  coverParticleFrame = 0;
  if (!coverIsVisible || document.hidden || reduceMotion.matches) {
    coverParticleContext?.clearRect(0, 0, coverParticleWidth, coverParticleHeight);
    return;
  }
  if (!coverParticles.length) resetCoverParticles();
  coverParticleFrame = window.requestAnimationFrame(drawCoverParticles);
}

function canUseCoverMotion() {
  return finePointer.matches && !reduceMotion.matches && coverIsVisible && !document.hidden;
}

function showCoverSlide(index) {
  coverIndex = (index + coverSlides.length) % coverSlides.length;
  cover.dataset.coverIndex = String(coverIndex);
  coverSlides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === coverIndex));
  coverControls.forEach((control, controlIndex) => {
    const active = controlIndex === coverIndex;
    control.classList.toggle("is-active", active);
    if (active) control.setAttribute("aria-current", "true");
    else control.removeAttribute("aria-current");
  });
  const activeSlide = coverSlides[coverIndex];
  coverCount.textContent = `${String(coverIndex + 1).padStart(2, "0")} / ${String(coverSlides.length).padStart(2, "0")}`;
  coverTitle.textContent = activeSlide.dataset.title;
  coverMeta.textContent = activeSlide.dataset.meta;
}

function scheduleCoverRotation() {
  window.clearTimeout(coverTimer);
  if (!coverIsVisible || document.hidden || reduceMotion.matches) return;
  coverTimer = window.setTimeout(() => {
    showCoverSlide(coverIndex + 1);
    scheduleCoverRotation();
  }, 5600);
}

function updateCoverPointer(event) {
  if (!canUseCoverMotion()) return;
  const rect = cover.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
  const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
  cover.style.setProperty("--cover-shift-x", `${(x * 3).toFixed(2)}px`);
  cover.style.setProperty("--cover-shift-y", `${(y * 2).toFixed(2)}px`);
  cover.style.setProperty("--type-shift-x", `${(x * 7).toFixed(2)}px`);
  cover.style.setProperty("--type-shift-y", `${(y * 4).toFixed(2)}px`);
  cover.style.setProperty("--type-kicker-x", `${(x * -4).toFixed(2)}px`);
  cover.style.setProperty("--type-tilt", `${(x * -.45).toFixed(2)}deg`);
  coverParticlePointer.x = (x + 1) / 2;
  coverParticlePointer.y = (y + 1) / 2;
  coverParticlePointer.active = true;
}

function resetCoverPointer() {
  cover.style.setProperty("--cover-shift-x", "0px");
  cover.style.setProperty("--cover-shift-y", "0px");
  cover.style.setProperty("--type-shift-x", "0px");
  cover.style.setProperty("--type-shift-y", "0px");
  cover.style.setProperty("--type-kicker-x", "0px");
  cover.style.setProperty("--type-tilt", "0deg");
  coverParticlePointer.active = false;
}

function enterPortfolio() {
  const target = document.querySelector("#observations");
  animateScrollTo(() => sectionScrollTarget(target), 820);
}

cover.addEventListener("pointermove", updateCoverPointer, { passive: true });
cover.addEventListener("pointerleave", resetCoverPointer);
coverControls.forEach(control => control.addEventListener("click", () => {
  showCoverSlide(Number(control.dataset.coverControl));
  scheduleCoverRotation();
}));
coverEnter.addEventListener("click", enterPortfolio);
new IntersectionObserver(entries => {
  coverIsVisible = entries[0]?.isIntersecting ?? false;
  scheduleCoverRotation();
  scheduleCoverParticles();
}, { threshold:.05 }).observe(cover);
document.addEventListener("visibilitychange", () => {
  scheduleCoverRotation();
  scheduleCoverParticles();
});
reduceMotion.addEventListener?.("change", () => {
  scheduleCoverRotation();
  scheduleCoverParticles();
});
window.addEventListener("resize", () => {
  resetCoverParticles();
  scheduleCoverParticles();
}, { passive:true });
showCoverSlide(0);
scheduleCoverRotation();
resetCoverParticles();
scheduleCoverParticles();

const serviceIndex = document.querySelector("[data-service-index]");
const serviceItems = serviceIndex ? [...serviceIndex.querySelectorAll("[data-service-item]")] : [];
const serviceFocus = serviceIndex?.querySelector(".service-focus");

function selectService(item) {
  if (!item || item.classList.contains("is-active")) return;
  serviceItems.forEach(candidate => {
    const active = candidate === item;
    candidate.classList.toggle("is-active", active);
    candidate.querySelector(".service-trigger")?.setAttribute("aria-expanded", String(active));
  });
  if (!serviceFocus) return;
  const activeIndex = serviceItems.indexOf(item);
  const detail = item.querySelector(".service-item-detail");
  serviceFocus.querySelector("[data-service-number]").textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(serviceItems.length).padStart(2, "0")}`;
  serviceFocus.querySelector("[data-service-title]").textContent = item.querySelector(".service-trigger strong").textContent;
  serviceFocus.querySelector("[data-service-description]").textContent = detail.querySelector("p").textContent;
  serviceFocus.querySelector("[data-service-label]").textContent = detail.querySelector("small").textContent;
  const scope = serviceFocus.querySelector("[data-service-scope]");
  scope.replaceChildren(...[...detail.querySelectorAll("li")].map(source => {
    const entry = document.createElement("li");
    entry.textContent = source.textContent;
    return entry;
  }));
  serviceFocus.classList.remove("is-changing");
  window.requestAnimationFrame(() => serviceFocus.classList.add("is-changing"));
}

serviceItems.forEach(item => {
  const trigger = item.querySelector(".service-trigger");
  trigger.addEventListener("click", () => selectService(item));
  trigger.addEventListener("pointerenter", () => {
    if (finePointer.matches && !compactLayout.matches) selectService(item);
  });
});

function updateCoverScroll() {
  const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * .72)));
  cover.style.setProperty("--cover-progress", progress.toFixed(3));
}

function updateHeaderTheme() {
  const coverBottom = cover.offsetTop + cover.offsetHeight;
  siteHeader.classList.toggle("is-on-cover", window.scrollY < coverBottom - siteHeader.offsetHeight);
}

const sceneIds = ["observations", "work", "behind-scenes", "profile", "capabilities", "contact"];
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
    updateHeaderTheme();
    updateActiveNav();
    updateSceneReveal();
    scrollFrame = 0;
  });
}
window.addEventListener("scroll", scheduleScrollWork, { passive: true });
window.addEventListener("resize", scheduleScrollWork, { passive: true });

function sectionScrollTarget(target) {
  const absoluteTop = target.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, absoluteTop - document.querySelector(".site-header").offsetHeight);
}

function animateScrollTo(targetY, customDuration = 660) {
  const resolveTarget = typeof targetY === "function" ? targetY : () => targetY;
  const startY = window.scrollY;
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : customDuration;
  if (!duration) { window.scrollTo(0, resolveTarget()); return; }
  const startedAt = performance.now();
  const tick = now => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    window.scrollTo(0, startY + (resolveTarget() - startY) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll('.site-header a[href^="#"]').forEach(link => link.addEventListener("click", event => {
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  history.replaceState(null, "", link.getAttribute("href"));
  animateScrollTo(() => sectionScrollTarget(target));
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
  galleryResizeTimer = window.setTimeout(() => {
    document.querySelectorAll("[data-gallery-grid]").forEach(layoutArchiveGrid);
    layoutBehindScenes();
  }, 140);
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
layoutBehindScenes();
document.fonts?.ready.then(layoutBehindScenes);
