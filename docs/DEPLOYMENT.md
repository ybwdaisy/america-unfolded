# Deployment status and incident record

Date: 2026-11-24.

The independent Vercel project `america-unfolded` exists. Automatic Git deployment is disabled in tracked configuration and the project has no Git connection. Automatic production-domain assignment is disabled. No custom domain was bought or registered.

## Environment-classification incident

The owner explicitly requested no production publication. These requests unexpectedly returned `target: production`:

1. Installed Vercel CLI 65.2.0, `deploy --target preview`: deployment `dpl_EtVZE63eJhsuSbBJ2aGvTZzZcMkT`.
2. REST request through the authenticated CLI with target omitted (documented preview default): `dpl_AzuCJtRrXwXNiJ4Rfyrad1cLPf3M`.
3. REST request through the CLI with explicit `target: staging`, after disabling automatic domain assignment: `dpl_7fh1tEz54s65GHyh5efbpZFfxsvH`.

All three were immediately removed after inspection. Each delete response returned `state: DELETED`. The first post-removal project inspection confirmed `hasDeployments: false`, `latestDeployments: []`, and `targets: {}`. Final project state must be checked again before handoff. These attempts were protected by Vercel Authentication, but their production classification still violated the requested publication boundary and is recorded here rather than described as a successful preview.

Non-mutating `--generate curl` diagnostics confirmed that both the native and JavaScript CLI runtimes generated the explicit staging request body. No credentials from those diagnostics were printed or saved. The underlying classification behavior remains unresolved; another deployment through this route should not be attempted blindly.

## Remaining step

The connected Vercel tool returned 403 for this team and requested a user-approved team-access grant. A one-time consent link was supplied to the owner. Once the grant is complete, inspect the project and use the connected tool to create an explicitly preview deployment, then verify target and readiness. If any response again says production, remove that deployment and leave the project undeployed.

The website remains available as a local preview at http://localhost:4173. All code, data, source/permission evidence, browser captures and tests are reviewable in the private repository PR. Main is unchanged from its initial scaffold.
