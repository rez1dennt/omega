# WordPress Theme Implementation Plan

> **For agentic workers:** Use subagent-driven-development for independent QA infrastructure and final review; execute theme migration in this session.

**Goal:** Deliver an installable WordPress theme preserving the current site, ready for a later content/forms plugin.

**Architecture:** Classic PHP templates split by responsibility; original CSS/JS/media retained with WordPress URLs and hooks. Separate content defaults, presentation and plugin integration; no database writes on activation or mail delivery in the theme.

**Tech Stack:** WordPress 6.6+, PHP 8.1+, vanilla JS, local CSS/fonts/media, Node packaging, Playwright QA, isolated actual WordPress fixture.

## Global Constraints

- Keep `dist/` unchanged; primary contact +7 (917) 206-21-00, palette №4, Golos Text.
- Do not send forms, leads or emails. Never package SMTP credentials or the PHP mail implementation.
- No ACF, content administration UI, CPT or production plugin yet.
- Source folder `wordpress/omega-komplekt/`; installable ZIP has one `omega-komplekt/` root.
- Use `wp_head`, `wp_footer`, `wp_body_open`, native enqueue functions, escaped dynamic values and child-compatible file resolution.

## Task 1 — Real WordPress fixture and failing contract

- [x] Prepare QA-only WordPress and local SQLite runtime under ignored `qa/`; block outgoing mail/updates/cron. Do not add plugins to the shipped theme.
- [x] Add `scripts/wordpress-theme-check.mjs`: activate and render a genuine WordPress theme, assert branding, asset URLs, page/404/document routing, ES module initialization, responsive layout and overlays. Empty endpoint must produce no API traffic; no final valid submissions.
- [x] Run the meaningful initial contract before the theme exists and retain the expected missing-theme failure.

## Task 2 — Classic theme and migration

- [x] Add `wordpress/omega-komplekt/style.css`, `functions.php`, `theme.json`, `header.php`, `footer.php`, `front-page.php`, page/single/index/archive/search/404 templates.
- [x] `inc/setup.php` registers standard supports; `inc/assets.php` registers the preserved cascade and dependency order; `inc/helpers.php` centralizes asset/anchor/document URL contracts.
- [x] `inc/content.php` contains shared company defaults and section content access with `omega_theme_content` filter. `inc/documents.php` implements bounded document fallback and published-page preference. `inc/integrations.php` exports public transport settings only.
- [x] Extract current sections into `template-parts/sections/`, sprite/navigation/footer/overlays into shared parts, legal content into document parts. Replace literal local URLs with helper calls and escape dynamic values.
- [x] Copy public assets only, retain licenses. Adapt request-client to plugin transport and an empty-endpoint guard; keep form validation, mask, menu, dialogs and TPI behavior.
- [x] Add `styles/wordpress.css` with generic page content and admin-toolbar offsets using existing tokens.
- [x] Run PHP syntax and the focused contract, then real browser matrix; fix shared causes of any failures.

## Task 3 — Package and handoff

- [x] Add `scripts/build-wordpress-theme.mjs` producing `../omega-komplekt-wordpress-theme.zip`; reject sensitive/debug/runtime files and verify ZIP shape. Add package commands without changing existing build behavior.
- [x] Produce `screenshot.jpg` from the actual rendered theme; document installation, template map, supported versions, legal fallback, content/form integration contract and remaining server/plugin work.
- [x] Independent read-only review of architecture/security/package; fix important findings and rerun affected checks.
- [x] Verify the exact final ZIP in WordPress; run `git diff --check`, preserve static-site hashes, and return the installable archive plus the short installation steps.
