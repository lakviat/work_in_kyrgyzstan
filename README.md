# Global Staff Agency - Jobs in Kyrgyzstan Website

Official marketing and recruitment landing site for **Global Staff Agency (GSA)**.

This is a static website focused on inbound international hiring for the Kyrgyz Republic and Central Asia.  
It includes a hero landing page, job categories, process flow, map, FAQ, and an application modal that can submit into Google Apps Script.

## Live Domain

- Primary domain: `https://jobsinkyrgyzstan.com`
- Domain mapping is controlled by [`CNAME`](./CNAME)

## Tech Stack

- HTML: [`index.html`](./index.html)
- CSS: [`styles.css`](./styles.css)
- JavaScript: [`script.js`](./script.js)
- Assets: [`assets/`](./assets)

No build tooling is required.

## Run Locally

From the project root:

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

## Main Features

- Glassmorphism hero section with mountain background
- KPI count-up animation
- Interactive process timeline
- Job category cards
- Kyrgyzstan map (Leaflet)
- FAQ accordion
- Application modal form with:
  - Full legal name
  - Current location
  - Phone code + phone number
  - Email
  - Citizenship
  - Job category
  - Description
  - Resume upload
  - International passport / document upload
- Footer with contact links and Instagram

## Form Submission (Google Apps Script)

The frontend is now prepared to send applications to a Google Apps Script web app:

- Form element: [`index.html`](./index.html) (`#applyForm`)
- Config location: `data-endpoint=""` attribute on the form
- Backend template: [`apps-script/`](./apps-script)

Current behavior:

- Selecting **Current Location** or **Citizenship** auto-populates the phone code when a code exists.
- Phone code field dynamically resizes for longer values.
- Both attachment fields are converted to base64 in the browser and sent to Apps Script.
- Apps Script stores both uploads in Google Drive and emails their Drive links to `globalstaffagencykg@gmail.com`.

To finish the setup:

1. Deploy the Apps Script web app from [`apps-script/README.md`](./apps-script/README.md).
2. Copy the `/exec` URL.
3. Paste that URL into the form `data-endpoint` in [`index.html`](./index.html).

Until that endpoint is added, the form will not submit.

## SEO Files

- [`robots.txt`](./robots.txt)
- [`sitemap.xml`](./sitemap.xml)

Search console note:

- Submit `sitemap.xml` under the property that matches your canonical domain (`jobsinkyrgyzstan.com` vs `www`).

## Deployment

Deployment is automated with GitHub Pages:

- Workflow: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
- Trigger: push to `main`
- Artifact path: repository root (`.`)

## Quick Content Update Guide

- Hero text and CTA labels: [`index.html`](./index.html)
- Visual styling, spacing, typography: [`styles.css`](./styles.css)
- UI interactions (modal, auto-fill, FAQ, map): [`script.js`](./script.js)
- Logo file: [`assets/gsa-logo.png`](./assets/gsa-logo.png)
- Google Apps Script backend: [`apps-script/`](./apps-script)
