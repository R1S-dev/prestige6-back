// src/routes/live.ts
import { Router } from "express";
import { live } from "../live";

const router = Router();

/** JSON snapshot za inicijalni load klijenta */
router.get("/live/state", async (_req, res, next) => {
  try {
    const st = await live.getState();
    res.json(st);
  } catch (e) {
    next(e);
  }
});

/** SSE stream za real-time push */
router.get("/stream", async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (type: string, payload: any) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    // inicijalno stanje
    const snapshot = await live.getState();
    send("live_state", snapshot);

    const unsubscribe = live.subscribe((ev) => {
      send(ev.type, ev.payload);
    });

    req.on("close", () => {
      unsubscribe();
      res.end();
    });
  } catch (e) {
    next(e);
  }
});

export default router;
