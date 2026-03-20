gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 193;
const CRITICAL_FRAMES = 14;
const IMAGE_SCALE = 0.88;
const STORY_SCROLL_LENGTH = 6; // Multiplier of viewport height.

const canvas = document.getElementById("story-canvas");
const context = canvas.getContext("2d");
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loader-fill");
const loaderProgress = document.getElementById("loader-progress");
const callouts = Array.from(document.querySelectorAll(".callout"));

const frames = new Array(FRAME_COUNT).fill(null);
const frameState = { frame: 0 };

function framePath(index) {
  return `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function updateLoader(loaded, total) {
  const progress = Math.round((loaded / total) * 100);
  loaderFill.style.width = `${progress}%`;
  loaderProgress.textContent = `${progress}%`;
}

function loadFrame(index) {
  return new Promise((resolve) => {
    if (frames[index]) {
      resolve(frames[index]);
      return;
    }

    const img = new Image();
    img.src = framePath(index);

    img.onload = () => {
      frames[index] = img;
      resolve(img);
    };

    img.onerror = () => resolve(null);
  });
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width, height } = canvas.getBoundingClientRect();

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawFrame(Math.round(frameState.frame));
}

function drawFrame(index) {
  const img = frames[index];
  if (!img || !canvas.width || !canvas.height) return;

  const { width: cw, height: ch } = canvas.getBoundingClientRect();
  const widthRatio = cw / img.width;
  const heightRatio = ch / img.height;

  // Padded cover keeps cinematic framing while avoiding edge artifacts.
  const scale = Math.max(widthRatio, heightRatio) * IMAGE_SCALE;
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const drawX = (cw - drawWidth) * 0.5;
  const drawY = (ch - drawHeight) * 0.5;

  context.clearRect(0, 0, cw, ch);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, cw, ch);
  context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function updateCallouts(progress) {
  callouts.forEach((callout) => {
    const start = parseFloat(callout.dataset.start || "0");
    const end = parseFloat(callout.dataset.end || "1");
    const isActive = progress >= start && progress <= end;
    callout.classList.toggle("is-active", isActive);
  });
}

function setupLenis() {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function setupStoryScroll() {
  // Main pinned ScrollTrigger that maps scroll progress to frame playback.
  gsap.to(frameState, {
    frame: FRAME_COUNT - 1,
    ease: "none",
    onUpdate: () => drawFrame(Math.round(frameState.frame)),
    scrollTrigger: {
      trigger: "#story",
      start: "top top",
      end: `+=${window.innerHeight * STORY_SCROLL_LENGTH}`,
      pin: ".story-stage",
      scrub: 0.35,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Callout system: each panel is activated by scroll window without opacity animation.
        updateCallouts(progress);
      }
    }
  });

  // Hero to canvas reveal transition.
  gsap.to(".story-stage", {
    clipPath: "circle(140% at 50% 50%)",
    ease: "none",
    scrollTrigger: {
      trigger: "#story",
      start: "top 85%",
      end: "top 20%",
      scrub: true
    }
  });
}

function getSectionAnimationVars(animationType) {
  switch (animationType) {
    case "slide-left":
      return { x: -90, y: 20, autoAlpha: 0 };
    case "slide-right":
      return { x: 90, y: 20, autoAlpha: 0 };
    case "scale-up":
      return { scale: 0.9, y: 20, autoAlpha: 0 };
    case "rotate-in":
      return { rotation: 3, y: 35, autoAlpha: 0 };
    default:
      return { y: 50, autoAlpha: 0 };
  }
}

function setupSectionAnimations() {
  const sections = Array.from(document.querySelectorAll("[data-section]"));

  sections.forEach((section) => {
    const animationType = section.dataset.animation || "fade-up";
    const fromVars = getSectionAnimationVars(animationType);
    const label = section.querySelector(".section-label");
    const heading = section.querySelector(".section-heading");
    const body = section.querySelector(".section-body");
    const cta = section.querySelector(".section-cta");
    const cards = section.querySelectorAll(".feature-card, .stat");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: section.dataset.persist === "true"
      }
    });

    if (label) tl.from(label, { ...fromVars, duration: 0.55 });
    if (heading) tl.from(heading, { ...fromVars, duration: 0.7 }, "-=0.24");
    if (body) tl.from(body, { ...fromVars, duration: 0.65 }, "-=0.3");
    if (cards.length) tl.from(cards, { y: 28, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, "-=0.3");
    if (cta) tl.from(cta, { y: 22, autoAlpha: 0, duration: 0.5 }, "-=0.25");
  });
}

function setupMarquee() {
  gsap.to(".marquee-track", {
    xPercent: -28,
    ease: "none",
    scrollTrigger: {
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.8
    }
  });
}

function setupCounters() {
  const counters = Array.from(document.querySelectorAll(".stat-number"));

  counters.forEach((counter) => {
    const value = parseFloat(counter.dataset.value || "0");
    const decimals = parseInt(counter.dataset.decimals || "0", 10);
    const proxy = { current: 0 };

    gsap.to(proxy, {
      current: value,
      duration: 1.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top 84%",
        toggleActions: "play none none none"
      },
      onUpdate: () => {
        counter.textContent = proxy.current.toFixed(decimals);
      }
    });
  });
}

async function preloadFrames() {
  let loaded = 0;

  for (let i = 0; i < CRITICAL_FRAMES; i += 1) {
    await loadFrame(i);
    loaded += 1;
    updateLoader(loaded, FRAME_COUNT);
  }

  for (let i = CRITICAL_FRAMES; i < FRAME_COUNT; i += 1) {
    loadFrame(i).then(() => {
      loaded += 1;
      updateLoader(loaded, FRAME_COUNT);
    });
  }
}

async function init() {
  setupLenis();
  await preloadFrames();
  resizeCanvas();
  drawFrame(0);

  setupStoryScroll();
  setupSectionAnimations();
  setupMarquee();
  setupCounters();

  loader.classList.add("is-hidden");
  ScrollTrigger.refresh();
}

window.addEventListener("resize", () => {
  resizeCanvas();
  ScrollTrigger.refresh();
});

init();
