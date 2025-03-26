import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { scrapeAmazonProducts } from "./scraper";

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS with more specific options
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Adjust as needed
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic rate limiting middleware
const requestLimiter = (() => {
  const requests: Record<string, number> = {};
  const RATE_LIMIT = 10; // Max 10 requests per minute
  const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || "127.0.0.1";
    const now = Date.now();

    if (requests[ip]) {
      const timeSinceLastRequest = now - requests[ip];
      if (timeSinceLastRequest < RATE_WINDOW) {
        res.status(429).json({
          error: "Too many requests. Please wait a moment.",
        });
        return;
      }
    }

    requests[ip] = now;
    next();
  };
})();

app.get("/api/scrape", requestLimiter, async (req, res) => {
  try {
    const keyword = req.query.keyword as string;

    if (!keyword) {
      res.status(400).json({ error: "Keyword is required" });
      return;
    }

    const products = await scrapeAmazonProducts(keyword);
    res.json(products);
    return;
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({
      error: "Failed to scrape Amazon",
      details: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Server shutting down gracefully");
  process.exit(0);
});
