// src/routes/stream.ts
import { Router } from "express";
import { live } from "../live";

const router = Router();

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  // pošalji trenutni state odmah
  res.write(`event: state\ndata: ${JSON.stringify(live.getState())}\n\n`);

  const un = live.subscribe((snap) => {
    res.write(`event: state\ndata: ${JSON.stringify(snap)}\n\n`);
  });

  req.on("close", () => un());
});

router.get("/live/state", (_req, res) => {
  res.json({ live: live.getState() });
});

export default router;
