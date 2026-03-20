---
name: frontend-design
description: Builds distinctive, production-grade frontend interfaces with strong visual direction and non-generic aesthetics. Use when the user asks to design or implement web components, pages, UI systems, or animated websites.
---

# Frontend Design

Create polished frontend implementations that feel intentionally designed, not template-generated.

## When To Use

Apply this skill when the user asks for:
- A new component, page, or full frontend experience
- A visual redesign or aesthetic upgrade
- Interactive or animated web UI
- A scroll-driven landing page or brand site

## Core Objective

Produce real, working frontend code (HTML/CSS/JS or framework-based) that is:
- Production-grade and functional
- Visually memorable and cohesive
- Aligned to a clear artistic direction
- Refined in typography, spacing, color, and motion

## Workflow

### 1) Set the Aesthetic Direction Before Coding

Determine:
- **Purpose**: what the interface does and who it serves
- **Tone**: choose one strong direction (minimal, editorial, retro-futuristic, luxury, brutalist, playful, organic, etc.)
- **Constraints**: framework, performance, accessibility, platform limits
- **Differentiator**: one memorable signature element

Do not start implementation until the direction is explicit.

### 2) Implement With Intentional Visual Systems

Design and code with:
- **Typography**: expressive font pairing, strong hierarchy, deliberate scale
- **Color system**: cohesive palette via CSS variables with clear contrast strategy
- **Motion**: meaningful transitions and entrance choreography, not random effects
- **Layout**: varied composition, strong rhythm, and purposeful asymmetry when suitable
- **Surface detail**: texture, gradients, shadows, overlays, and depth only when they support the concept

### 3) Avoid Generic "AI" Output

Do not default to:
- Overused font and palette combinations
- Repetitive SaaS-style card grids with no identity
- Safe but forgettable component arrangements
- Decorative effects without conceptual purpose

Every design should feel specific to context, audience, and brand tone.

### 4) Match Complexity to Direction

- Maximalist concepts require richer interaction, layering, and choreography.
- Minimal concepts require tighter spacing, stronger type discipline, and restraint.
- Keep quality high in both directions; intensity is optional, intentionality is required.

## Scroll-Driven Site Rules

Use this section when building scroll-heavy narrative websites (especially when paired with video-driven storytelling).

### Typography-Led Structure

- Hero headings: `6rem+`, tight line-height (`0.9-1.0`), heavy weight
- Section headings: `3rem+`
- Marquee text: large viewport-scaled type (`10-15vw`)
- Labels: small uppercase with letterspacing
- Let typographic hierarchy define structure instead of container-heavy UI

### Minimal Containers

- Avoid glassmorphism cards and boxed text blocks in scroll narratives
- Prefer text directly on the section background
- Maintain readability with contrast, weight, shadows, and clean frame selection

### Section Color Zoning

- Shift background mood between sections (for example: light -> dark -> accent)
- Define zones with CSS custom properties
- Keep text colors paired to each zone for accessibility
- If using GSAP, drive section transitions with timeline logic

### Layout Rotation

Use at least three layout modes across the page:
1. Centered hero/CTA
2. Left-aligned copy with right visual
3. Right-aligned copy with left visual
4. Full-width marquee/stat rows
5. Split content + supporting media

Do not repeat the same layout pattern in consecutive sections.

### Animation Choreography

- Give each section a distinct entrance style
- Stagger child elements (`~0.08-0.12s`)
- Prefer sequence: label -> heading -> body -> CTA
- Include at least one pinned section with internal animation
- Include at least one horizontally moving oversized text moment

### Stats and Numeric Moments

- Display key figures at `4rem+`
- Animate count-up behavior (for example via GSAP)
- Use smaller suffix styling for units (`%`, `x`, `M`)
- Keep labels compact and secondary

## Implementation Guardrails

- Ship working code, not mock-only fragments
- Maintain accessibility (contrast, semantics, keyboard support where relevant)
- Respect performance budgets (avoid unnecessary heavy effects)
- Keep code organized and maintainable
- Ensure aesthetic choices are consistent across components

## Output Expectations

When responding with implementation:
1. State the chosen design direction in one concise paragraph.
2. Build or update the requested files directly.
3. Include brief notes on typography, color, layout, and motion decisions.
4. Mention any trade-offs made for performance or accessibility.
