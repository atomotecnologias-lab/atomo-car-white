import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listVehicles } from "@/services/vehiclesService";

const BASE_URL = "https://atomocar.com.br";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/estoque", changefreq: "daily", priority: "0.9" },
          { path: "/financiamento", changefreq: "monthly", priority: "0.7" },
          { path: "/venda-seu-veiculo", changefreq: "monthly", priority: "0.7" },
          { path: "/sobre", changefreq: "monthly", priority: "0.5" },
          { path: "/contato", changefreq: "monthly", priority: "0.6" },
          { path: "/politica-de-privacidade", changefreq: "yearly", priority: "0.3" },
        ];

        let vehicleEntries: SitemapEntry[] = [];
        try {
          const vehicles = await listVehicles();
          vehicleEntries = vehicles
            .filter((v) => v.status === "active" || v.status === "reserved")
            .map((v) => ({
              path: `/veiculo/${v.slug}`,
              changefreq: "weekly" as const,
              priority: "0.8",
            }));
        } catch {
          // sitemap should never fail
        }

        const entries = [...staticEntries, ...vehicleEntries];
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
