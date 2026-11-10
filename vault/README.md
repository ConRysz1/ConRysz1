# Vault

Client portal and public site for a trust company. The demo family is the Whitfields: trusts and entities, distribution requests, documents with e-signature, a compliance calendar, heirs and access, messages, billing, and add-on services. Everything runs in the browser. Auth, files, payments, and messaging are mocked.

The app lives in this folder because the repository root is a GitHub profile README.

## Why TypeScript

The uploaded prototype is one dependency-free HTML file, one CSS file, and one large JavaScript file. It does not name a backend stack. TypeScript with React and Vite keeps the same client-only product and gives it a shape that can grow:

- A typed domain (`src/domain`) for trusts, pricing, the calendar, and the demo family.
- A small store (`src/state`) for portal data and the in-memory session, still persisted at `localStorage` key `vault-portal-v2`.
- Feature folders for the public site and the portal, so a new page is a module instead of another branch in one file.
- Vite for local development and a production build, with no server to invent.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints. `npm run build` typechecks and writes `dist/`.

## Demo

- Sign in with any email that contains `@` and any password, or use **Use the demo account** (`eleanor@whitfield.family`).
- The e-sign code is `482913`.
- **Reset demo data** in Settings restores the original family and reapplies the prototype’s data migrations so the portal stays usable.

## Layout

- `src/domain` — types, seed data, pricing, calendar, and the Whitfield demo.
- `src/state` — persisted portal data, session, and hash routing (`#portal`, not `#/portal`).
- `src/site` — public pages: home, features, get started, build a plan, login.
- `src/portal` — the signed-in client portal.
- `src/ui` — shared controls and the sheet, confirm, and toast overlays.
- `src/styles.css` — the prototype stylesheet.
