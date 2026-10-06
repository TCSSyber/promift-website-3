import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "./bindings.server";

const quoteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().max(160).optional(),
  project: z.string().trim().min(1).max(80),
  details: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(40).optional(),
});

/** Stores a free-quote request in D1. Server-only. */
export const submitQuote = createServerFn({ method: "POST" })
  .validator(quoteSchema)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "unavailable" as const };
    await DB.prepare(
      "INSERT INTO quote_requests (name, phone, email, project, details, source) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )
      .bind(
        data.name,
        data.phone,
        data.email || null,
        data.project,
        data.details || null,
        data.source || null,
      )
      .run();
    return { ok: true as const };
  });
