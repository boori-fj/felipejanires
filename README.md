# felipejanires.com

Portfolio site for Felipe Janires, live at **https://felipejanires.com** (GitHub Pages; DNS at Squarespace Domains). Plain HTML, CSS and JavaScript with no build step, so GitHub Pages can host it as is.

```
index.html            all page content
assets/css/style.css  styles (colours and spacing at the top, in :root)
assets/js/main.js     scroll effects, photo track, lightbox, menu
assets/img/           optimized WebP images (two sizes each: ~800px and ~1600px)
```

## Preview

Double-click `index.html` to open it in a browser. Everything works from the file except that fonts need an internet connection.

## Add a project

1. Export the image as WebP at two widths, e.g. `my-project-800.webp` and `my-project-1600.webp`, into `assets/img/`.
2. In `index.html`, copy an existing `<figure class="d-item">` (Identity & print) or `<figure class="hs-item">` (Photography) block and change:
   - the file names in `href`, `src` and `srcset`
   - `width` / `height` (the 800px file's size)
   - `alt`, the caption text, and the `data-title`, `data-kind` and `data-desc` attributes (these fill the lightbox)
   - for Photography also the `--r` value in `style` (image width ÷ height)
3. Websites use the `<article class="site">` block. Add `data-link="https://…"` and a `.site-link` only if the site is live.
4. Multi-image galleries (like the MacFarlane brand kit): every link with the same `data-group` becomes one lightbox gallery, ordered by `data-i`. Slides that shouldn't appear on the page go inside the `<div hidden>` in that block.

## Swap the hero background for a video reel

Put the file at `assets/video/reel.mp4` (keep it under ~10 MB) and follow the comment above the hero in `index.html`.

## Publish on GitHub Pages

Name the repository `<your-github-username>.github.io` and the site lives at `https://<your-github-username>.github.io`. Any other name works too, it just adds `/<repo-name>` to the address. The repository must be **public** on a free GitHub account.

**With GitHub Desktop (recommended, no terminal):**
1. Install GitHub Desktop from https://desktop.github.com and sign in.
2. **File → Add Local Repository…** → choose this `portfolio` folder → click **create a repository** when asked → name it `<username>.github.io` → **Create Repository**.
3. Click **Publish repository**, untick **Keep this code private**, publish.
4. On github.com, open the repository → **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**. The site is live a minute or two later.

To update later: edit files, then in GitHub Desktop write a short summary, **Commit to main**, **Push origin**.

**Without installing anything:** create an empty public repository on github.com, click **uploading an existing file**, drag in everything inside this folder (index.html, README.md and the assets folder), commit, then do step 4 above.

**Custom domain (optional):** add `felipejanires.com` under **Settings → Pages → Custom domain**, then point the domain's DNS at GitHub Pages as GitHub describes there.
