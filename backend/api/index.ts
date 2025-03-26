import express from 'express';
import { AmazonScraper } from '../api/service/scrapeService';
import { ScrapeResult } from '../api/interface';

const app = express();
const port = 3000;
const scraper = new AmazonScraper();

// Enable JSON body parsing
app.use(express.json());    

// Define the /api/scrape route with get method
app.get('/api/scrape', async (req, res) => {
    // Extract the keyword from the query string
    const keyword = req.query.keyword as string;
    
    // Call the scrapeProducts method and wait for the result
    const result: ScrapeResult = await scraper.scrapeProducts(keyword);
    
    // Verify the result and send the response
    if (result.success) {
        res.json({ products: result.data });
    } else {
        res.status(result.error?.details?.status || 500).json({
            error: result.error?.message,
            details: result.error?.details
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});