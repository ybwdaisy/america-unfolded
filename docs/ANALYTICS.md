# Analytics and Site Pulse contract

America Unfolded production: https://usa.ybwdaisy.com

## Real resources

- Google account's existing GA account: 359267445.
- Independent GA4 property: America Unfolded, 565688768; reporting time zone Asia/Shanghai.
- Independent Web stream: 16405063176, https://usa.ybwdaisy.com.
- Measurement ID: G-G1BH7EZXL9, production environment only.
- Enhanced Measurement: explicitly disabled in this stream; no linked site tags.
- Business key events saved in GA4: story_complete, map_source_open, map_share_success, with no default monetary value. Google’s existing purchase default is unchanged and is not emitted by this atlas.
- Event retention was saved as 14 months for this new property to cover the platform’s 90-day funnel window; user retention remains 14 months.
- Search Console URL-prefix: https://usa.ybwdaisy.com/. The Site Pulse production read client successfully queried this exact prefix and returned no search data yet; no indexing claim follows from configuration.

Other products' properties/streams and their settings are unchanged. No Measurement Protocol key or additional Cloud project is required.

## Collection boundaries

Google's SDK only loads at the exact https://usa.ybwdaisy.com origin, with a production build and a valid measurement ID, after affirmative analytics consent. Local, preview configuration, Vercel aliases, navigator.webdriver automation, ?analytics_test=1 and ?qa=1 do not load it and do not emit any page or business event. QA is persisted in host-scoped session/local storage before consent handling; ?analytics_test=0 cannot override webdriver. Storage failure fails closed.

Consent is saved only for this hostname. The inline optional notice and footer Analytics choices do not overlay the map. Rejection requires no SDK; withdrawal sets Google's disable flag, removes the tag element and expires this hostname's prefixed analytics cookies. Tests cover no later events after withdrawal. Existing data already processed by Google is not retroactively erased by this site.

Page locations are the approved public static path, without queries, hashes, coordinates or selected source-record IDs. Referrers retain only an external origin. Parameters are fixed enums, known chapter IDs or integer years from 1776 to 1959; no user IDs, names, emails, free text or arbitrary strings enter the event contract. Google Signals and advertising personalization/storage are disabled in the site tag configuration. Cookie domain is usa.ybwdaisy.com with prefix au.

## Events and funnels

The authoritative event names are in src/analytics-contract.mjs. Four funnels are maintained only in analytics/funnels.json, revision 2026-11-24.1, schemaVersion 1, qaPolicy no-collection-for-tests-v1. Build validation copies the exact source bytes into public/.well-known/site-pulse.json and verifies dist bytes. CI checks both public schema and Markdown against the cached validated contract. Public URL: https://usa.ybwdaisy.com/.well-known/site-pulse.json.

| Event | Real trigger |
| --- | --- |
| map_explore_start | First consenting user's map/timeline/chapter/comparison/play interaction on the page |
| map_year_select | User year/node selection successfully commits, not autoplay frames or slider input previews |
| map_region_select | Region click/keyboard selection opens its record |
| map_detail_view | An opened/updated chapter or record intersects the viewport |
| map_source_open | User clicks an external source link from chapter/reading content |
| story_start | First committed chapter of the user's story run |
| story_step_view | Each distinct reached chapter in a story run |
| story_complete | Last guided chapter reached; once per run, not repeated when finishing |
| map_compare_open | User enables comparison |
| map_compare_change | User changes to a different before/after phase |
| map_share_success | Clipboard write resolves successfully; fallback/error is not success |
| map_play_start / map_play_pause | Explicit play/pause button actions, not automatic annual ticks |

Normal events carry content_group=america_unfolded_public, tool_id=america_unfolded and analytics_version=1. No QA events are intentionally sent. The platform also imposes exact hostname and confirmed QA exclusions. Closed, indirectly followed funnels use 1800-second adjacent-step windows:

1. america-map-research: explore → region → detail → source.
2. america-story: start → chapter → completion.
3. america-compare: explore → comparison opened → phase changed.
4. america-share: explore → detail → successful share.

## Verification and limits

The 12 offline checks simulate canonical human traffic only in a local-file routing fixture with an SDK stub; all external requests are blocked before navigation. They cover exclusions, consent, query stripping, map/source/compare/share actions, all ten story steps, completion deduplication, no annual-frame events and withdrawal. The separate real Google SDK fixture uses the real stream ID and actual SDK while intercepting every collection packet before dispatch; it verified one page view plus explore/year/detail, safe locations and withdrawal. This is not evidence of production ingestion or real visitors. Evidence: docs/evidence/analytics-results.json and analytics-real-sdk.json.

Site Pulse owns its production integration and independent validation in the GA4+GSC aggregation conversation. Report availability, zero-data API responses and manifest synchronization do not establish historical accuracy, audience demand, indexing or conversion performance.

## Production acceptance

The exact production origin passed 9 Chrome desktop/phone and iPhone-emulated WebKit checks, with 0 Google SDK/collection requests and no page errors. The real SDK fixture additionally confirmed au_ga and au_ga_G1BH7EZXL9 cookies belong only to .usa.ybwdaisy.com and both are expired after withdrawal. GSC identified the exact URL prefix as siteOwner; sitemap.xml was submitted successfully and its UI returned Success / 20 discovered pages / 0 videos on November 24, 2026. Discovered pages are not a count of indexed pages.

Site Pulse production read-back returned the four remote definitions at revision 2026-11-24.1 with no synchronization failures, and all four actual GA4 funnel queries returned HTTP 200 without cache. The checked period ends November 23 (before launch), so zero observed people/events and null rates do not measure launch-day usage. Original four-site definitions remain 1+3+5+7=16; the five-site total is 20. See evidence/site-pulse-five-production-summary.json and site-pulse-usa-live-funnels.json. No collector events were sent for this verification.
