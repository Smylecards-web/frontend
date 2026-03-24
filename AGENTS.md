<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Smylecards frontend conventions

- **Theme (dark-first):** The app defaults to **dark mode**. `ThemeProvider` from `@/components/theme` wraps the tree (`next-themes`, `defaultTheme="dark"`, `enableSystem`). The `html` element gets `class="dark"` or `class="light"` — use Tailwind `dark:` where you need dark-specific utilities; base styles apply in light mode. Prefer semantic `bg-background` / `text-foreground` and CSS variables from `globals.css`. Mirror important colors in `theme.ts` for inline styles or JS.
- **Images:** Always use `next/image` (`Image`) for raster assets and SVGs shown in the UI. Prefer `fill` with a sized parent when cropping or overlaying; set sensible `sizes` for responsive layouts. Avoid raw `<img>` unless there is a documented exception (e.g. a third-party requirement).
- **Modularity:** Build screens from small, focused components under `components/` (grouped by feature or domain). Keep page files thin: compose existing pieces, shared layout, and data from `content/` or similar rather than inlining large JSX trees.
- **Routing:** Use Next.js App Router under `app/`; keep layout/data structure in server components and form/interactive state in client components.
- **State + API (RTK standard):** Use Redux Toolkit + RTK Query for all API communication and caching. No direct `fetch`/`axios` in UI components.
- **Module naming:** Use `modules/[module]/` (not `features/`), aligned to backend domains (`auth`, `event`, `user`, etc.).
- **Module structure:** Prefer dot notation per domain: `[module].api.ts`, `[module].slice.ts`, `[module].types.ts`, optional `[module].model.ts`, and **`[module].schema.ts`** for **Zod** validation (client-side only).
- **Validation:** Define input rules in **`[module].schema.ts`** with Zod. Parse with `.safeParse()` before RTK calls when you want fast UX feedback. The Laravel **`FormRequest`** remains authoritative for API validation — keep those rules in sync with the Zod schemas when fields overlap.
- **Types rule (strict):** Keep transport/domain types in `*.types.ts`; you may `z.infer<typeof schema>` in `*.schema.ts` for form/input types. Do not declare module types in API or slice files.
- **Slice scope:** Slices are for UI/session/global app state only. Server/API data stays in RTK Query cache.
- **API base + tags:** Centralize transport in `services/api/baseApi.ts` (uses `baseQueryWithEnvelope` to unwrap `{ success, message, data }`); inject endpoints via module API files; keep tag constants centralized in `constants/tagTypes.ts`.
- **API contract:** Backend returns `success`, `message`, and `data`. Type RTK endpoint results as the **inner `data` payload** only; on failure, read `message` / `data` from `error` when the server returns the envelope (see `services/api/api.types.ts`).
- **IDs:** Treat resource `id` fields as **strings (UUID)** to match the Laravel schema.
