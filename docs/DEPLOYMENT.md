# Deployment status and incident record

Date: 2026-11-24.

The independent Vercel project `america-unfolded` exists. Automatic Git deployment is disabled in tracked configuration and the project has no Git connection. Automatic production-domain assignment is disabled. No custom domain was bought or registered.

## Environment-classification incident

The owner explicitly requested no production publication. These requests unexpectedly returned `target: production`:

1. Installed Vercel CLI 65.2.0, `deploy --target preview`: deployment `dpl_EtVZE63eJhsuSbBJ2aGvTZzZcMkT`.
2. REST request through the authenticated CLI with target omitted (documented preview default): `dpl_AzuCJtRrXwXNiJ4Rfyrad1cLPf3M`.
3. REST request through the CLI with explicit `target: staging`, after disabling automatic domain assignment: `dpl_7fh1tEz54s65GHyh5efbpZFfxsvH`.

All three were immediately removed after inspection. Each delete response returned `state: DELETED`. The first post-removal project inspection confirmed `hasDeployments: false`, `latestDeployments: []`, and `targets: {}`. The final post-removal state was checked again and is recorded below. These attempts were protected by Vercel Authentication, but their production classification still violated the requested publication boundary and is recorded here rather than described as a successful preview.

Non-mutating `--generate curl` diagnostics confirmed that both the native and JavaScript CLI runtimes generated the explicit staging request body. No credentials from those diagnostics were printed or saved. The underlying classification behavior remains unresolved; another deployment through this route should not be attempted blindly.

## Final delivery scope

The owner explicitly chose **local preview and PR only** after the environment-classification incident. Online deployment is deferred. No team-access grant or further deployment is required for this delivery, and no further deployment should be attempted without a new request.

Final API inspection confirmed `hasDeployments: false`, `latestDeployments: []`, `targets: {}`, `autoAssignCustomDomains: false`, and Git deployment mode `disabled`. A sanitized state snapshot is saved in `evidence/deployment-state.json`.

The website is available as a local preview at http://localhost:4173. All code, data, source/permission evidence, browser captures and tests are reviewable in the private repository PR. Main is unchanged from its initial scaffold.

## Subsequent production authorization — 2026-11-24

The owner later explicitly requested GitHub submission, Vercel production publication, usa.ybwdaisy.com, GA4/GSC, SEO and Site Pulse integration. This supersedes the earlier local-only publication boundary, while the PR remains available for review and is not automatically merged. The owner connected the existing independent Vercel project to the private GitHub repository. Automatic Git deployments remain disabled; the tested feature commit is released manually.

The usa subdomain was added to this project. Aliyun had 17 existing records; only usa CNAME → 58cdf4874bafc68d.vercel-dns-017.com was added, TTL 10 minutes. Public DNS returned that CNAME and Vercel reported configuredBy=CNAME and misconfigured=false. Apex, www, mail, verification and other products' records were preserved. No domain purchase or paid feature was used.

Production environment: SITE_ORIGIN=https://usa.ybwdaisy.com and GA_MEASUREMENT_ID=G-G1BH7EZXL9. Preview shares the canonical origin but excludes the measurement ID and emits noindex/robots Disallow. Runtime code independently checks the exact production origin, production configuration, consent and QA/automation state.

The earlier CLI connectivity failure was resolved with command-scoped use of the existing system proxy (127.0.0.1:7897) and the official JavaScript CLI runtime; no proxy configuration or routing was modified. See ANALYTICS.md for independently created Google resources and the public funnel contract. Final deployment ID, commit and HTTP acceptance are appended after publication.

## Published release

- Public URL: https://usa.ybwdaisy.com/.
- Independent project: prj_9TbpWYsiprpOdCHzt7PLMKzSWcVu / america-unfolded, ybwdaisy's projects (Hobby).
- Current production target: dpl_CrCY1uLPrcvKyuHL2DxRRv5GUqTN, READY, target production.
- Published application commit: 91fcf9f2f476fef366a0a93bfd570225106d035f on feat/historical-atlas. PR #2 remains open; main was not merged. Later evidence-only commits do not change the published application.
- GitHub checks for this release both succeeded. An initial runner failure was fixed by pinning Ubuntu 24.04 rather than using the incompatible Ubuntu 26.04 latest image.
- Production was first staged with --prod --skip-domain, its protected HTML/sitemap/manifest checked with authenticated vercel curl, then promoted explicitly. The project production target was re-read after promotion and matches this deployment and commit. The earlier staged deployment was never promoted.
- Public HTTPS returned the expected canonical, 1776 default and exact manifest source bytes. All 20 sitemap routes returned HTTP 200 with canonical/metadata/structured data, robots allowed production crawling, and an unknown route returned a real 404/noindex page.
- Nine browser smoke checks passed against the real production origin, covering map/detail, annual quiet-year playback, before/after, modern lines, clipboard/reload/history, complete story, inline phone panel and touch pan. iPhone WebKit is emulated, not physical Safari.
- GSC sitemap Success / 20 discovered pages / 0 videos. The platform confirms siteOwner and successful real read APIs. Indexing/ranking and production collection from actual consenting visitors are not claimed.
- Site Pulse remote manifest and all four actual funnel API queries passed; existing four sites and 16 funnels were preserved. No QA analytics requests were sent.

Recorded evidence is in docs/evidence/release.json, production-browser.json, production-seo.json and the Site Pulse summaries. Nothing was purchased; no new paid service, login, database, payment system or tracking beyond the explicitly requested optional GA4 was added. Automatic Git deployment remains disabled and the review PR remains open.
