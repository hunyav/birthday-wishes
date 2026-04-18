# birthday-wishes

A simple local web app and API to collect and display birthday greetings from friends and family.

## Features

- Main display page (`/`) with decorative animated background
- Rotating, shuffled birthday greetings loaded from API
- Automatic greeting refresh every 2 minutes
- QR code area in the corner (configurable image URL)
- Simple submission form (`/submit`) for greeting + optional name
- Local JSON file storage (`data/greetings.json` by default)

## Run locally

```bash
node server.js
```

Then open:

- Main display: `http://localhost:3000/`
- Submission form: `http://localhost:3000/submit`

## Configuration

Optional environment variables:

- `PORT` (default `3000`)
- `GREETINGS_FILE` (default `data/greetings.json`)
- `QR_CODE_IMAGE_URL` (default `/assets/qr-code.svg`)

## Add your assets

Place your own assets under `/public/assets`, for example:

- `/public/assets/qr-code.svg`
- `/public/assets/decor-1.svg`
- `/public/assets/decor-2.svg`

## Test

```bash
npm test
```
