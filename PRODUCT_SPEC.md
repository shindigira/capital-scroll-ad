
---

## 5. Page Structure

### Section 1: Intro / Hero

**Purpose**
- Introduce product experience
- Establish premium tone
- Lead into scroll animation

**Content**
- Eyebrow label
- Large headline
- Supporting paragraph
- Scroll indicator

**Copy**

Eyebrow  
Modern credit, reimagined  

Headline  
A premium card experience, built frame by frame.  

Body  
Explore a smooth, scroll-driven product story designed around clarity, trust, and everyday value.  

---

### Section 2: Pinned Frame Sequence Story

**Purpose**
- Core scroll-driven experience
- Canvas renders animation frames
- Callouts tied to frame ranges

**Behavior**
- Section is pinned
- Scroll controls frame rendering
- Callouts appear/disappear at defined ranges

**Structure**
- canvas container
- floating callout layer
- optional progress indicator

---

### Section 3: Card Variant Highlights

**Purpose**
- Transition from cinematic → product clarity

**Cards**
- SavorOne
- Platinum
- Venture
- QuickSilver

Must feel like continuation of scroll story (not abrupt).

---

### Section 4: Final CTA

**Purpose**
- Close with clarity and confidence
- Reinforce product value

---

## 6. Frame Sequence Design Logic

### Phase A: Chip Introduction
Frames: **1–30**

- abstract chip visible
- subtle pulse / motion
- centered on white background

Purpose:
Establish technology foundation

---

### Phase B: Morph Transition
Frames: **31–75**

- chip transforms into card
- rectangular form emerges
- smooth readable motion

Purpose:
Technology → product transition

---

### Phase C: Full Card Reveal
Frames: **76–110**

- full card visible
- upright orientation
- centered, front-facing

Purpose:
Hero product moment

---

### Phase D: Held Card Moment
Frames: **111–140**

- repeated or nearly identical frames
- minimal motion

Purpose:
Create stable pause for callouts

---

### Phase E: Finishing Motion
Frames: **141–160+**

- subtle settle or micro-motion
- no large movement

Purpose:
Smooth exit

---

## 7. ScrollTrigger Frame Mapping Strategy

### Key Principle

This is NOT video playback.

Instead:
- scroll position controls frame
- certain ranges are stretched for emphasis
- repeated frames create visual pause

---

### Scroll Allocation

#### Segment 1: Chip
Scroll: **0–20%**
Frames: **1–30**

#### Segment 2: Morph
Scroll: **20–55%**
Frames: **31–75**

#### Segment 3: Card Reveal
Scroll: **55–70%**
Frames: **76–110**

#### Segment 4: Held Card
Scroll: **70–90%**
Frames: **111–140**

#### Segment 5: Exit
Scroll: **90–100%**
Frames: **141–160**

---

### Desired Experience

- not linear playback
- not rushed
- cinematic pacing
- controlled progression
- intentional pauses

---

## 8. Callout Strategy

Callouts are tied to **frame ranges**, not time.

### Behavior

Each callout:
- starts hidden
- fades in
- floats slightly
- remains readable
- fades out

---

### Animation Style

- opacity: `0 → 1 → 0`
- translateY: `24px → 0 → -12px`
- optional scale: `0.98 → 1`
- smooth easing only

---

### Visual Style

- white panel
- subtle border or shadow
- rounded corners
- dark readable text
- premium spacing

---

## 9. Callouts Mapped to Frames

### Callout 1 — Chip Phase
Frames: **10–30**

Label  
Built from the core  

Copy  
Modern payment experiences begin with secure, intelligent infrastructure designed for speed, trust, and everyday reliability.  

Behavior  
- appears during chip visibility  
- exits before morph dominates  

---

### Callout 2 — Morph Phase
Frames: **45–75**

Label  
Designed to evolve  

Copy  
What begins as payment technology becomes a product shaped around real-world usability, flexibility, and intuitive everyday value.  

---

### Callout 3 — Card Phase
Frames: **105–140**

Label  
Made for everyday value  

Copy  
A premium credit experience should feel clear, modern, and rewarding — from the first glance to the final transaction.  

---

## 10. Implementation Notes (CRITICAL)

### Canvas Setup
- single `<canvas>` element
- fixed aspect ratio
- centered layout

### Frame Handling
- preload all frames before animation starts
- store in array
- reuse images (no re-fetching)

### ScrollTrigger
- pin the animation section
- use `scrub: true`
- map scroll progress → frame index

### Performance
- use `drawImage` only
- avoid layout thrashing
- avoid DOM updates during scroll
- keep animations GPU-friendly

---

## 11. Final Experience Goals

The result should feel:

- Apple-level smooth
- controlled and cinematic
- minimal and clean
- readable and professional
- intentional and premium
- production-ready