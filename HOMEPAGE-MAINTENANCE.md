# Homepage maintenance

This repository contains the deployed Next.js static export rather than the original application source.

- Edit `homepage-content.json` to update the phone number, news, and featured papers.
- Run `node scripts/update-homepage.cjs` to update both server HTML and the React Server Component payloads. This keeps initial loads and client-side navigation consistent without changing compiled framework code or the sidebar.
- Styles are scoped to `#about.home-content` in `assets/homepage.css`.
- The full publication directory, navigation, sidebar, theme switcher, and other pages retain their existing implementation.

## Visitor map

The map is currently an explicitly labelled preview; it does not collect visits or invent visitor counts. Register `https://hamings1.github.io/` with ClustrMaps and put the unique `d` parameter from the generated embed code into `clustrMapsSiteId` in `assets/visitor-map.js`. The widget runs inside `visitors.html`, isolated from React hydration and page navigation. Confirm the provider displays visits for the correct website after enabling it.

The neutral world outline uses public-domain Natural Earth data distributed in `world-atlas@2/land-110m.json`.

## Paper figures

- SpikingLM: Figure 1, page 3, https://proceedings.mlr.press/v306/liang26ae.html
- AGMM: Figure 3, page 4, https://arxiv.org/abs/2502.14344
- BSO: Figure 2, page 4, https://arxiv.org/abs/2511.12502

Figures are extracted from the owner's papers. Each thumbnail links to its source publication; code buttons point to the owner's corresponding repositories.
