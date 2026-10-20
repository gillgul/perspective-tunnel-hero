# Perspective Tunnel Hero: plain HTML / CSS / JavaScript

A full-screen 3D hero section. Scroll (or swipe) and the image cards fly toward
you through a perspective tunnel. No libraries, no build step.

## Files

| File | What it is | Needed on a website? |
|---|---|---|
| `index.html` | Page structure (title, text, card area) | ✅ the `<section class="tunnel">…</section>` part |
| `style.css` | All the styling | ✅ |
| `script.js` | The 3D motion, scrolling and mouse movement | ✅ |
| `serve.py` | Python preview server for your own computer | ❌ preview only |

## Preview on your computer

Double-click `index.html`, or run:

```bash
python serve.py
```

This opens http://127.0.0.1:8000/index.html in your browser. Press `Ctrl+C` to stop.

## Use it on WordPress

### Before you start

- You need a **self-hosted WordPress** site or a **WordPress.com Business plan or higher**.
  Lower WordPress.com plans remove `<script>` code.
- Use a **full-width page template** (often called "Full Width", "Canvas" or "Blank")
  so the theme's margins don't squeeze the hero.
- Put the hero as the **first section** of the page. While the cursor is over it,
  the mouse wheel moves through the tunnel instead of scrolling the page.

### Step 1: Make the CSS safe for your theme

`style.css` was written for a page of its own. A few rules would change your whole
WordPress site, so **delete these lines** before pasting:

| Lines in `style.css` | Rule | Why remove it |
|---|---|---|
| 33 | `*, *::before, *::after { box-sizing: … }` | Changes sizing across your whole theme |
| 34 | `html, body { … }` | Changes your site's background and height |
| 35 | `body { font-family: … }` | Changes your site's font |

Then, so the hero's styles only apply inside the hero:

- Change `:root {` (line 1) and the `:root {` inside the dark-mode block (line 17) to `.tunnel {`.
- Change `h1 {` (line 73) to `.tunnel h1 {`.
- Put `.tunnel ` in front of the short class names that themes also use:
  `.grid`, `.glow`, `.ring`, `.title`, `.eyebrow`, `.lede`, `.prompt`, `.plane`, `.card`.
  For example, `.card {` becomes `.tunnel .card {`.

### Step 2: Paste it into the page

**Option A: one Custom HTML block (easiest)**

1. Edit the page and add a **Custom HTML** block. In Elementor, use the **HTML** widget.
2. Paste these three parts in this order:

```html
<style>
  /* paste the edited contents of style.css here */
</style>

<!-- paste the <section class="tunnel"> … </section> part of index.html here -->

<script>
  /* paste the contents of script.js here */
</script>
```

3. Click **Preview** and scroll over the hero to check it.

**Option B: the WPCode plugin (cleaner for bigger sites)**

1. Install the free **WPCode** plugin.
2. Add a **CSS snippet** with the edited `style.css`, set to load on that page only.
3. Add a **JavaScript snippet** with `script.js`, set to load in the **footer** on that page only.
4. Put only the `<section class="tunnel"> … </section>` markup in a **Custom HTML** block.

## Customise it

- **Your own pictures:** edit the `IMAGES` list at the top of `script.js`.
  Each entry is `{ src: "image link", title: "Label" }`. Upload images to your
  WordPress **Media Library** and use their links.
- **Text:** edit the title and lines inside the `<section>` in `index.html`.
- **Colours:** edit the `--bg`, `--accent` and other `--…` values at the top of `style.css`.
- **Speed:** in `script.js`, change `0.0008` in `e.deltaY * 0.0008` (higher = faster).

## Troubleshooting

| Problem | Fix |
|---|---|
| Nothing moves when scrolling | Your plan or a security plugin is removing `<script>`. Use WPCode or a higher plan. |
| My whole site's font or background changed | Step 1 wasn't done. Remove the `html`, `body` and `*` rules. |
| Hero is squeezed or has white borders | Switch the page to a full-width template. |
| Images don't show | Check the `src` links in `script.js` open in a browser. |
| Dark colours on a light site | The hero follows the visitor's system dark mode. Delete the `@media (prefers-color-scheme: dark)` block to keep it light. |
