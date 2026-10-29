# Homepage maintenance

This repository contains the deployed Next.js static export rather than the original application source.

- Edit `homepage-content.json` to update the phone number, news, featured papers, and reviewer services. The `services` data feeds both the homepage summary and the standalone Services page.
- Run `node scripts/update-homepage.cjs` to update both server HTML and the React Server Component payloads. This keeps initial loads and client-side navigation consistent without changing compiled framework code or the sidebar.
- Styles are scoped to `#about.home-content` in `assets/homepage.css`. Homepage-only `:has(#about.home-content)` selectors widen its outer container to 1600px and give the sidebar a fixed desktop width, allowing the paper column to use the remaining space without changing other pages.
- The navigation, sidebar and theme switcher retain their existing implementation. The publication directory is generated from the same paper data as the homepage, with progressive search, year and topic filters.

## Search and project pages

`node scripts/update-homepage.cjs` also runs `scripts/build-discovery.cjs`. It updates page titles, descriptions, canonical URLs and social metadata in both HTML and navigation payloads, then builds the sitemap, robots.txt, publication directory and three standalone project pages. Never patch the compiled framework bundles.

- `homepage-content.json`: SEO title/description, Google verification tag, paper topics, years and project URLs.
- `project-content.json`: project overview, methods, results, source URLs and verified citations. Keep numerical claims tied to the source paper and its evaluation setting.
- `publication-citations.json`: base BibTeX for the complete directory; project citations override corresponding entries. Author order is synchronized from the homepage data. Generated `.bib` files live in `papers/`.
- `assets/discovery.css` and `assets/discovery.js`: responsive project/directory styles, search and combined filters, reset and citation copy. All paper content and citations remain readable without JavaScript. Event delegation supports client navigation from every original site page without mutating content before hydration.
- `googleccd68ae944b7fdd5.html`: Google Search Console verification file supplied by the owner. Preserve this file and the verification meta tag.

After deployment, the owner must click Verify in Search Console and submit `https://hamings1.github.io/sitemap.xml`. Published verification evidence alone does not confirm that Google has verified the property or indexed its pages. No Search Console account credentials are stored in the repository.

Homepage News shows the latest five entries with an accessible native disclosure for earlier entries. Others is grouped by year. Oral/Spotlight are separate badges. The original left sidebar is preserved.

The homepage uses matching outline heading icons, pale-blue venue labels and gold distinction badges. Featured figures use a shared 2:1 canvas with consistent padding and `object-fit: contain`; the scientific diagrams are never cropped or recolored. Their captions link to the full project pages. Contact numbers remain telephone links, with a separate copy control for each number; clipboard failures select the visible number and announce manual-copy instructions. All homepage presentation rules stay scoped to `.home-content` to preserve the sidebar.

## Visitor map

The map uses a Cloudflare Worker and D1 database. See `cloudflare/README.md` for deployment. The public Worker origin belongs in `assets/visitor-config.json`; no credentials are published. An empty endpoint displays an honest pending state. The map runs inside `visitors.html`, isolated from React hydration, and loads with the homepage so visits do not depend on scrolling to the footer.

Counts represent browser-tab visits, merged within a fixed 30-minute window, rather than unique people. Only country-level aggregate counts and the date counting first began are stored in D1. IPs are used transiently for daily rotating hashed rate-limit keys, never stored in the database. Basic bot filtering, client opt-out, and rate limiting reduce noise; this is not fraud-proof analytics. Failed requests and ad blockers can cause undercounting.

The neutral world outline uses public-domain Natural Earth data distributed in `world-atlas@2/land-110m.json`. Country centroid coordinates come from Google's DSPL canonical countries dataset: https://github.com/google/dspl/blob/master/samples/google/canonical/countries.csv . Points mark country centroids, not visitors' exact locations.

## Paper figures

The `others` array contains the remaining papers, with verified publisher/arXiv links and the owner highlighted by exact name. Its nine entries plus the three featured papers cover the twelve records on the Publications page. News includes all authorship positions, grouped by conference and year; `paperIds` records the coverage behind each count. News dates use `YYYY-MM` acceptance-announcement months, with `dateSource` and `dateBasis` recording the evidence. ICML 2026 uses the coauthor's May announcement; the other entries use official conference author-notification dates. These are announcement months, not conference dates or claims about the owner's individual notification email. The final IJCAI proceedings supplies the author order for BESTformer.

Others supports an optional `code` URL, rendered beside Paper. Seven entries have public author repositories verified on October 28, 2026. No confirmed public code repository was found for Saccadic Attention or Activation-Aware Redistribution; omit their Code buttons until a verified URL is available. QP-SNN has implementation files but no README.

- SpikingLM: Figure 1, page 3, https://proceedings.mlr.press/v306/liang26ae.html
- AGMM: Figure 3, page 4, https://arxiv.org/abs/2502.14344
- BSO: Figure 2, page 4, https://arxiv.org/abs/2511.12502

Figures are extracted from the owner's papers. Each thumbnail links to its source publication; code buttons point to the owner's corresponding repositories.
