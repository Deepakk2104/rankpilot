import fetch from "node-fetch";
import * as cheerio from "cheerio";

/**
 * Fetches a URL and runs a set of on-page SEO checks against it.
 * Returns raw findings plus a 0-100 score.
 */
export async function analyzeUrl(rawUrl) {
  const url = normalizeUrl(rawUrl);

  const start = Date.now();
  const response = await fetch(url, {
    headers: { "User-Agent": "RankPilotBot/1.0 (+https://rank-pilot.app)" },
    redirect: "follow",
    timeout: 15000,
  });
  const loadTimeMs = Date.now() - start;

  if (!response.ok) {
    throw new Error(`Site responded with status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const checks = [];
  let score = 0;
  const maxScore = 100;

  // --- Title tag ---
  const title = $("title").first().text().trim();
  addCheck(checks, {
    id: "title",
    label: "Title tag",
    pass: title.length > 0 && title.length <= 60,
    detail: title
      ? `"${truncate(title, 80)}" (${title.length} chars)`
      : "Missing <title> tag",
    weight: 15,
  });

  // --- Meta description ---
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
  addCheck(checks, {
    id: "meta_description",
    label: "Meta description",
    pass: metaDescription.length > 0 && metaDescription.length <= 160,
    detail: metaDescription
      ? `${metaDescription.length} chars`
      : "Missing meta description",
    weight: 12,
  });

  // --- H1 usage ---
  const h1s = $("h1");
  addCheck(checks, {
    id: "h1",
    label: "Single H1 heading",
    pass: h1s.length === 1,
    detail: `${h1s.length} <h1> tag(s) found`,
    weight: 10,
  });

  // --- Heading hierarchy (has at least some H2s for structure) ---
  const h2Count = $("h2").length;
  addCheck(checks, {
    id: "headings",
    label: "Heading structure",
    pass: h2Count > 0,
    detail: `${h2Count} <h2> tag(s) found`,
    weight: 6,
  });

  // --- Image alt attributes ---
  const images = $("img");
  const imagesMissingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;
  addCheck(checks, {
    id: "image_alt",
    label: "Image alt attributes",
    pass: images.length === 0 || imagesMissingAlt === 0,
    detail: `${imagesMissingAlt}/${images.length} images missing alt text`,
    weight: 10,
  });

  // --- Canonical tag ---
  const canonical = $('link[rel="canonical"]').attr("href");
  addCheck(checks, {
    id: "canonical",
    label: "Canonical tag",
    pass: Boolean(canonical),
    detail: canonical ? canonical : "No canonical tag found",
    weight: 6,
  });

  // --- Viewport / mobile friendliness ---
  const viewport = $('meta[name="viewport"]').attr("content");
  addCheck(checks, {
    id: "viewport",
    label: "Mobile viewport tag",
    pass: Boolean(viewport),
    detail: viewport || "No viewport meta tag found",
    weight: 8,
  });

  // --- Open Graph tags ---
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  addCheck(checks, {
    id: "open_graph",
    label: "Open Graph tags",
    pass: Boolean(ogTitle && ogDescription),
    detail: ogTitle && ogDescription ? "og:title and og:description present" : "Missing og:title/og:description",
    weight: 6,
  });

  // --- HTTPS ---
  addCheck(checks, {
    id: "https",
    label: "Served over HTTPS",
    pass: url.startsWith("https://"),
    detail: url.startsWith("https://") ? "Site uses HTTPS" : "Site does not use HTTPS",
    weight: 10,
  });

  // --- Word count / content depth ---
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(" ").filter(Boolean).length;
  addCheck(checks, {
    id: "word_count",
    label: "Content length",
    pass: wordCount >= 300,
    detail: `${wordCount} words on page`,
    weight: 8,
  });

  // --- Links (internal/external ratio, just informational) ---
  const links = $("a[href]");
  const internalLinks = links.filter((_, el) => {
    const href = $(el).attr("href") || "";
    return href.startsWith("/") || href.includes(new URL(url).hostname);
  }).length;
  addCheck(checks, {
    id: "internal_links",
    label: "Internal linking",
    pass: internalLinks > 0,
    detail: `${internalLinks} internal link(s), ${links.length} total link(s)`,
    weight: 5,
  });

  // --- Page load time (very rough signal) ---
  addCheck(checks, {
    id: "load_time",
    label: "Response time",
    pass: loadTimeMs < 1500,
    detail: `${loadTimeMs}ms to fetch HTML`,
    weight: 4,
  });

  score = Math.round(
    checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0)
  );

  return {
    url,
    score: Math.min(score, maxScore),
    checks,
    meta: {
      title,
      metaDescription,
      wordCount,
      loadTimeMs,
      analyzedAt: new Date().toISOString(),
    },
  };
}

function addCheck(list, check) {
  list.push(check);
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

function normalizeUrl(input) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  // Throws if invalid, which we want — caller handles the error.
  new URL(url);
  return url;
}
