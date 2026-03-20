# Product Spec: Capital One-Style Scroll Landing Page

## Objective

Build a modern, professional one-page product landing page that delivers a premium, scroll-driven credit card commercial experience centered around the local video file `commercial.mp4`.

Use both skills:
- `/video-to-website`
- `/frontend-design`

## Product Vision

Create a polished, minimal, high-end fintech marketing page where the storytelling is driven by smooth GSAP scroll choreography and clean typography on a white canvas. The entire page should feel fluid and continuous, with the white website background visually blending into the white background in `commercial.mp4`.

## Core Experience Goals

- Deliver a smooth, premium scroll narrative around `commercial.mp4`
- Keep a white background across the entire page
- Ensure white page surfaces and video background feel visually unified
- Maintain high text readability (dark text, strong contrast, clean spacing)
- Present the brand as trustworthy, modern, and premium
- Use tasteful, professional motion (avoid gimmicky animation)

## Technical Requirements

- Use GSAP with ScrollTrigger
- Build a strong scroll-driven hero using `commercial.mp4`
- Pin sections where appropriate
- Sync text callouts to scroll progress
- Ensure transitions between sections are smooth and intentional
- Optimize for performance and scroll smoothness
- Implement responsive, mobile-friendly behavior
- Keep code clean, maintainable, and production quality
- Prefer modern React/Next.js if the project supports it
- Use Tailwind if available

## Page Information Architecture

### 1) Hero / Scroll Experience

- Full-width premium intro section
- `commercial.mp4` as primary visual centerpiece
- White background (no dark theme transitions)
- Video should feel embedded in layout, not boxed
- Include subtle premium headline + supporting copy
- As scroll begins, video area becomes the main storytelling device

### 2) Scroll-Driven Product Story

- Drive sequence with GSAP ScrollTrigger
- Animate video progression and surrounding content together
- Add timed text callouts that appear/disappear at defined scroll points
- Callouts explain why Capital One is strong and card advantages
- Keep copy concise, premium, and easy to scan
- Use elegant fade/translate/opacity transitions
- Ensure text never fights visually with the video

### 3) Credit Card Benefits (Late Scroll)

Near the end of scroll, transition into card-focused highlights for:
- SavorOne
- Platinum
- Venture
- QuickSilver

Requirements:
- Show card frames/cards appearing near end of sequence
- Pair each card with concise premium callout copy
- Maintain clean white presentation and high legibility
- Make transition from video story to card highlights feel seamless and intentional

### 4) Final CTA

- Clean premium closing section
- Strong headline
- Short supporting copy
- Professional CTA button(s)
- Maintain the same white, fluid visual language

## Visual Design Direction

- White background across the entire page
- Minimal, premium, modern fintech aesthetic
- Strong typographic hierarchy
- Subtle gray separators/spacing (no heavy borders)
- Elegant composition and spacing rhythm
- Dark text for clarity and readability
- No visual clutter
- Final result should feel launch-ready for a major brand

## Motion Direction

- Smooth GSAP ScrollTrigger choreography throughout
- Pinned scroll sections where useful
- Text callouts appear/disappear gracefully
- Motion should feel intentional and expensive
- Avoid over-animation
- Prioritize readability, pacing, and smoothness

## Content Direction

Use polished marketing copy that emphasizes:
- trust
- flexibility
- rewards
- simplicity
- everyday value
- premium experience

For card copy:
- Keep concise and premium
- Focus on practical user benefits
- Avoid dense paragraphs

## Implementation Notes

- Assume `commercial.mp4` is available locally and must be used
- Build full one-page implementation (not partial)
- Deliver complete launch-ready layout and behavior
- Include all required components, styling, and GSAP logic
- Add comments around primary animation orchestration for maintainability
- Ensure white page background and video background blend visually

## Quality Bar / Acceptance Criteria

- Scroll experience is smooth on desktop and acceptable on mobile
- Hero-to-story transitions feel continuous
- Callouts are timed and readable throughout
- Card-specific highlights for all four required cards are present
- Final CTA is clear, premium, and conversion-oriented
- White-on-white blending between page and video feels intentional
- Code structure is clean, maintainable, and production quality

## Deliverables

- Complete one-page implementation using the existing project stack
- Structured sections matching this spec
- GSAP + ScrollTrigger animation logic
- Responsive behavior and performance-conscious implementation
- Final polished UI and production-ready code organization
