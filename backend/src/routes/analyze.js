import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { analyzeUrl } from "../lib/seoAnalyzer.js";
import { generateAiSummary } from "../lib/aiReport.js";

const router = Router();

// POST /api/analyze  { url }
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const analysis = await analyzeUrl(url);
    const aiSummary = await generateAiSummary(analysis);

    const report = await prisma.report.create({
      data: {
        url: analysis.url,
        score: analysis.score,
        data: analysis,
        aiSummary,
        userId: req.userId,
      },
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to analyze that URL" });
  }
});

// GET /api/analyze/reports - list past reports for the logged-in user
router.get("/reports", async (req, res) => {
  const reports = await prisma.report.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, score: true, createdAt: true },
  });
  res.json(reports);
});

// GET /api/analyze/reports/:id - full detail for one report
router.get("/reports/:id", async (req, res) => {
  const report = await prisma.report.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.json(report);
});

export default router;
