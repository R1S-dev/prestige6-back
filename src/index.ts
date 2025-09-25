import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import settingsRouter from "./routes/settings";
import roundsRouter from "./routes/rounds";
import streamRouter from "./routes/stream";
import { live } from "./live";

const app = express();
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.send("OK"));
app.use("/api", streamRouter);             // /api/stream, /api/live/state
app.use("/api/settings", settingsRouter);
app.use("/api/rounds", roundsRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("ERR:", err?.message || err);
  res.status(400).send(err?.message || "Bad Request");
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`🚀 API ready at http://localhost:${PORT}`);
  live.start(); // heartbeat
});
