# birthday-wishes

A simple local web app to celebrate Ramona's birthday:

- **TV banner UI** (`/`) showing the Happy Birthday title, rotating/fetched wishes, image slots, and QR image area.
- **Submission UI** (`/submit`) for friends/family to send wishes.
- **Local API** (`/api/greetings`) for listing and adding greetings.
- **Local storage** in `data/greetings.json`.

## Requirements

- Node.js 20+

## Run locally

```bash
npm install
npm start
```

Open:

- `http://localhost:3000/` (TV/banner display)
- `http://localhost:3000/submit` (wish submission form)

## Environment variables

- `PORT` (default: `3000`)
- `HOST` (default: `0.0.0.0`)
- `MAX_GREETINGS` (default: `200`)
- `GREETINGS_FILE` (default: `./data/greetings.json`)

## Assets you can provide

Put your assets in `public/assets/`:

- `banner-photo-1.jpg`
- `banner-photo-2.jpg`
- `banner-photo-3.jpg`
- `qr-code.png`

You can rename these and update the paths in `public/index.html`.

## API

### `GET /api/greetings`
Returns greetings ordered newest first.

### `POST /api/greetings`
Creates a new greeting.

Request body:

```json
{
  "name": "Sender Name",
  "message": "Happy Birthday, Ramona!"
}
```

## Refresh behavior

The TV page fetches greeting updates every 3 minutes by default.
To change this in-browser, set `window.BANNER_REFRESH_MS` before loading `tv.js`.
