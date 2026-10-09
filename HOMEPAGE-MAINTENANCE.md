# Homepage maintenance

This repository contains the deployed Next.js static export rather than the original application source.

- Edit `homepage-content.json` to update the phone number, news, and featured papers.
- Run `node scripts/update-homepage.cjs` to update both server HTML and the React Server Component payloads. This keeps initial loads and client-side navigation consistent without changing compiled framework code or the sidebar.
- Styles are scoped to `#about.home-content` in `assets/homepage.css`. Homepage-only `:has(#about.home-content)` selectors widen its outer container to 1600px and give the sidebar a fixed desktop width, allowing the paper column to use the remaining space without changing other pages.
- The full publication directory, navigation, sidebar, theme switcher, and other pages retain their existing implementation.

## Visitor map

The map uses a Cloudflare Worker and D1 database. See `cloudflare/README.md` for deployment. The public Worker origin belongs in `assets/visitor-config.json`; no credentials are published. An empty endpoint displays an honest pending state. The map runs inside `visitors.html`, isolated from React hydration, and loads with the homepage so visits do not depend on scrolling to the footer.

Counts represent browser-tab visits, merged within a fixed 30-minute window, rather than unique people. Only country-level aggregate counts and the date counting first began are stored in D1. IPs are used transiently for daily rotating hashed rate-limit keys, never stored in the database. Basic bot filtering, client opt-out, and rate limiting reduce noise; this is not fraud-proof analytics. Failed requests and ad blockers can cause undercounting.

The neutral world outline uses public-domain Natural Earth data distributed in `world-atlas@2/land-110m.json`. Country centroid coordinates come from Google's DSPL canonical countries dataset: https://github.com/google/dspl/blob/master/samples/google/canonical/countries.csv . Points mark country centroids, not visitors' exact locations.

## Paper figures

- SpikingLM: Figure 1, page 3, https://proceedings.mlr.press/v306/liang26ae.html
- AGMM: Figure 3, page 4, https://arxiv.org/abs/2502.14344
- BSO: Figure 2, page 4, https://arxiv.org/abs/2511.12502

Figures are extracted from the owner's papers. Each thumbnail links to its source publication; code buttons point to the owner's corresponding repositories.
