gsap.registerPlugin(ScrollTrigger);

const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loader-progress");
const loaderText = document.getElementById("loader-text");
const storyShell = document.querySelector(".story-shell");
const storyPin = document.querySelector(".story-pin");
const storyOverlay = document.querySelector(".story-overlay");
const callouts = Array.from(document.querySelectorAll(".callout"));
const cards = Array.from(document.querySelectorAll(".card"));
const statNumbers = Array.from(document.querySelectorAll(".stat-number"));
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FRAME_COUNT = 146;
const CRITICAL_FRAMES = 12;
const IMAGE_SCALE = 0.88;
const frames = new Array(FRAME_COUNT);

let countersStarted = false;
let loadedFrames = 0;
let currentFrame = -1;
let started = false;

function setLoader(progress, message) {
  loaderProgress.style.width = `${progress}%`;
  loaderText.textContent = message;
}

function hideLoader() {
  loader.classList.add("is-hidden");
  setTimeout(() => loader.remove(), 360);
}

// Smooth scrolling setup: Lenis + ScrollTrigger sync
function initSmoothScrolling() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function getFramePath(index) {
  return `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function sizeCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = window.innerWidth;
  const headerHeight = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-h")
  );
  const height = Math.max(100, window.innerHeight - headerHeight);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawFrame(index) {
  if (index === currentFrame) return;
  const img = frames[index];
  if (!img) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const scale =
    Math.max(width / img.naturalWidth, height / img.naturalHeight) * IMAGE_SCALE;
  const drawWidth = img.naturalWidth * scale;
  const drawHeight = img.naturalHeight * scale;
  const x = (width - drawWidth) * 0.5;
  const y = (height - drawHeight) * 0.5;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, x, y, drawWidth, drawHeight);

  currentFrame = index;
}

function preloadFrame(index) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = getFramePath(index);
    img.onload = () => {
      frames[index] = img;
      loadedFrames += 1;
      setLoader(
        Math.round((loadedFrames / FRAME_COUNT) * 100),
        `Loading frames ${loadedFrames}/${FRAME_COUNT}`
      );
      resolve();
    };
    img.onerror = () => {
      loadedFrames += 1;
      setLoader(
        Math.round((loadedFrames / FRAME_COUNT) * 100),
        `Loading frames ${loadedFrames}/${FRAME_COUNT}`
      );
      resolve();
    };
  });
}

async function loadFrames() {
  setLoader(5, "Analyzing commercial.mp4");

  const firstBatch = Array.from({ length: CRITICAL_FRAMES }, (_, i) =>
    preloadFrame(i)
  );
  await Promise.all(firstBatch);

  const remaining = [];
  for (let i = CRITICAL_FRAMES; i < FRAME_COUNT; i += 1) {
    remaining.push(preloadFrame(i));
  }
  await Promise.all(remaining);
}

// Hero + marquee intro motion
function initIntroMotion() {
  gsap.fromTo(
    ".hero > *",
    { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: 0.72, stagger: 0.1, ease: "power3.out" }
  );

  gsap.to(".marquee-track", {
    xPercent: -35,
    ease: "none",
    scrollTrigger: {
      trigger: ".marquee-shell",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
}

// Callout animation helpers (fade + translate in/out)
function setCalloutState(callout, active) {
  if (active) {
    if (callout.dataset.active === "true") return;
    callout.dataset.active = "true";
    callout.style.visibility = "visible";
    gsap.fromTo(
      callout,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.56, ease: "power3.out" }
    );
    return;
  }

  if (callout.dataset.active === "true") {
    callout.dataset.active = "false";
    gsap.to(callout, {
      opacity: 0,
      y: -12,
      duration: 0.34,
      ease: "power2.in",
      onComplete: () => {
        if (callout.dataset.active !== "true") callout.style.visibility = "hidden";
      }
    });
  }
}

// Story timeline mapping: scroll -> frame progression
function updateFrameFromScroll(progress) {
  const tuned =
    progress < 0.75
      ? Math.pow(progress / 0.75, 1.08) * 0.84
      : 0.84 + ((progress - 0.75) / 0.25) * 0.155;

  const safe = Math.max(0, Math.min(0.995, tuned));
  const frameIndex = Math.max(
    0,
    Math.min(FRAME_COUNT - 1, Math.floor(safe * (FRAME_COUNT - 1)))
  );
  drawFrame(frameIndex);
}

// Late-stage card reveal animation
function updateCards(progress) {
  cards.forEach((card) => {
    const start = Number(card.dataset.cardStart || 1);
    const local = (progress - start) / 0.065;
    const clamped = Math.max(0, Math.min(1, local));
    const y = (1 - clamped) * 24;
    const scale = 0.94 + clamped * 0.06;
    card.style.opacity = String(clamped);
    card.style.transform = `translateY(${y}px) scale(${scale})`;
  });
}

// Mid-story overlay for readability against video details
function updateOverlay(progress) {
  const fadeInStart = 0.56;
  const peak = 0.64;
  const fadeOutEnd = 0.74;
  let opacity = 0;

  if (progress > fadeInStart && progress <= peak) {
    opacity = ((progress - fadeInStart) / (peak - fadeInStart)) * 0.42;
  } else if (progress > peak && progress <= fadeOutEnd) {
    opacity = ((fadeOutEnd - progress) / (fadeOutEnd - peak)) * 0.42;
  }

  storyOverlay.style.opacity = opacity.toFixed(3);
}

// Main pinned story section with scrubbed ScrollTrigger
function initStoryScroll() {
  gsap.to(storyPin, {
    clipPath: "circle(170% at 50% 42%)",
    ease: "none",
    scrollTrigger: {
      trigger: storyShell,
      start: "top top",
      end: "top+=15% top",
      scrub: true
    }
  });

  ScrollTrigger.create({
    trigger: storyShell,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: ({ progress }) => {
      updateFrameFromScroll(progress);
      updateCards(progress);
      updateOverlay(progress);

      callouts.forEach((callout) => {
        const start = Number(callout.dataset.start || 0);
        const end = Number(callout.dataset.end || 0);
        setCalloutState(callout, progress >= start && progress <= end);
      });
    }
  });
}

// Stat counters (count-up)
function playCounters() {
  if (countersStarted) return;
  countersStarted = true;

  statNumbers.forEach((item) => {
    const target = Number(item.dataset.value || 0);
    const decimals = Number(item.dataset.decimals || 0);
    const state = { value: 0 };

    gsap.to(state, {
      value: target,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        item.textContent = state.value.toFixed(decimals);
      }
    });
  });
}

function initStatsTrigger() {
  ScrollTrigger.create({
    trigger: ".stats-zone",
    start: "top 78%",
    once: true,
    onEnter: playCounters
  });
}

function startExperience() {
  if (started) return;
  started = true;
  setLoader(100, "Ready");
  hideLoader();
  sizeCanvas();
  drawFrame(0);
  initSmoothScrolling();
  initIntroMotion();
  initStoryScroll();
  initStatsTrigger();
}

window.addEventListener("resize", () => {
  sizeCanvas();
  drawFrame(currentFrame < 0 ? 0 : currentFrame);
});

loadFrames()
  .then(() => startExperience())
  .catch(() => {
    setLoader(100, "Frame pipeline failed");
    hideLoader();
  });
