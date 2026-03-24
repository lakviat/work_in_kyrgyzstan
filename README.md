# Global Staff Agency - Jobs in Kyrgyzstan Website

Official marketing and recruitment landing site for **Global Staff Agency (GSA)**.

This is a static website focused on inbound international hiring for the Kyrgyz Republic and Central Asia.  
It includes a hero landing page, job categories, process flow, map, FAQ, and a Web3Forms-powered application modal.

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
- Footer with contact links and Instagram

## Form Submission (Web3Forms)

The form posts directly to Web3Forms:

- Endpoint: `https://api.web3forms.com/submit`
- Form element: [`index.html`](./index.html) (`#applyForm`)

Current behavior:

- Selecting **Current Location** or **Citizenship** auto-populates the phone code when a code exists.
- Phone code field dynamically resizes for longer values.

If you need to update form routing:

1. Update `access_key` hidden input in [`index.html`](./index.html).
2. Confirm linked receiver email in Web3Forms dashboard.
3. If domain restriction is enabled in Web3Forms, allow this domain.

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

