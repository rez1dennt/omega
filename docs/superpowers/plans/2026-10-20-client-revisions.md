# Client Revisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the approved client revisions in the static site and installable WordPress theme.

**Architecture:** Preserve buildless HTML/CSS/JS and the classic theme. Reuse the blade form and pitch guide through an explicit selection-dialog controller, avoiding duplicate IDs and divergent table data. Keep the ordinary request workflow and equipment context.

**Tech Stack:** Vanilla JavaScript, CSS, HTML, PHP, WordPress, Playwright, ImageMagick.

## Global Constraints

- Palette #1A1A1D, #4E4E50, #6F2232, #950740, #C3073F; large readable Golos typography.
- Preserve all source pitch values; no approximate recommendation or external МеталлРез navigation.
- No real form submissions or email; abort outbound submission requests in every browser check.
- Keep WordPress child-theme resolution, OmegaUI namespace, module import map, integration adapter and no-JS form protections.

### Task 1: Static website and assets

Files: dist/index.html, dist/privacy/index.html, dist/consent/index.html, dist/scripts/site.js, dist/scripts/pitch-guide.js, new selection controller if needed, dist/styles/*.css, dist/assets/images, docs/assets.md, scripts/client-revisions-check.mjs.

Interfaces: existing site:dialog-open and site:pitch-select events, collectOrderParameters, attachRequestWorkflow, shared scroll locks. A selection dialog owns the blade form and guide temporarily or renders uniquely prefixed reusable components; the standalone section remains usable after closing.

- [x] Add browser regression for two hero actions, blade fields and guide within selection, TPI transfer preserving comments, independent ordinary/equipment requests and scroll/focus restoration; run and record the initial expected failure.
- [x] Fetch and inspect the actual LENZ Steyr-35 photo; optimize photo and supplied IDEAL image to WebP without changing source files; record provenance.
- [x] Apply the exact approved copy from the spec, Ω glyph and preserved slash to all logos, new magnetic equipment card, production photo and two hero actions. Use #order for learn-more.
- [x] Implement reusable selection behavior and accessible table transfer; preserve inline order submission and ordinary request validation. Run new regression plus existing pitch, equipment, modal and mobile overlay checks, including 320px.

### Task 2: WordPress integration

Files: wordpress/omega-komplekt/template-parts, data, scripts, styles, assets; inc/assets.php; scripts/wordpress-theme-check.mjs.

Interfaces: namespaced window.OmegaUI helpers; wp script dependencies; bare omega-pitch-data module import; native template parts and escaped data.

- [x] Transfer changed static presentation/assets and selection controller into theme while preserving namespaced wrappers and public request adapter.
- [x] Update content data/map, header/footer brand helper, hero and equipment/production templates. Add no-JS disabled submit to any new forms.
- [x] Extend actual WordPress QA to exercise selection and magnetic product context at 320px and desktop; run native route, canonical, admin bar and child-theme checks.

### Task 3: Review, packaging and publication

Files: release docs, theme version/readme/screenshot, ZIP outputs.

- [x] Review requirements and quality independently, fix confirmed issues and rerun affected checks.
- [x] Run static release checks, PHP syntax checks and theme package validation; build theme ZIP then test that exact ZIP under actual WordPress.
- [ ] Refresh source/hosting archives. Package the exact verified source with Sites helper and publish preserving owner-private audience.
- [ ] Return the updated website and installable theme ZIP with a concise verification report.
