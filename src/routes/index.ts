// src/routes/index.ts
import { Router } from "express";
import streamRouter from "./stream";
import settingsRouter from "./settings";
import roundsRouter from "./rounds";

const api = Router();

api.get("/", (_req, res) => res.json({ ok: true, msg: "LuckySix API radi!" }));

api.use(streamRouter);             // /api/stream i /api/live/state
api.use("/settings", settingsRouter);
api.use("/rounds", roundsRouter);

export default api;
