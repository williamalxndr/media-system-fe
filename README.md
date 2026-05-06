# Frontend

Next.js client for the `/watch?token=...` flow.

## Structure

- `src/app`: App Router routes, layouts, and route-level loading/error files.
- `src/features`: Domain feature modules. Keep API calls, hooks, components, and types near the feature.
- `src/shared`: Reusable components, config, utilities, and cross-feature types.

## Local Setup

```bash
cd frontend
nvm use
npm install
npm run dev
```
