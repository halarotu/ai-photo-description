# AI Photo Description

Upload a photo and get a short AI-generated description of it. You can choose which AI describes the photo:

- **Claude** (Anthropic API)
- **Qwen** (`qwen2.5vl:7b`, running locally in [Ollama](https://ollama.com))

## Project structure

```
backend/    Express API (TypeScript, run directly by Node)
  src/server.ts            server and the POST /get-description route
  src/image.ts             image format detection
  src/describers/          one file per AI + index.ts registry
frontend/   React + Vite single-page app
```

In production the backend also serves the built frontend, so the whole app runs on one port.

## Requirements

- Node.js 22.18+ or 24+ (runs `.ts` files directly)
- For Claude: an Anthropic API key
- For Qwen: Ollama running with the model pulled: `ollama pull qwen2.5vl:7b`

## Setup

```sh
npm run install:all
cp backend/.env.example backend/.env   # then add your ANTHROPIC_API_KEY
```

### Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | `backend/.env` | – | Needed for `ai: "claude"` |
| `OLLAMA_URL` | `backend/.env` | `http://localhost:11434` | Ollama server for `ai: "qwen"` |
| `PORT` | `backend/.env` | `3000` | Backend port |
| `API_URL` | `frontend/.env.development` | `http://localhost:3000` | Backend address for the dev-server proxy |

## Development

Run the backend and the frontend in two terminals:

```sh
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:5173 (proxies API calls to the backend)
```

Open http://localhost:5173.

Checks:

```sh
npm run typecheck
npm run lint
```

## Production

```sh
npm run build   # installs dependencies and builds the frontend into frontend/dist
npm start       # serves the app and the API on PORT
```

Set `ANTHROPIC_API_KEY` (and optionally `OLLAMA_URL`, `PORT`) in the host's environment instead of a `.env` file.

## API

`POST /get-description` with a JSON body:

```json
{ "ai": "claude", "image": "<base64 or data URL>" }
```

- `ai`: `"claude"` or `"qwen"`
- `image`: a JPEG, PNG, GIF or WebP image, as base64 or a `data:` URL (max 10 MB request)

Responses:

| Status | Body |
|---|---|
| `200` | The description as plain text |
| `400` | Unsupported `ai`, missing or invalid image, or unsupported image format |
| `413` | Request larger than 10 MB |
| `500` | The AI call failed (details in the server log) |

