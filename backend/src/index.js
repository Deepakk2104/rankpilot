import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import analyzeRoutes from "./routes/analyze.js";
import keywordRoutes from "./routes/keywords.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

console.log("Allowed CORS origins:", allowedOrigins);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/analyze", requireAuth, analyzeRoutes);
app.use("/api/keywords", requireAuth, keywordRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`RankPilot API listening on port ${PORT}`));