# WAVerify — Frontend

WAVerify tells you if a phone number has a WhatsApp account.

This is the website: the public pages, the customer dashboard and the admin
panel. It is built with **Next.js 16** and **React 19**.

It needs the API to run. That is a separate project (`WAVerify-Backend`), which
runs at **https://api.waverify.app** in production. This website runs at
**https://waverify.app**.

---

## What you need first

- [Node.js 20 or newer](https://nodejs.org/) and npm
- The backend running somewhere you can reach — usually
  `http://localhost:8000` on your own computer

---

## Quick start

**Step 1 — install the packages:**

```bash
npm install
```

**Step 2 — copy the settings file:**

```bash
cp .env.example .env
```

Open `.env` and check the values. The defaults work for local development.

**Step 3 — start the site:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Settings

All settings live in `.env`.

| Setting | What it does |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Address of the API — **the host only, with no path**. For example `https://api.waverify.app`. The `/api/v1` part is added by the code. |
| `SITE_URL` | Address of this website. Used for links shared on social media, `robots.txt` and `sitemap.xml`. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID. Leave it empty to hide the "Continue with Google" buttons. |

### Important: these are read when you build, not when you start

Next.js writes these values into the JavaScript files during `npm run build`.
Changing `.env` and restarting the server does **not** change them. You have to
build again.

For Docker, this means you must pass them as build arguments, not as runtime
environment variables. The `Dockerfile` and `docker-compose.yml` already do
this.

### Is it safe that `NEXT_PUBLIC_API_URL` is public?

Yes. The browser has to know the address to call it, so it is visible in
anyone's developer tools no matter what you do. It is also printed in our own
public API documentation.

The rule is simple: `NEXT_PUBLIC_` values are for things you could put on a
poster — addresses, and the Google client ID. Never put a password, a secret
key, or an API key there.

---

## Running with Docker

The build needs to know the API address, so pass it in:

```bash
docker compose build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.waverify.app \
  --build-arg SITE_URL=https://waverify.app
docker compose up
```

Or put `NEXT_PUBLIC_API_URL` and `SITE_URL` in a `.env` file next to
`docker-compose.yml` and just run `docker compose up --build`.

The build stops with an error if `NEXT_PUBLIC_API_URL` is missing. This is on
purpose: without it, the site would be built pointing at `localhost` and would
fail in the browser with nothing in the build log to explain why.

---

## Turning on "Sign in with Google"

Follow the steps in the backend README first, then put the **same** client ID
here:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Build again after changing it.

If this is empty, the Google buttons do not appear at all, and email and
password sign-in keeps working normally.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site for development. |
| `npm run build` | Build the site for production. |
| `npm start` | Run the built site. Run `npm run build` first. |
| `npm run lint` | Check the code style. |
| `npm run typecheck` | Check the TypeScript types. |

---

## Where things are

| Folder | What is inside |
| --- | --- |
| `src/app/` | The pages. Folder names are the URLs. |
| `src/components/` | Reusable pieces of the interface. |
| `src/services/` | One function for each API endpoint. Pages call these instead of building URLs. |
| `src/hooks/` | Shared React logic, including sign-in state. |
| `src/lib/` | The API client, form rules, and the code samples shown in the docs. |
| `src/types/` | TypeScript descriptions of what the API sends back. |
