# dongyi.me

Minimal bilingual personal website for Cadence, 100ls, and RaceWhere. Plain HTML/CSS/JavaScript, no production dependencies.

## Preview locally

```sh
npm run dev
```

Open http://127.0.0.1:3000/. Requires Python 3 for the local server.

## Build

```sh
npm run build
```

`npm run preview` serves the build locally.

## Cloudflare Pages deployment

- Production website: https://dongyi.me/
- Pages project: `dongyi-me` (production branch `main`)
- Pages address: https://dongyi-me.pages.dev/

Authenticate with the Cloudflare `cf` CLI, then run:

```sh
cf auth login
npm run deploy
```

The deploy script uses `cf` to obtain a short-lived Pages upload token and create the production deployment. Static assets upload through the official Pages asset API because `cf pages deploy` does not support Pages direct uploads. No Wrangler dependency or command is used. Upload tokens stay in memory and never enter logs or source control. The script uploads only the generated `dist/` files; image provenance notes stay local. DNS points `dongyi.me` to `dongyi-me.pages.dev` with Cloudflare proxying enabled.

Edit product links and default Chinese content in `index.html`, bilingual copy in `script.js`, and presentation in `style.css`. Language choice is saved locally when browser storage is available. Default language is Chinese.

The self-hosted Manrope font is licensed under the SIL Open Font License; see `assets/OFL.txt`.
