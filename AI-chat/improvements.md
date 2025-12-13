## Rebekah Recipe improvements

**1) Sign in / sign up / profile polish**
- Add Forgot password flow (even a simple email reset link via your provider / Auth setup).
- Make auth feedback obvious:
- toast + inline field errors
- disable buttons while submitting
- “signed in as …” in the AppBar
- Profile page:
- edit name/email
- update profile image (Cloudinary)
- show “My recipes” + “Bookmarks” with empty states

**2) Scraped vs manual recipes (data model polish)**

Right now you’ve effectively got two kinds of ingredients
- manual: structured {ingredientId, quantity, unit}
- scraped: basically free-text

Make that explicit:
- add source: 'manual' | 'scraped' on Recipe
- (optional) add ingredientsText: string[] for scraped recipes long-term

That makes rendering + editing much easier (and avoids future “why is this missing qty/unit?” confusion).

**3) Editing scraped ingredients easily**

Give users a simple “Edit ingredients” UI that supports both types:
- For scraped/free-text: editable text lines
- For structured: qty + unit + ingredient name (dropdown/autocomplete)

A very usable pattern is:
- show ingredient line as text first
- “Convert to structured” button per line (later)

**4) Add more sites to scrape**

The trick is a plugin-ish approach:
- scrapers/<site>.ts returns { title, ingredients: string[], steps: string[], image }
- one normaliser (parseScrapedRecipe) downstream
- keep a small “supported sites” registry with patterns

**5) Improve measures + portions**

Do this incrementally:
- start with lightweight parsing (e.g. 1/2, ¼, 2 x 400g, 150ml)
- store parsed output if confident, else store as text
- never block saving because parsing failed
