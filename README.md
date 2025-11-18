# Headless Jackpot Sync

Headless Jackpot Sync is a custom Contentful app that lets editors attach "headless" jackpot configurations to individual games and trigger matching backend API calls so staging and production stay in sync. It renders both as an entry field (for the `headlessJackpot` field on `siteGameV2` and `igJackpotsSection`) and as a page location so teams can bulk activate or deactivate jackpots across many entries without leaving Contentful.

## Tech stack

- **React 18 & TypeScript** – UI layer built with Create React App conventions (`react-scripts`).
- **Contentful App Framework** – `@contentful/app-sdk` and `@contentful/react-apps-toolkit` drive location-aware rendering, dialogs, and CMA calls.
- **Forma 36** – Contentful's design system for consistent UI controls (`@contentful/f36-*`).
- **Axios** – HTTP client used to talk to the jackpot management APIs.
- **Styled Components** – Styling helper used by the LoadingBar overlay.
- **Jest & React Testing Library** – Default CRA test setup for future unit tests.

## Project overview

The app augments Contentful so game editors can:

1. Configure API credentials/domains for staging and production via the App Configuration screen (`src/locations/ConfigScreen.tsx`).
2. Use Field extensions (`src/locations/Field.tsx`) to pick an available headless jackpot for a single entry, opening an in-app dialog that lists jackpots fetched from proprietary APIs (`src/locations/Dialog.tsx`).
3. Automatically activate/deactivate jackpots in staging/production when a `siteGameV2` entry is saved or published by orchestrating HTTP requests inside `useHeadlessJackpotApi` (`src/hooks/useHeadlessJackpotApi.ts`).
4. Link jackpots to `igJackpotsSection` entries with the leaner `useFetchHeadlessJackpots` hook, which stores the selection but skips API calls because those sections only need to display previously-activated jackpots.
5. Perform bulk activation or removal of jackpots for many `siteGameV2` entries through the Page location UI (`src/locations/Page.tsx`).

## Contentful locations & responsibilities

| Location | Where it is installed | Purpose & core logic |
| --- | --- | --- |
| **App configuration screen** | Global app definition | Collects installation parameters such as API domains, list endpoints, activation/deactivation paths, and base64 Basic Auth headers (`ConfigScreen`). These map directly to the “Installation parameter definitions” shown in the Contentful App details screenshots (`productionApiDomain`, `stagingApiDomain`, `jackpotsListApi`, `activateGameApi`, `deactivateGameApi`, `isActiveGameApi`, and each auth header code). |
| **Entry field (siteGameV2 → headlessJackpot)** | Field app assigned to the `headlessJackpot` JSON object field on the `siteGameV2` content type | Renders `SiteGameV2Field`, which uses `useHeadlessJackpotApi` to (1) look up the entry’s related `gameV2` and `venture` references, (2) open the in-app dialog so editors can select a jackpot, and (3) mirror Contentful save/publish events to staging & production APIs (`/game-config/activate-game` and `/game-config/deactivate-game`). Installation requires setting the instance parameter `targetContentType` to `siteGameV2` so the location knows to load this flow. |
| **Entry field (igJackpotsSection → headlessJackpot)** | Field app assigned to the `headlessJackpot` JSON object field on the `igJackpotsSection` content type | Renders `JackpotGamesSectionField`, a simplified picker that calls `useFetchHeadlessJackpots` to retrieve venture-specific options and store the selection without hitting the activation APIs. Install the same field app with the `targetContentType` instance parameter set to `igJackpotsSection`. |
| **Dialog** | Opened from both field experiences | `Dialog.tsx` reads the invocation parameters (site + currently selected jackpot), loads all jackpots for that site via the production `/jackpot-config/jackpots` endpoint, and returns the chosen record. Errors are bubbled back to the invoking field so `SiteGameV2Field` can surface them via Forma 36 `Note`s. |
| **Page** | App shows in the main navigation | `Page.tsx` powers the “Bulk Activation Headless Jackpots” workspace. It lists available ventures, fetches jackpots for the selected venture, batches `siteGameV2` entries with/without jackpots through CMA queries, and lets editors queue entries for activation (`activationList`) or removal (`deActivationList`). The component then synchronises Contentful updates/publishes with API calls to both staging and production while displaying the `LoadingBar` overlay. |

## Architecture

| Layer | Responsibility |
| --- | --- |
| `src/index.tsx` | Boots the app inside Contentful and routes to the proper component for each Contentful location (config, field, dialog, or page). |
| `src/locations/ConfigScreen.tsx` | Install-time form that captures API base URLs and basic-auth headers for staging/production jackpot services. |
| `src/locations/Field.tsx` | Field extension wrapper that selects either `SiteGameV2Field` or `JackpotGamesSectionField` depending on the entry's content type parameters. |
| `src/components/SiteGameV2Field.tsx` & `src/components/JackpotGamesSectionField.tsx` | Render the per-entry UI for linking/unlinking jackpots and provide error/loading states. |
| `src/hooks/useHeadlessJackpotApi.ts` | Core business logic: loads related entry references, opens the selection dialog, queues API activations/deactivations across staging & production, and keeps state in sync with Contentful events. |
| `src/locations/Dialog.tsx` | Displays the selectable jackpots returned from the external API and returns the user's choice to the invoking field. |
| `src/locations/Page.tsx` | Full-screen location for bulk operations: fetches ventures, lists siteGameV2 entries with/without jackpots, and triggers mass activation/deactivation workflows with progress overlays. |
| `src/utils/` & `src/components/LoadingBar/` | Helper utilities (site name mapping, async delay) and shared UI like the loading overlay used on the bulk page. |

## Installation & setup

1. **Clone & install dependencies**
   ```bash
   git clone <repo-url>
   cd headless-jackpot-sync
   yarn install
   ```
2. **Configure Contentful app**
   - Create (or update) an app definition in Contentful.
   - Enable the locations highlighted in the provided screenshots: App configuration screen, entry field (JSON object fields, entry editor), dialog, and page (main navigation).
   - Define the installation parameters listed below so the runtime SDK can call your internal jackpot services:

     | ID | Description |
     | --- | --- |
     | `productionApiDomain` / `stagingApiDomain` | Base URLs for the production and staging jackpot services. |
     | `productionBasicAuthHeaderCode` / `stagingBasicAuthHeaderCode` | Base64 encoded `Basic ...` header payloads used by Axios when sending jackpot requests. |
     | `jackpotsListApi` | Optional helper for the jackpots listing endpoint (Dialog currently calls `/jackpot-config/jackpots` directly). |
     | `activateGameApi` / `deactivateGameApi` / `isActiveGameApi` | Path segments for the management endpoints invoked inside `useHeadlessJackpotApi` and the bulk page. |

   - When installing the app on specific fields, provide the `targetContentType` instance parameter (the “Instance parameter definitions” screenshot). Use `siteGameV2` for the Site Game flow and `igJackpotsSection` for the section picker; the `Field` component inspects this value to decide which React component to render.
3. **Local development**
   ```bash
   yarn start
   ```
   CRA runs on `http://localhost:3000` and `LocalhostWarning` will remind you to load the app inside Contentful using the "development" URL from the app definition.

## Usage

### Field extension
- **`siteGameV2` headlessJackpot field** – `SiteGameV2Field` wires into `useContentfulEventListener` so it knows when the entry is saved or published. When a new jackpot is selected, it captures the related `gameV2` and `venture` references, opens the dialog filtered to that venture, stores the resulting `{ id, name }` JSON object, and mirrors the change to staging + production via `useHeadlessJackpotApi`.
- **`igJackpotsSection` headlessJackpot field** – `JackpotGamesSectionField` loads the parent venture reference on mount, feeds it into the dialog, and simply saves the returned jackpot object. This location purposefully does not trigger backend mutations; it just ensures the section renders the same jackpot that was already activated on site games.

### Selection dialog
- The dialog requests available jackpots for the currently-selected venture by calling the production API with the configured credentials and returns the clicked entry to the field component. Errors bubble back through `dialogs.close({ error })` so the field location can show a Forma 36 `Note`.

### Bulk page
- Navigate to the Page location (the “Show app in main navigation” toggle from the screenshots).
- Pick a venture and headless jackpot. The component queries Contentful for matching `siteGameV2` entries, chunking requests 100 at a time and displaying progress via the overlay `LoadingBar` component.
- Use the “with jackpot” / “without jackpot” lists to queue entries for removal or activation. Each checkbox stores the entry along with its `gameV2` codes so API calls can be made later.
- Trigger **Deactivate** or **Activate** to:
  1. Call both staging and production jackpot APIs with the correct `gameCode` and `site` payload (using `siteMap` to handle legacy site aliases).
  2. Update the entry’s `headlessJackpot` JSON field through the CMA and immediately publish it.
  3. Reset the queue when finished so you can start the next batch.

## Running tests & linting

```bash
yarn test
```

CRA’s Jest setup looks for `*.test.(js|tsx)` files; add suites as you grow coverage. (A separate lint command isn’t defined—use your editor’s TypeScript checks or add ESLint if desired.)

## Building & deployment

```bash
yarn build
# optional: yarn deploy (publishes /build via gh-pages if configured)
```

Use `yarn build` when uploading a production bundle via `contentful-app-scripts upload`, or `yarn deploy` if you host the app on GitHub Pages/another static host.

## Contributing

1. Fork and clone the repository.
2. Create a feature branch (`git checkout -b feat/my-change`).
3. Make your updates plus accompanying tests/docs.
4. Run `yarn test` (and any manual verification steps, e.g., linking to a Contentful sandbox space).
5. Submit a pull request detailing the change and any Contentful configuration impacts.

---
Need help? Check the Contentful App Framework docs for guidance on connecting your local app to a space and installing it in the desired environments.
