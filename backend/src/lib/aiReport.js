import fetch from "node-fetch";

/**
 * Generates a plain-English summary of an SEO analysis.
 * If OPENAI_API_KEY is set, asks an LLM to write it.
 * Otherwise falls back to a rule-based summary so the feature
 * still works end-to-end without any external key.
 */
export async function generateAiSummary(analysis) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return ruleBasedSummary(analysis);
  }

  try {
    const failed = analysis.checks.filter((c) => !c.pass);
    const passed = analysis.checks.filter((c) => c.pass);

    const prompt = `You are an SEO consultant. Given this on-page SEO audit for ${analysis.url} (score ${analysis.score}/100), write a short, plain-English summary (max 120 words) with:
1. One sentence overall verdict
2. Top 3 priority fixes, ordered by impact

Passed checks: ${passed.map((c) => c.label).join(", ") || "none"}
Failed checks: ${failed.map((c) => `${c.label} (${c.detail})`).join("; ") || "none"}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
      timeout: 20000,
    });

    if (!response.ok) {
      console.error("AI summary request failed:", response.status);
      return ruleBasedSummary(analysis);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || ruleBasedSummary(analysis);
  } catch (err) {
    console.error("AI summary error:", err.message);
    return ruleBasedSummary(analysis);
  }
}

function ruleBasedSummary(analysis) {
  const failed = analysis.checks.filter((c) => !c.pass).sort((a, b) => b.weight - a.weight);
  const verdict =
    analysis.score >= 80
      ? "This page is in strong shape for SEO."
      : analysis.score >= 50
      ? "This page has a solid foundation but is leaving ranking potential on the table."
      : "This page has significant SEO gaps that are likely hurting its search visibility.";

  const topFixes = failed.slice(0, 3).map((c, i) => `${i + 1}. ${c.label} — ${c.detail}`);

  return [
    `${verdict} (Score: ${analysis.score}/100)`,
    topFixes.length ? "Priority fixes:" : "No major issues found — nice work.",
    ...topFixes,
  ].join("\n");
}
