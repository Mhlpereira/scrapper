import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { scrapeAmazonProducts } from "./scraper";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
//recieve requests from the frontend
app.get('/api/scrape', async (request, response) => {
    const keyword = request.query.keyword;
    if (!keyword) {
        return response.status(400).json({ error: 'Keyword is required' });
    }

    // Call the scraper function and return the results
    try {
        const products = await scraper(keyword);
        response.json(products);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});