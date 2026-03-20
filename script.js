gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 193;
const CRITICAL_FRAMES = 14;
const FRAME_SPEED = 2.05;
const IMAGE_SCALE = 0.88;

const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
const loaderProgress = document.getElementById("loaderProgress");
const canvas = document.getElementById("storyCanvas");
const canvasMask = document.getElementById("canvasMask");
const canvasOverlay = document.getElementById("canvasOverlay");
const ctx = canvas.getContext("2d");

const frameImages = new Array(FRAME_COUNT);
let loadedCount = 0;
let currentFrame = 0;
let hasStarted = false;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function framePath(index) {
  return `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function updateLoadingUI() {
  const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
  loaderBar.style.width = `${percent}%`;
  loaderProgress.textContent = `${percent}%`;
}

function loadFrame(index) {
  if (frameImages[index]) {
    return Promise.resolve(frameImages[index]);
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.src = framePath(index);
    image.onload = () => {
      frameImages[index] = image;
      loadedCount += 1;
      updateLoadingUI();
      resolve(image);
    };
    image.onerror = () => {
      resolve(null);
    };
  });
}

function findNearestLoadedFrame(targetIndex) {
  if (frameImages[targetIndex]) {
    return frameImages[targetIndex];
  }

  for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
    const before = targetIndex - offset;
    const after = targetIndex + offset;

    if (before >= 0 && frameImages[before]) {
      return frameImages[before];
    }
    if (after < FRAME_COUNT && frameImages[after]) {
      return frameImages[after];
    }
  }

  return null;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawFrame(currentFrame);
}

function drawFrame(index) {
  const image = findNearestLoadedFrame(index);
  currentFrame = index;

  if (!image) return;

  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;
  const imageAspect = image.width / image.height;
  const canvasAspect = canvasWidth / canvasHeight;

  let drawWidth;
  let drawHeight;

  if (imageAspect > canvasAspect) {
    drawHeight = canvasHeight * IMAGE_SCALE;
    drawWidth = drawHeight * imageAspect;
  } else {
    drawWidth = canvasWidth * IMAGE_SCALE;
    drawHeight = drawWidth / imageAspect;
  }

  const x = (canvasWidth - drawWidth) * 0.5;
  const y = (canvasHeight - drawHeight) * 0.5;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#f7f8fa";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function hideLoader() {
  loader.classList.add("hidden");
}

function revealMask(progress) {
  const revealProgress = clamp((progress - 0.01) / 0.15, 0, 1);
  const radius = 14 + revealProgress * 170;
  canvasMask.style.clipPath = `circle(${radius}% at 50% 50%)`;
}

function updateOverlay(progress) {
  const fadeInStart = 0.56;
  const fadeInEnd = 0.66;
  const fadeOutStart = 0.82;
  const fadeOutEnd = 0.92;

  let opacity = 0;
  if (progress >= fadeInStart && progress <= fadeInEnd) {
    opacity = (progress - fadeInStart) / (fadeInEnd - fadeInStart);
  } else if (progress > fadeInEnd && progress < fadeOutStart) {
    opacity = 1;
  } else if (progress >= fadeOutStart && progress <= fadeOutEnd) {
    opacity = 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
  }

  canvasOverlay.style.opacity = `${opacity * 0.26}`;
}

function updateCallouts(progress) {
  const callouts = document.querySelectorAll(".callout");

  callouts.forEach((callout) => {
    const start = Number(callout.dataset.start);
    const end = Number(callout.dataset.end);
    const edge = 0.06;
    let alpha = 0;

    if (progress >= start && progress <= end) {
      const inAmount = clamp((progress - start) / edge, 0, 1);
      const outAmount = clamp((end - progress) / edge, 0, 1);
      alpha = Math.min(inAmount, outAmount, 1);
    }

    callout.style.opacity = String(alpha);
    callout.style.transform = `translateY(${(1 - alpha) * 26}px)`;
  });
}

function initPinnedStory() {
  /* Main pinned ScrollTrigger:
   * - Pins the storytelling stage.
   * - Maps scrubbed scroll progress to canvas frame index.
   * - Drives callout timing, hero-to-canvas reveal, and dark overlay moments.
   */
  ScrollTrigger.create({
    trigger: ".story-section",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.9,
    pin: ".story-stage",
    anticipatePin: 1,
    onUpdate: (self) => {
      const accelerated = clamp(self.progress * FRAME_SPEED, 0, 1);
      const frameIndex = Math.round(accelerated * (FRAME_COUNT - 1));
      drawFrame(frameIndex);
      revealMask(self.progress);
      updateOverlay(self.progress);
      updateCallouts(self.progress);
    }
  });
}

function sectionAnimationVars(type) {
  switch (type) {
    case "slide-right":
      return { x: 80, y: 0, opacity: 0 };
    case "slide-left":
      return { x: -80, y: 0, opacity: 0 };
    case "scale-up":
      return { scale: 0.9, y: 10, opacity: 0 };
    case "rotate-in":
      return { y: 40, rotation: 3, opacity: 0 };
    case "clip-reveal":
      return { clipPath: "inset(0 0 100% 0)", opacity: 1 };
    case "stagger-up":
      return { y: 65, opacity: 0 };
    case "fade-up":
    default:
      return { y: 50, opacity: 0 };
  }
}

function animateSections() {
  document.querySelectorAll("[data-animation]").forEach((section) => {
    const type = section.dataset.animation || "fade-up";
    const persist = section.dataset.persist === "true";
    const fromVars = sectionAnimationVars(type);

    const label = section.querySelector(".eyebrow");
    const heading = section.querySelector(".section-title, h2, h3");
    const body = section.querySelector(".section-copy, p");
    const cta = section.querySelector(".btn");
    const cards = [...section.querySelectorAll(".feature-card")];

    const tl = gsap.timeline({
      defaults: { duration: 0.9, ease: "power3.out" },
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        toggleActions: persist ? "play none none none" : "play none none reverse"
      }
    });

    if (label) {
      tl.from(label, { ...fromVars, duration: 0.7 }, 0);
    }
    if (heading) {
      tl.from(heading, { ...fromVars, duration: 0.95 }, 0.1);
    }
    if (body) {
      tl.from(body, { ...fromVars, duration: 0.95 }, 0.2);
    }
    if (cta) {
      tl.from(cta, { ...fromVars, duration: 0.75 }, 0.3);
    }
    if (cards.length) {
      tl.from(cards, { ...fromVars, stagger: 0.1, duration: 0.8 }, 0.28);
    }
  });
}

function animateCounters() {
  document.querySelectorAll(".stat-number").forEach((node) => {
    const targetValue = Number(node.dataset.value || "0");
    const decimals = Number(node.dataset.decimals || "0");
    const value = { current: 0 };

    gsap.to(value, {
      current: targetValue,
      duration: 1.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: node,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      onUpdate: () => {
        node.textContent = value.current.toFixed(decimals);
      }
    });
  });
}

function animateMarquee() {
  gsap.to("#marqueeTrack", {
    xPercent: -28,
    ease: "none",
    scrollTrigger: {
      trigger: ".marquee-wrap",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
}

function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

async function preloadCriticalFrames() {
  const criticalTasks = [];

  for (let index = 0; index < CRITICAL_FRAMES; index += 1) {
    criticalTasks.push(loadFrame(index));
  }

  await Promise.all(criticalTasks);
}

function loadRemainingFrames() {
  const queue = [];
  for (let index = CRITICAL_FRAMES; index < FRAME_COUNT; index += 1) {
    queue.push(index);
  }

  const next = () => {
    const current = queue.shift();
    if (current === undefined) return;

    loadFrame(current).finally(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(next, { timeout: 180 });
      } else {
        window.setTimeout(next, 12);
      }
    });
  };

  next();
}

function initExperience() {
  if (hasStarted) return;
  hasStarted = true;

  resizeCanvas();
  drawFrame(0);
  hideLoader();
  initLenis();
  initPinnedStory();
  animateSections();
  animateCounters();
  animateMarquee();
  ScrollTrigger.refresh();

  window.addEventListener("resize", () => {
    resizeCanvas();
    ScrollTrigger.refresh();
  });
}

(async function start() {
  try {
    await preloadCriticalFrames();
    initExperience();
    loadRemainingFrames();
  } catch {
    loaderProgress.textContent = "Unable to load frames";
  }
})();
