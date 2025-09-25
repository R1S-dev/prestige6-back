// src/routes/tickets.ts
import { Router } from "express";

const router = Router();

/**
 * Stub ruta za tickets – trenutno samo health.
 * Kasnije ovde dodaj: POST /, GET /:id, itd.
 */
router.get("/health", (_req, res) => {
  res.json({ ok: true, area: "tickets", msg: "tickets router ready" });
});

export default router;
