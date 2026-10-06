// Netlify build only: stands in for the Cloudflare-only `cloudflare:workers`
// module. On Netlify there are no Cloudflare bindings (no D1 database), so
// `env` is empty and the quote form posts to Netlify Forms instead.
export const env: Record<string, unknown> = {};
