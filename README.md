# CodeShift Web

CodeShift Web is the React and TypeScript frontend for CodeShift, an AI-assisted code-transpilation app. It connects to the CodeShift FastAPI backend to convert pasted code or uploaded source files, then displays generated output and relevant validation or request status.

## Features

- Paste code or upload a source file for transpilation.
- Select Python or Go as the source and target language in the current interface.
- Swap source and target languages in the paste-code workflow.
- Request output validation and use or bypass caching where supported.
- View generated code, validation details, cache status, errors, and elapsed time.
- Edit and inspect code in Monaco-powered editors.

## Tech stack

- React 19 and TypeScript
- Vite
- Monaco Editor (`@monaco-editor/react`)

## Requirements

- Node.js and npm compatible with the versions used by this project.
- A running CodeShift backend, locally or deployed, reachable by the browser.

## Run locally

Run these commands from the frontend project directory:

```bash
npm install
cp .env.example .env.development
```

Set the backend URL in `.env.development`. For a local backend listening on port 8080:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). Run the backend separately; consult the backend project's README for its setup and required services.

## Configuration

The frontend reads `VITE_API_BASE_URL` as the base URL for API requests. Set it in `.env.development` for local work or `.env.production` for production builds.

Vite variables prefixed with `VITE_` are included in browser-side code. Do not store secrets or private API keys in frontend environment files. The browser must be able to reach the configured backend, and the backend must allow the frontend origin through CORS.

## Backend API

| Workflow | Endpoint | Request |
| --- | --- | --- |
| Paste Code | `POST /api/v1/transpile-raw` | Plain-text code body; source and target languages plus validation and cache options are query parameters |
| Upload File | `POST /api/v1/transpile-file` | Multipart form containing the file, target language, and cache option |

The raw-code endpoint returns generated code as text and may include `X-Cached` and `X-Validation` response headers. The file endpoint returns JSON containing the success status, output filename and path, validation message, and cache status.

## Available scripts

Run from the frontend project directory:

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and build for production
npm run preview  # Preview the production build locally
npm run lint     # Run Oxlint
```

## Project structure

```text
src/
  api/          Backend request functions
  components/   Editors, language controls, upload, and output UI
  hooks/        Transpilation request state and lifecycle
  lib/          Shared frontend utilities
  styles/       Application and editor-pane styles
  types/        Shared TypeScript types
  App.tsx       Main app layout and workflow selection
  main.tsx      React application entry point
```
