import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = new Date().toISOString().split("T")[0];
        const routes = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/kitchen-renovation", changefreq: "monthly", priority: "0.9" },
          { path: "/custom-millwork", changefreq: "monthly", priority: "0.9" },
          { path: "/quote", changefreq: "monthly", priority: "0.8" },
        ];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...routes.flatMap((route) => [
            "  <url>",
            `    <loc>${origin}${route.path}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${route.changefreq}</changefreq>`,
            `    <priority>${route.priority}</priority>`,
            "  </url>",
          ]),
          "</urlset>",
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
