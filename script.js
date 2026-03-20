gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 146;
const FRAME_PATH = (i) =>
  `frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

const canvas = document.getElementById("sequence-canvas");
if (!canvas) throw new Error("Missing #sequence-canvas element.");
const ctx = canvas.getContext("2d");

const calloutEls = {
  barkley: document.querySelector('[data-callout="barkley"]'),
  fairbank: document.querySelector('[data-callout="fairbank"]'),
  trusted: document.querySelector('[data-callout="trusted"]')
};

const state = { frame: 0 };
const images = [];

// detected frame ranges (from visual inspection of extracted frames)
// basketball player phase: frame_0001 -> frame_0012
// businessman in suit phase: frame_0013 -> frame_0044
// credit card phase: frame_0075 -> frame_0146
const PHASES = {
  barkley: { start: 0, end: 11 },
  fairbank: { start: 12, end: 43 },
  trusted: { start: 74, end: 145 }
};

/* ── canvas rendering ── */

function drawFrame(index) {
  const img = images[index];
  if (!img || !img.complete) return;

  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  const imgR = img.naturalWidth / img.naturalHeight;
  const canR = cw / ch;

  let dw, dh;
  if (imgR > canR) {
    dh = ch;
    dw = dh * imgR;
  } else {
    dw = cw;
    dh = dw / imgR;
  }

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(Math.round(state.frame));
}

/* ── callout timing ── */

function rangeVisibility(frame, start, end) {
  if (frame < start || frame > end) return 0;
  const span = end - start + 1;
  const fade = Math.max(2, Math.round(span * 0.18));
  return Math.min(
    gsap.utils.clamp(0, 1, (frame - start) / fade),
    gsap.utils.clamp(0, 1, (end - frame) / fade),
    1
  );
}

function setCallout(el, intensity, dir) {
  if (!el) return;
  const t = gsap.parseEase("power2.out")(intensity);
  const drift = Math.sin(state.frame * 0.07) * 3;
  gsap.set(el, {
    opacity: t,
    y: (1 - t) * 18 + drift,
    x: (1 - t) * dir * 8,
    pointerEvents: t > 0.02 ? "auto" : "none"
  });
}

function updateCallouts(f) {
  setCallout(calloutEls.barkley, rangeVisibility(f, PHASES.barkley.start, PHASES.barkley.end), -1);
  setCallout(calloutEls.fairbank, rangeVisibility(f, PHASES.fairbank.start, PHASES.fairbank.end), 1);
  setCallout(calloutEls.trusted, rangeVisibility(f, PHASES.trusted.start, PHASES.trusted.end), -1);
}

/* ── frame preloading ── */

function preloadFrames() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);
    img.decoding = "async";
    images.push(img);
  }
  return Promise.all(
    images.map(
      (img) =>
        new Promise((r) => {
          img.onload = r;
          img.onerror = r;
        })
    )
  ).then(() => drawFrame(0));
}

/* ── navbar ── */

function setupNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;
  ScrollTrigger.create({
    start: "top -60",
    end: 99999,
    onUpdate: (self) => nav.classList.toggle("scrolled", self.progress > 0)
  });
}

/* ── hero entrance ── */

function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.7 })
    .from(".hero h1", { y: 40, opacity: 0, duration: 0.9 }, "-=0.45")
    .from(".hero-body", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
    .from(".scroll-cue", { opacity: 0, duration: 0.6 }, "-=0.3")
    .from(".scroll-cue-line", { scaleY: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.4");
}

/* ── stat count-up ── */

function animateStats() {
  const counters = document.querySelectorAll("[data-count]");
  counters.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = target % 1 === 0 ? Math.round(obj.val) : obj.val.toFixed(1);
          }
        });
      }
    });
  });
}

/* ── ScrollTrigger setup ── */

function setupScrollStory() {
  const scrubHeight = FRAME_COUNT * 36;

  ScrollTrigger.create({
    trigger: ".sequence-section",
    start: "top top",
    end: `+=${scrubHeight}`,
    pin: ".sequence-pin",
    pinSpacing: true,
    scrub: 0.4,
    anticipatePin: 1,
    onUpdate: (self) => {
      const next = Math.min(
        FRAME_COUNT - 1,
        Math.round(self.progress * (FRAME_COUNT - 1))
      );
      if (next === Math.round(state.frame)) return;
      state.frame = next;
      drawFrame(next);
      updateCallouts(next);
    }
  });

  gsap.from(".story-intro .section-eyebrow", {
    y: 20, opacity: 0, duration: 0.7, ease: "power2.out",
    scrollTrigger: { trigger: ".story-intro", start: "top 80%" }
  });

  gsap.from(".story-intro h2", {
    y: 32, opacity: 0, duration: 0.85, ease: "power3.out",
    scrollTrigger: { trigger: ".story-intro", start: "top 74%" }
  });

  gsap.from(".card-item", {
    y: 30, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.1,
    scrollTrigger: { trigger: ".cards-grid", start: "top 80%" }
  });

  gsap.to(".marquee-text", {
    xPercent: -18, ease: "none",
    scrollTrigger: {
      trigger: ".stats-band",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.from(".cta-section .section-eyebrow", {
    y: 16, opacity: 0, duration: 0.6, ease: "power2.out",
    scrollTrigger: { trigger: ".cta-section", start: "top 78%" }
  });

  gsap.from(".cta-section h2", {
    y: 32, opacity: 0, duration: 0.85, ease: "power3.out",
    scrollTrigger: { trigger: ".cta-section", start: "top 74%" }
  });

  gsap.from(".cta-section > .section-inner > p", {
    y: 20, opacity: 0, duration: 0.7, ease: "power2.out",
    scrollTrigger: { trigger: ".cta-section", start: "top 68%" }
  });

  gsap.from(".cta-actions", {
    y: 18, opacity: 0, duration: 0.6, ease: "power2.out",
    scrollTrigger: { trigger: ".cta-section", start: "top 62%" }
  });
}

/* ── init ── */

function init() {
  updateCallouts(0);
  resizeCanvas();
  animateHero();

  preloadFrames().then(() => {
    setupNavbar();
    setupScrollStory();
    animateStats();
    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    ScrollTrigger.refresh();
  });
}

init();
