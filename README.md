# Cool It Down

An application in a storybook form for therapy.

A kid-friendly storybook and coping tool for kids and teens, built for use **in session**
with a therapist. Anger is like food that's too hot: if you bite too fast, you burn your
mouth. So first you cool it down by blowing on it (breathing), grabbing a drink
(doing something else), or sitting and waiting.

Live at: **https://mcbuisdev.github.io/cool-down/**

## What's inside

- **Story mode:** 9 illustrated pages that teach the hot-food metaphor.
- **"My Food Is Hot!" mode:** pick a food, rate how hot it is (1–5), tap where the
  body feels the heat, pick a cooling tool, watch the steam go down, check the
  temperature again, then pick what to do next.
- **Cooling tools:** Blow on it (guided breathing), Grab a drink (distraction ideas),
  Sit and wait (calm timer), Let the steam out (feeling words), and Dipping sauce
  (comfort ideas).
- **Settings** (⚙️ in the top corner): sound, calmer animations, large text, wait timer
  length, and number and pace of breaths.

## Privacy

Nothing is collected or saved. There are no accounts, analytics, cookies, or outside
services. Refreshing the page resets everything, settings included. The only thing the
browser keeps is a copy of the app's own files, so it still opens without internet.

## Changing the words

**All the text is in [`content.js`](content.js).** To change wording:

1. Open `content.js` on GitHub and click the pencil (✏️) icon to edit.
2. Change only the words inside the quotes `"like this"`.
3. Click **Commit changes**. The site updates in a minute or two.

Lists (like the drink ideas, comfort ideas, or feeling words) can be made longer or
shorter. Keep the commas between items.

## Adding a new food

1. In [`foods.js`](foods.js), add an entry to `window.FOODS` with a `draw(heat)`
   function that returns the SVG drawing, plus a `steamFrom` point. Copy the nuggets or
   ramen entry as a starting point.
2. In `content.js`, add the food's name under `foods` using the same key.

It shows up on the "Pick your food" screen automatically.

## Running it locally

No build step. In this folder, run:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/ (or just open `index.html` directly in a browser).

## Files

| File | What it does |
|---|---|
| `index.html` | The page shell and top bar |
| `content.js` | All the words in the app |
| `foods.js` | The food characters (SVG) and their faces at each heat level |
| `app.js` | Screens, navigation, activities, sounds, settings |
| `styles.css` | Look and animations |
| `sw.js` | Offline support (caches the app's own files only) |
| `icon.svg` | Browser tab icon |
