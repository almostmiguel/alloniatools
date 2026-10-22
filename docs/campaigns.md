# Campaigns and sessions

Campaigns use the existing adventure reader: a campaign is an adventure, and each session is one chapter. The URLs and internal JSON keys stay compatible with Pf2eTools and its reference tags.

Open `adventures.html` for the campaign list. `adventure.html#example-campaign,0` opens the first session of the included example; `adventure.html#example-campaign,1` opens its second session. The session number in the URL starts at zero.

## Add a campaign

1. Add an entry to the `adventure` array in `data/adventures.json`. Give it a name, a unique lowercase ID using letters, numbers, and hyphens, a source label, and a `contents` array.
2. Create `data/adventure/adventure-<id>.json`. Set its `id` to the same ID and add one entry to its `data` array per session.
3. Keep `contents` and `data` in the same order. Each contents item points to the session at the same array index.
4. Run `npm test` to check the campaign data and `npm run gen-all` to refresh search and navigation.

Use `example-campaign` as a template, or remove its index entry and content file when you add your own campaign.

## Add a session

Add a contents item like this to your campaign in `data/adventures.json`:

```json
{
  "name": "Arrival at the Crossroads",
  "ordinal": {"type": "session", "identifier": 3},
  "headers": ["Recap", "Session Notes"]
}
```

Add the corresponding session to your campaign file's `data` array:

```json
{
  "type": "section",
  "name": "Session 3: Arrival at the Crossroads",
  "entries": [
    {"type": "entries", "name": "Recap", "entries": ["What happened last time."]},
    {"type": "entries", "name": "Session Notes", "entries": ["What happened this time."]}
  ]
}
```

The `headers` names should match headings inside that session. Paragraphs are strings; use entry objects for headings, lists, tables, and images. Existing tags such as `{@spell Heal|PC1}` and `{@dice 1d20}` work inside session text.

Optional campaign metadata:

- `storyline`: the setting or storyline shown in the list.
- `published`: the campaign's start date, in `YYYY-MM-DD` format.
- `color`: the menu marker color as a hex value, for example `"#5ab3a8"`. Without it, the site picks a stable color from the campaign ID.
- `coverUrl`: a cover image, for example `img/campaigns/my-campaign.webp`.

Campaigns appear under **Game Master > Campaigns**, ordered by start date with a year label for each group. Campaigns without a start date appear under **Undated**. Run `node node/generate-nav-adventure-book-index.js` after changing dates or colors to refresh the menu.

The reader supports session links, heading links, full-campaign view, and text search with the F key. The Settings menu can still back up your filters, pinned entries, and dice macros.

Campaign content is edited in the repository and published with the site. All campaign JSON is public on GitHub Pages; there is no separate GM-only access.

## Changelog

Add future updates to the `changelog` array in `data/changelog.json`, oldest first:

```json
{
  "ver": "0.1.0",
  "date": "2026-10-22",
  "title": "First campaign",
  "txt": "- Added our campaign journal.\n- Added the first session."
}
```
