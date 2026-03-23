# Design system — Card (credit / fintech)

## Theme

- **Default: light** — Page background `#f4f3ef` / `#f1f0ec` aligned with **frame letterbox** (`--canvas-fill: #f1f0ec`) for scroll-driven WebP frames.
- **Sequence block** — Same light palette (`--frames-void` = `--bg-page`); white **shell** around the canvas; light frosted **callouts** (dark text).

## Tokens (see `styles.css` `:root`)

- Light text: `--black` (#0f172a), muted `--gray-1` / `--gray-2`.
- Accents: `--accent-gold-bright`, primary actions `--blue`.
- Frames-only: `--frames-*` variables; canvas fill synced via `--canvas-fill` on `.sequence-shell` and `getCanvasFillColor()` in `script.js`.

## Stack

Vanilla HTML / CSS / GSAP.
