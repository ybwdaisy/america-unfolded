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
