gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 146;
/** Pixels of scroll mapped to the frame strip (must match frameIndexFromProgress). */
const SCRUB_HEIGHT = FRAME_COUNT * 64;
/** Extra pinned distance after scrub to hold on final frame. */
const HOLD_HEIGHT_PX = 220;
const FRAME_PATH = (i) => `frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

/** Total pinned distance for the sequence: scrub + viewport hold. */
function getSequenceTotalHeight() {
	return SCRUB_HEIGHT + HOLD_HEIGHT_PX;
}

const canvas = document.getElementById("sequence-canvas");
if (!canvas) throw new Error("Missing #sequence-canvas element.");
const ctx = canvas.getContext("2d");

const calloutEls = {
	barkley: document.querySelector('[data-callout="barkley"]'),
	fairbank: document.querySelector('[data-callout="fairbank"]'),
	trusted: document.querySelector('[data-callout="trusted"]'),
};
const loaderEl = document.querySelector("[data-frame-loader]");
const loaderProgressEl = document.querySelector("[data-loader-progress]");
const loaderBarEl = document.querySelector("[data-loader-bar]");

const state = { frame: 0 };
const images = [];

/** Coalesce bursty scroll updates into one canvas draw per animation frame. */
let renderQueued = false;
let pendingFrame = 0;

function requestDraw(frame) {
	pendingFrame = frame;
	if (renderQueued) return;

	renderQueued = true;
	requestAnimationFrame(() => {
		renderQueued = false;
		drawFrame(pendingFrame);
	});
}

function setLoaderProgress(loaded, total) {
	if (!loaderProgressEl || !loaderBarEl || total < 1) return;
	const percent = Math.round((loaded / total) * 100);
	loaderProgressEl.textContent = `${percent}%`;
	loaderBarEl.style.width = `${percent}%`;
}

function showLoader() {
	if (!loaderEl) return;
	document.body.classList.add("is-loading");
	loaderEl.classList.remove("is-hidden");
	setLoaderProgress(0, FRAME_COUNT);
}

function hideLoader() {
	if (!loaderEl) {
		document.body.classList.remove("is-loading");
		return;
	}
	loaderEl.classList.add("is-hidden");
	document.body.classList.remove("is-loading");
	loaderEl.addEventListener("transitionend", () => loaderEl.remove(), { once: true });
}

function getCanvasFillColor() {
	const shell = document.querySelector(".sequence-shell");
	if (shell) {
		const v = getComputedStyle(shell).getPropertyValue("--canvas-fill").trim();
		if (v) return v;
	}
	return "#f1f0ec";
}

// detected frame ranges (from visual inspection of extracted frames)
// basketball player phase: frame_0001 -> frame_0012
// businessman in suit phase: frame_0013 -> frame_0044
// credit card phase: frame_0075 -> frame_0146
const PHASES = {
	barkley: { start: 0, end: 11 },
	fairbank: { start: 12, end: 43 },
	trusted: { start: 74, end: 145 },
};

/* ── canvas rendering ── */

function drawFrame(index) {
	const img = images[index];
	const scale = ctx.getTransform().a || 1;
	const cw = canvas.width / scale;
	const ch = canvas.height / scale;
	if (cw < 2 || ch < 2) return;

	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = getCanvasFillColor();
	ctx.fillRect(0, 0, cw, ch);

	if (!img || !img.complete || img.naturalWidth < 1) return;
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

	const dx = Math.round((cw - dw) / 2);
	const dy = Math.round((ch - dh) / 2);
	ctx.globalCompositeOperation = "multiply";
	ctx.drawImage(img, dx, dy, Math.round(dw), Math.round(dh));
	ctx.globalCompositeOperation = "source-over";
}

function resizeCanvas(retryCount = 0) {
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const w = canvas.clientWidth;
	const h = canvas.clientHeight;

	if (w < 2 || h < 2) {
		if (retryCount < 5) {
			requestAnimationFrame(() => resizeCanvas(retryCount + 1));
		}
		return;
	}

	canvas.width = Math.max(1, Math.round(w * dpr));
	canvas.height = Math.max(1, Math.round(h * dpr));
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	drawFrame(state.frame);
}

/* ── callout timing ── */

function rangeVisibility(frame, start, end) {
	if (frame < start || frame > end) return 0;
	const span = end - start + 1;
	const fade = Math.max(2, Math.round(span * 0.18));
	return Math.min(
		gsap.utils.clamp(0, 1, (frame - start) / fade),
		gsap.utils.clamp(0, 1, (end - frame) / fade),
		1,
	);
}

function setCallout(el, intensity, dir, frame) {
	if (!el) return;
	const t = gsap.parseEase("power2.out")(intensity);
	const drift = Math.sin(frame * 0.05) * 2;
	gsap.set(el, {
		opacity: t,
		y: (1 - t) * 18 + drift,
		x: (1 - t) * dir * 8,
		pointerEvents: t > 0.02 ? "auto" : "none",
	});
}

function updateCallouts(f) {
	setCallout(
		calloutEls.barkley,
		rangeVisibility(f, PHASES.barkley.start, PHASES.barkley.end),
		-1,
		f,
	);
	setCallout(
		calloutEls.fairbank,
		rangeVisibility(f, PHASES.fairbank.start, PHASES.fairbank.end),
		1,
		f,
	);
	setCallout(
		calloutEls.trusted,
		rangeVisibility(f, PHASES.trusted.start, PHASES.trusted.end),
		-1,
		f,
	);
}

/* ── frame preloading ── */

function preloadFrames(onProgress) {
	images.length = 0;
	let loaded = 0;
	for (let i = 0; i < FRAME_COUNT; i++) {
		const img = new Image();
		img.decoding = "async";
		img.src = FRAME_PATH(i);
		images.push(img);
	}
	return Promise.all(
		images.map(
			(img) =>
				new Promise((r) => {
					const settle = () => {
						loaded += 1;
						if (typeof onProgress === "function") {
							onProgress(loaded, FRAME_COUNT);
						}
						r();
					};
					if (img.complete) {
						settle();
						return;
					}
					img.onload = settle;
					img.onerror = settle;
				}),
		),
	).then(() => drawFrame(0));
}

/* ── navbar ── */

function setupNavbar() {
	const nav = document.querySelector(".navbar");
	if (!nav) return;
	ScrollTrigger.create({
		start: "top -60",
		end: 99999,
		onUpdate: (self) => nav.classList.toggle("scrolled", self.progress > 0),
	});
}

/* ── hero entrance ── */

const HERO_TYPED_STRINGS = [
	"Simplified.",
	"Rewarding.",
	"Effortless.",
	"Insightful.",
	"Secure.",
	"Flexible.",
	"Streamlined.",
	"Empowering.",
];

function initHeroSceneMotion() {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const deck = document.querySelector(".hero-card-deck");
	if (!deck || typeof gsap === "undefined") return;

	gsap.to(deck, {
		y: "+=14",
		rotationZ: 1.2,
		duration: 3.2,
		repeat: -1,
		yoyo: true,
		ease: "sine.inOut",
	});
	gsap.to(".hero-orb--a", {
		scale: 1.08,
		opacity: 0.62,
		duration: 5.5,
		repeat: -1,
		yoyo: true,
		ease: "sine.inOut",
	});
	gsap.to(".hero-shard--one", {
		y: "+=-10",
		x: "+=6",
		duration: 4,
		repeat: -1,
		yoyo: true,
		ease: "sine.inOut",
	});
	gsap.to(".hero-shard--two", {
		y: "+=12",
		duration: 3.6,
		repeat: -1,
		yoyo: true,
		ease: "sine.inOut",
		delay: 0.35,
	});
}

function initHeroTyped() {
	const el = document.getElementById("hero-typed");
	if (!el) return;

	const fallback = el.dataset.typedFallback || HERO_TYPED_STRINGS[0] || "";
	if (typeof Typed === "undefined") {
		el.textContent = fallback;
		return;
	}

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		el.textContent = fallback;
		return;
	}

	el.textContent = "";
	new Typed("#hero-typed", {
		strings: HERO_TYPED_STRINGS,
		typeSpeed: 95,
		backSpeed: 55,
		backDelay: 2800,
		startDelay: 400,
		smartBackspace: true,
		loop: true,
		showCursor: true,
		cursorChar: "|",
	});
}

function animateHero() {
	const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
	tl.from(".hero-scene", { opacity: 0, duration: 1.05 }, 0)
		.from(".hero-brand", { y: 20, opacity: 0, duration: 0.7 }, 0.12)
		.from(".hero-tagline", { y: 16, opacity: 0, duration: 0.55 }, "-=0.55")
		.from(".hero-title", { y: 40, opacity: 0, duration: 0.9 }, "-=0.45")
		.call(initHeroTyped, [], ">+0.06")
		.from(".hero-body", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
		.from(".scroll-cue", { opacity: 0, duration: 0.6 }, "-=0.3")
		.from(".scroll-cue-line", { scaleY: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.4")
		.call(initHeroSceneMotion, [], ">-0.2");
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
						el.textContent =
							target % 1 === 0 ? Math.round(obj.val) : obj.val.toFixed(1);
					},
				});
			},
		});
	});
}

/* ── ScrollTrigger setup ── */

function setupScrollStory() {
	gsap.set(".sequence-section", { height: getSequenceTotalHeight() });

	function frameIndexFromProgress(progress) {
		const sequenceTotalHeight = getSequenceTotalHeight();
		const animProgress = gsap.utils.clamp(
			0,
			1,
			(progress * sequenceTotalHeight) / SCRUB_HEIGHT,
		);
		return Math.min(
			FRAME_COUNT - 1,
			Math.round(animProgress * (FRAME_COUNT - 1)),
		);
	}

	function syncSequenceToProgress(progress, forceRedraw = false) {
		const next = frameIndexFromProgress(progress);
		if (!forceRedraw && next === state.frame) return;

		state.frame = next;
		requestDraw(next);
		updateCallouts(next);
	}

	ScrollTrigger.create({
		id: "sequence-canvas-scrub",
		trigger: ".sequence-section",
		start: "top top",
		end: () => `+=${getSequenceTotalHeight()}`,
		pin: ".sequence-pin",
		pinSpacing: false,
		anticipatePin: 1,
		invalidateOnRefresh: true,
		fastScrollEnd: true,
		onUpdate: (self) => {
			syncSequenceToProgress(self.progress);
		},
		onRefresh: (self) => {
			syncSequenceToProgress(self.progress, true);
		},
		onEnter: (self) => {
			syncSequenceToProgress(self.progress, true);
		},
		onEnterBack: (self) => {
			syncSequenceToProgress(self.progress, true);
		},
		onLeave: (self) => {
			syncSequenceToProgress(self.progress, true);
		},
		onLeaveBack: (self) => {
			syncSequenceToProgress(self.progress, true);
		},
	});

	if ("onscrollend" in window) {
		window.addEventListener(
			"scrollend",
			() => {
				const st = ScrollTrigger.getById("sequence-canvas-scrub");
				if (st) syncSequenceToProgress(st.progress, true);
			},
			{ passive: true },
		);
	}

	gsap.from(".story-intro .section-eyebrow", {
		y: 20,
		opacity: 0,
		duration: 0.7,
		ease: "power2.out",
		scrollTrigger: { trigger: ".story-intro", start: "top 80%" },
	});

	gsap.from(".story-intro h2", {
		y: 32,
		opacity: 0,
		duration: 0.85,
		ease: "power3.out",
		scrollTrigger: { trigger: ".story-intro", start: "top 74%" },
	});

	gsap.to(".marquee-text", {
		xPercent: -18,
		ease: "none",
		scrollTrigger: {
			trigger: ".stats-band",
			start: "top bottom",
			end: "bottom top",
			scrub: true,
		},
	});

	const cardsScrollTrigger = {
		trigger: ".cards-grid",
		start: "top 80%",
		toggleActions: "play none none none",
		once: true,
	};

	const cardsMM = gsap.matchMedia();
	cardsMM.add("(min-width: 821px)", () => {
		gsap.from(".card-item", {
			x: -60,
			opacity: 0,
			duration: 0.7,
			ease: "power3.out",
			stagger: 0.15,
			clearProps: "transform",
			scrollTrigger: cardsScrollTrigger,
		});
	});

	gsap.from(".cta-section .section-eyebrow", {
		y: 16,
		opacity: 0,
		duration: 0.6,
		ease: "power2.out",
		scrollTrigger: { trigger: ".cta-section", start: "top 78%" },
	});

	gsap.from(".cta-section h2", {
		y: 32,
		opacity: 0,
		duration: 0.85,
		ease: "power3.out",
		scrollTrigger: { trigger: ".cta-section", start: "top 74%" },
	});

	gsap.from(".cta-section > .section-inner > p", {
		y: 20,
		opacity: 0,
		duration: 0.7,
		ease: "power2.out",
		scrollTrigger: { trigger: ".cta-section", start: "top 68%" },
	});

	gsap.from(".cta-actions", {
		y: 18,
		opacity: 0,
		duration: 0.6,
		ease: "power2.out",
		scrollTrigger: { trigger: ".cta-section", start: "top 62%" },
	});
}

/* ── init ── */

function init() {
	showLoader();

	preloadFrames(setLoaderProgress).then(() => {
		updateCallouts(0);
		resizeCanvas();
		animateHero();
		hideLoader();
		setupNavbar();
		setupScrollStory();
		animateStats();
		ScrollTrigger.refresh();

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				ScrollTrigger.refresh();
			});
		});
	});

	window.addEventListener(
		"load",
		() => {
			ScrollTrigger.refresh();
		},
		{ once: true },
	);

	window.addEventListener("pageshow", (event) => {
		if (event.persisted) ScrollTrigger.refresh();
	});

	window.addEventListener("resize", () => {
		gsap.set(".sequence-section", { height: getSequenceTotalHeight() });
		ScrollTrigger.refresh();
		resizeCanvas();
	});
}

init();