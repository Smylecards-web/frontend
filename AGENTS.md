<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Smylecards frontend conventions

- **Theme (dark-first):** The app defaults to **dark mode**. `ThemeProvider` from `@/components/theme` wraps the tree (`next-themes`, `defaultTheme="dark"`, `enableSystem`). The `html` element gets `class="dark"` or `class="light"` — use Tailwind `dark:` where you need dark-specific utilities; base styles apply in light mode. Prefer semantic `bg-background` / `text-foreground` and CSS variables from `globals.css`. Mirror important colors in `theme.ts` for inline styles or JS.
- **Images:** Always use `next/image` (`Image`) for raster assets and SVGs shown in the UI. Prefer `fill` with a sized parent when cropping or overlaying; set sensible `sizes` for responsive layouts. Avoid raw `<img>` unless there is a documented exception (e.g. a third-party requirement).
- **Modularity:** Build screens from small, focused components under `components/` (grouped by feature or domain). Keep page files thin: compose existing pieces, shared layout, and data from `content/` or similar rather than inlining large JSX trees.
