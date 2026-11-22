# CF Contour

A browser extension that adds a live chart to Codeforces standings pages. The chart
shows the average score of contestants, grouped by rating (one bucket per 100 rating
points), so you can see how each rating band performed.

## Features

- **Average score by rating** — line + points chart over rating buckets, points colored
  by rank. Y axis is the average score, X axis is the rating bucket.
- **Participant filter** — `Official only` or `Everyone`. Unofficial participants are
  read from the standings page, since the CF API hides them for regular contests.
- **Live updates** — standings are re-fetched every 2 minutes while the tab is visible.
- **Hover tooltip** — exact bucket details on hover.
- **Collapsible** — collapse the panel to the header when you don't need it.

## Install (unpacked)

1. Open `chrome://extensions` (or `about:debugging` in Firefox).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `cfcontour` folder.
4. Open any Codeforces standings page.

## How it works

All data is fetched from the content script so the page's cookies satisfy Cloudflare.
Nothing is written back to the page and the standings table is never modified.

- `contest.standings` — official participants and their total score.
- standings page (`?showUnofficial=true`) — unofficial participants.
- `user.info` — ratings for the participants (standings do not include them).

Scores are averaged per rating bucket. Ratings are fetched once and cached, since they
do not change mid-contest.

## Files

```
manifest.json
icons/icon.svg
src/content/
  content.js        entry point / orchestration
src/api/
  api.js            Codeforces API client
  standings-page.js standings page fetch + parse (unofficial rows)
  ratings.js        ratings cache
src/chart/
  compute.js        bucketing + filter selection
  chart.js          canvas rendering
  panel.js          shadow-DOM panel
src/util/
  constants.js      shared constants
  util.js           small helpers
  rank-colors.js    rating -> color
```

Content scripts are loaded in dependency order and share the `CFContour` namespace; there
is no bundler and no background worker.

## Notes

- Default filter is **Official only**.
- Unofficial participants require the standings page; if that fetch fails, the panel
  falls back to official-only and shows `No participants match this filter`.
- The extension is standalone: it does not read or write another extension's storage.