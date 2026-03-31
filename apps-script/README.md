# Google Apps Script Backend

This directory contains the backend replacement for Web3Forms.

## What It Does

- Accepts applicant form data from the website
- Stores uploaded files in Google Drive
- Sends an email to `globalstaffagencykg@gmail.com`
- Includes the Google Drive file links in the email
- Optionally logs submissions to Google Sheets

## Files

- `Code.gs`: main web app backend
- `appsscript.json`: Apps Script project manifest

## Drive Folder

The script is already configured to use this Drive folder:

- `1_RThHnA5t9Mgg-7Uvvam3eHcO3Q9LxGR`

## Deployment Steps

1. Open [Google Apps Script](https://script.google.com/).
2. Create a new project.
3. Replace the default `Code.gs` with the contents of `Code.gs` in this folder.
4. Replace the project manifest with `appsscript.json`.
5. In `Code.gs`, confirm:
   - `RECIPIENT_EMAIL`
   - `DRIVE_FOLDER_ID`
   - `MAX_ATTACHMENT_BYTES`
6. Optional:
   - Set `SPREADSHEET_ID` if you want each submission written to a Google Sheet.
7. Click `Deploy` -> `New deployment`.
8. Select `Web app`.
9. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
10. Copy the deployed `/exec` URL.
11. If you update the script later, redeploy the web app so the live endpoint uses the new version.

## Frontend Configuration

After deployment, open:

- `/Users/nurlanmirovich/integration-automation/work_in_kyrgyzstan/index.html`

Find the application form and paste the Apps Script URL into:

```html
data-endpoint="PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE"
```

Example:

```html
data-endpoint="https://script.google.com/macros/s/AKfycb.../exec"
```

## Local Testing

You can still run the site locally:

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

If the form points to the deployed Apps Script URL, localhost submissions should still be accepted. The frontend uses a simple cross-origin POST for Apps Script endpoints and treats a completed request as accepted. Verify delivery by checking:

- your email inbox
- the Google Drive applicant folder

## Attachment Rules

- Allowed: `PDF`, `DOC`, `DOCX`, `TXT`, `JPG`, `JPEG`, `PNG`
- Max size: `5 MB` per file
- Current frontend fields:
  - `Resume`
  - `Documents International Passport`

These limits are enforced on both the website and the Apps Script backend.
