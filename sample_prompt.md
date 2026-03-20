Use the /video-to-website and  /frontend-design 

make sure frames in webp 
do NOT use build folder

Build a one-page landing page using only:
- vanilla HTML
- vanilla CSS
- vanilla JavaScript
- GSAP with ScrollTrigger

Do not use React, Next.js, Tailwind, or any framework.

Important:
- The main animation must use the image frames in `/frames`
- Before implementing the scroll logic, inspect the frames in `/frames` and identify the major visual phases of the animation
- Treat the sequence as having three major moments:
  1. basketball player phase
  2. businessman in suit phase
  3. credit card phase
- Use those detected phases to time the callouts
- Do not use normal video playback for the main scroll sequence

Animation requirements:
- Render the frame sequence with a single HTML canvas
- Preload the frames
- Map scroll progress to the frame index with GSAP ScrollTrigger
- Do not swap img tags for every frame
- Use canvas rendering for smooth performance
- The animation should feel smooth and cinematic, not like a normal video scrub
- White background throughout
- Dark readable text
- Smooth Apple-style scroll storytelling

Build the page with these sections:
1. Hero
2. Pinned scroll animation section
3. Card highlights section
4. Final CTA section

Hero section content:
- Eyebrow: "Premium credit experiences"
- Headline: "A smarter way to experience credit."
- Supporting paragraph: "Discover a modern portfolio of credit cards built around flexibility, rewards, and confidence for everyday life."
- Scroll hint: "Scroll to explore"

Pinned scroll animation section requirements:
- Use the frames in `/frames` as the source for the animation
- Draw the frames into a canvas
- Pin this section during scroll
- Sync frame progression to scroll progress using GSAP ScrollTrigger
- Keep callouts positioned so they do not cover the main visual

Callout content:
1. Basketball player moment
   - label: "Charles Barkley"
   - paragraph: "Charles Barkley is one of basketball’s most recognizable figures, known for his Hall of Fame career, larger-than-life presence, and decades of influence across sports and media."

2. Businessman moment
   - label: "Richard Fairbank"
   - paragraph: "Richard Fairbank is the longtime founder and leader of Capital One, widely recognized for helping shape the company into one of the most prominent names in consumer finance."

3. Credit card moment
   - label: "Trusted by millions"
   - paragraph: "Capital One credit cards are recognized for combining everyday usability with strong rewards, flexible options, and a trusted brand experience designed for modern consumers."

Callout behavior:
- opacity: 0 -> 1 -> 0
- slight translateY or translateX movement
- smooth premium easing
- subtle floating feel
- readable white/near-white cards with dark text
- rounded corners and soft border/shadow

Timing requirement:
- Determine the approximate frame ranges for the basketball-player phase, businessman-in-suit phase, and credit-card phase by inspecting the frames in `/frames`
- Use those detected ranges to trigger the callouts

Card highlights section:
Create a clean premium section after the pinned animation highlighting these four cards:
- SavorOne — "Made for everyday spending with rewarding value across the moments that matter most."
- Platinum — "A straightforward credit option designed for simplicity, confidence, and dependable everyday use."
- Venture — "Built for people who value travel, flexibility, and rewards that go further."
- QuickSilver — "Simple unlimited cash back with a clean, easy-to-understand experience."

Final CTA section:
- Headline: "Choose a card built for how you live."
- Body: "From everyday simplicity to travel-focused rewards, explore credit options designed to support your goals with confidence."
- Primary CTA: "Explore cards"
- Secondary CTA: "Learn more"

Create production-ready files:
- index.html
- styles.css
- script.js

Implementation notes:
- Use semantic HTML
- Add clear comments in script.js for:
  - frame preloading
  - ScrollTrigger setup
  - detected frame ranges
  - callout timing
- Keep motion smooth and refined
- Use transforms and opacity where possible
- Make the final result feel polished, launch-ready, and high-end

theme better using https://www.apple.com/airpods-pro/ as inspiration