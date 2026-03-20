---
name: video-to-website
description: Converts a source video into a premium scroll-driven website using frame rendering, GSAP ScrollTrigger choreography, and strong typographic direction. Use when the user asks to build an animated website from video footage.
---

# Video to Website

Turn a video file into a high-end, scroll-driven website with layered animation choreography and production-ready frontend code.

## Input

Expected user input:
- Video file path (`.mp4`, `.mov`, etc.)
- Optional brand/theme direction
- Optional section copy and timing preferences
- Optional color and typography preferences

If missing, ask concise clarifying questions or apply strong creative defaults.

## Premium Checklist (Non-Negotiable)

1. Lenis smooth scrolling
2. Four or more animation types across sections
3. Staggered text reveal order: label -> heading -> body -> CTA
4. No generic glass-card UI for scroll narrative sections
5. Directional variety between adjacent sections
6. Dark overlay treatment for stats moments
7. At least one oversized horizontal marquee
8. Numeric counters animate up from zero
9. Large typography scales for hero and section titles
10. Final CTA can persist with `data-persist="true"`
11. Generous scroll length for pacing (for example `800vh+` for six sections)
12. Side-zone content layout (`align-left`/`align-right`) for most sections
13. Hero reveal transition to canvas (for example circle wipe)
14. Frame progression speed tuned so key motion completes early enough to feel responsive

## Workflow

### 1) Analyze the Source Video

Run:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate,nb_frames -of csv=p=0 "<VIDEO_PATH>"
```

Determine width, height, duration, frame rate, and total frames.

Choose extraction strategy:
- Short videos (<10s): near-original fps, cap around 300 frames
- Medium (10-30s): roughly 10-15 fps
- Long (30s+): roughly 5-10 fps

Keep aspect ratio and cap output width around 1920 when needed.

### 2) Extract Frames

```bash
mkdir -p frames
ffmpeg -i "<VIDEO_PATH>" -vf "fps=<CALCULATED_FPS>,scale=<WIDTH>:-1" -c:v libwebp -quality 80 "frames/frame_%04d.webp"
```

Then verify frame count:

```bash
ls frames/ | wc -l
```

### 3) Scaffold the Project

Prefer simple static structure:

```text
project-root/
  index.html
  css/style.css
  js/app.js
  frames/frame_0001.webp ...
```

Default stack: vanilla HTML/CSS/JS with CDN libraries.

### 4) Build `index.html`

Required structure order:
1. Loader (`#loader`, progress UI)
2. Fixed header/nav
3. Standalone hero section (`100vh`)
4. Fixed canvas wrapper with `canvas#canvas`
5. Fixed dark overlay element
6. One or more marquee wrappers
7. Long scroll container with timed content sections
8. Stats section using `.stat-number[data-value][data-decimals]`
9. Final CTA section (optionally persistent)

Example section attributes:
- `data-enter`, `data-leave` as normalized scroll ranges
- `data-animation` for entrance style
- `data-persist="true"` for persistent sections

CDN order at end of body:

```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="js/app.js"></script>
```

### 5) Build `css/style.css`

Apply a distinctive design system (coordinate with `frontend-design` skill when available).

Technical baseline:

```css
:root {
  --bg-light: #f5f3f0;
  --bg-dark: #111111;
  --text-on-light: #1a1a1a;
  --text-on-dark: #f0ede8;
}

.align-left { padding-left: 5vw; padding-right: 55vw; }
.align-right { padding-left: 55vw; padding-right: 5vw; }
.align-left .section-inner,
.align-right .section-inner { max-width: 40vw; }
```

Implementation notes:
- Hero-first layout (`100vh`) before full-canvas reveal
- Absolute-position sections inside the long scroll container
- Mobile fallback (<768px): simplify alignment and reduce scroll height
- Maintain strong text contrast

### 6) Build `js/app.js`

#### 6a) Lenis + ScrollTrigger integration (required)

```js
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

#### 6b) Frame loading strategy

- Two-phase load: first ~10 frames immediately, remaining in background
- Show progress during load
- Hide loader after all required frames are ready

#### 6c) Canvas draw mode

Use padded cover behavior with configurable `IMAGE_SCALE` (commonly `0.82-0.90`), device-pixel-ratio scaling, and optional background color sampling for border blending.

#### 6d) Frame-to-scroll binding

Use one `ScrollTrigger` to map progress to frame index with configurable acceleration (for example `FRAME_SPEED` near `1.8-2.2`).

#### 6e) Section animation system

Each section reads `data-animation` and runs a distinct entrance timeline.

Recommended types:
- `fade-up`
- `slide-left`
- `slide-right`
- `scale-up`
- `rotate-in`
- `stagger-up`
- `clip-reveal`

Persistent sections should not reverse after leave range when `data-persist="true"` is set.

#### 6f) Counter animations

Animate `.stat-number` from 0 to `data-value`, respecting decimal precision.

#### 6g) Horizontal marquee

Drive large text x-motion with a scrubbed `ScrollTrigger` timeline; fade in/out by scroll range when needed.

#### 6h) Dark overlay timing

Blend overlay opacity around target section ranges with soft fade-in/fade-out bands.

#### 6i) Hero-to-canvas transition

Use a transition such as `clip-path: circle()` to reveal canvas as hero exits early scroll range.

### 7) Test End-to-End

Serve over HTTP (not `file://`), then verify:
1. Smooth scrolling behavior
2. Frame rendering follows scroll and feels responsive
3. Adjacent sections use different entrance types
4. Marquee motion and stat counters work
5. Overlay timing and hero transition feel intentional
6. Final CTA persistence behavior is correct

## Animation Types Quick Reference

| Type | Initial state | Target state | Typical duration |
|------|---------------|--------------|------------------|
| `fade-up` | `y:50, opacity:0` | `y:0, opacity:1` | `0.9s` |
| `slide-left` | `x:-80, opacity:0` | `x:0, opacity:1` | `0.9s` |
| `slide-right` | `x:80, opacity:0` | `x:0, opacity:1` | `0.9s` |
| `scale-up` | `scale:0.85, opacity:0` | `scale:1, opacity:1` | `1.0s` |
| `rotate-in` | `y:40, rotation:3, opacity:0` | `y:0, rotation:0, opacity:1` | `0.9s` |
| `stagger-up` | `y:60, opacity:0` | `y:0, opacity:1` | `0.8s` |
| `clip-reveal` | `clipPath: inset(100% 0 0 0)` | `clipPath: inset(0 0 0 0)` | `1.2s` |

## Anti-Patterns

- Repeating the same animation style in consecutive sections
- Dense centered card grids over the video/canvas narrative
- Too little scroll height for section count (rushed pacing)
- Frame speed that makes product motion feel sluggish
- Hero phase that ends too quickly (weak first impression)
- Pure contain/crop modes that cause obvious visual artifacts

## Troubleshooting

- Frames not rendering: verify HTTP serving and correct frame paths
- Choppy motion: reduce frame count, tune scrub settings, optimize image sizes
- Canvas blur: apply device-pixel-ratio scaling
- White flashes: preload critical frames before revealing canvas
- Lenis/GSAP mismatch: ensure Lenis scroll events update `ScrollTrigger`
- Counter issues: verify `data-value`/`data-decimals` attributes
- Mobile memory pressure: lower frame count and resolution

## Output Expectations

When using this skill, return:
1. The generated/updated file paths
2. The chosen visual direction in one short paragraph
3. Key implementation settings (frame count, frame speed, scroll height)
4. Validation checklist results for motion, pacing, and persistence rules
