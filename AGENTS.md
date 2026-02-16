# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/`.
- UI components are under `src/components/`, with calendar layouts in `src/components/views/`.
- Shared state is managed in `src/contexts/CalendarContext.tsx`.
- Reusable helpers (for example colors) are in `src/utils/`.
- Static assets and HTML shell files are in `public/`.
- Example planner data is in `examples/demo.json`; screenshots/docs are in `docs/`.
- Production container setup is defined by `Dockerfile` and `compose.yml`.

## Build, Test, and Development Commands
- `bun install`: install dependencies for local development.
- `bun run dev`: start the React dev server at `http://localhost:3000`.
- `bun run build`: create an optimized production build in `build/`.
- `bun install --frozen-lockfile`: CI-safe install using the committed Bun lockfile.
- `docker compose up --build`: build and run the containerized app (maps `3000 -> 80`).

## Coding Style & Naming Conventions
- Language stack: TypeScript + React function components.
- Formatting is enforced by `.prettierrc`: 2-space indentation, no semicolons, double quotes, trailing commas (`es5`), `printWidth` 120.
- Component files use `PascalCase` (for example `CalendarTitle.tsx`); utility modules use lowercase names (for example `colors.ts`).
- Keep view-specific UI logic inside `src/components/views/` and shared logic in `contexts` or `utils`.

## Testing Guidelines
- No automated test suite is currently configured (`bun test` is not defined).
- For changes, run at minimum:
  - `bun run build` to catch type/build regressions.
  - Manual UI verification in `bun run dev` across key calendar interactions (coloring days, editing text, save/load).
- If adding tests, prefer co-located `*.test.ts(x)` files and React Testing Library conventions.

## Commit & Pull Request Guidelines
- Follow concise, imperative commit subjects; existing history commonly uses prefixes like `fix:` and `feat:`.
- Keep commits focused to one logical change.
- PRs should include:
  - Clear summary of behavior changes.
  - Linked issue(s) when relevant.
  - Screenshots/GIFs for UI-affecting changes.
  - Notes on manual verification steps performed.
