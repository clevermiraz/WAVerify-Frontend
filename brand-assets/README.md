# Brand assets (source files)

These files are **not** served to the web. They are kept here so we can rebuild
the app icons later. Next.js only serves `public/` and the `app/` metadata
files, so nothing in this folder ships to users.

## `exported-to-app/`

Copies of the files that now live in `src/app/`. Next.js picks those up by
filename and writes the `<link>` and `<meta>` tags for us, so the app reads them
from there — never from here.

| File | Where it is used from |
| --- | --- |
| `favicon.ico` | `src/app/favicon.ico` |
| `tile-180.png` | `src/app/apple-icon.png` |
| `opengraph-image.png` | `src/app/opengraph-image.png` and `src/app/twitter-image.png` |

If you change the logo, update the file in `src/app/` and copy it here too, so
the two stay in step.

## `favicon-inputs/`

The square PNGs that were packed into `favicon.ico`. Keep them if you want to
build the `.ico` again at the same sizes.

## Where the other files went

Logo art that a browser needs to load by URL — for emails, the web app
manifest, or a press page — lives in `public/brand/`. It is public and its paths
are stable.
