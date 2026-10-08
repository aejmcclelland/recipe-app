# Rebekah’s Recipes – Next Improvement Priorities

## Main Product Goal

The next major phase should focus on making recipe capture/import as easy as possible.

Current friction is too high for some users:

1. Find a recipe in another browser tab or app.
2. Copy the URL.
3. Switch back to Rebekah’s Recipes.
4. Open the import page.
5. Paste the URL.
6. Import.
7. Review.
8. Save.

The target flow should be closer to:

> Find recipe → send/share to Rebekah’s Recipes → review → save.

This should be the main product improvement after the Autohaus website break.

---

## 1. Reduce Import Friction

### Goal

Make saving a recipe from another website feel almost one-step.

### Ideas

Explore a lightweight way to send the current recipe URL directly into Rebekah’s Recipes, for example:

- browser bookmarklet
- lightweight browser extension
- browser share flow where practical
- direct import route that accepts a URL parameter

The first version does not need to be technically elaborate. The priority is reducing browser switching, copying and pasting.

### Desired UX

A user should be able to:

1. Find a supported recipe online.
2. Trigger “Save to Rebekah’s Recipes”.
3. Arrive at an import/review screen with the URL already supplied.
4. Review the extracted recipe.
5. Save it.

---

## 2. Improve the Import Review Experience

Once a recipe has been scraped, the review step should be simple and forgiving.

The screen should clearly show:

- recipe title
- image
- ingredients
- method
- category
- source website / original URL
- one clear primary `Save Recipe` action

Users should be able to correct scraper mistakes before saving.

### Scraped ingredients

Scraped ingredients should not be forced into the same structured model as manually entered ingredients.

A useful distinction is:

- manual ingredients: structured quantity / unit / ingredient data
- scraped ingredients: editable free-text lines

Longer term, a scraped line could optionally be converted into structured ingredient data.

The original scraped text should always be preserved when parsing is uncertain.

---

## 3. Refactor Scraper Architecture

Before adding many more supported websites, make the scraper system easier to extend.

Suggested structure:

```text
scrapers/
  goodFood.ts
  bbcFood.ts
  jamieOliver.ts