import axios, { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';
import { Product, ScrapeResult, AmazonScraperService } from '../interface';

export class AmazonScraper implements AmazonScraperService {

  // Define the headers to be used in the HTTP request readonly because it should not be modified
    private readonly headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    };


    // Define the scrapeProducts method that fetches the Amazon page and parses the HTML content
    async scrapeProducts(keyword: string): Promise<ScrapeResult> {
        // Validate the keyword parameter
        if (!keyword || keyword.trim() === '') {
            // Return an error response if the keyword is missing or empty
            return {
                success: false,
                error: {
                    message: 'Keyword parameter is required and cannot be empty'
                }
            };
        }

        try {
          // Define the Amazon URL with the encoded keyword and fetch the page content
            const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}&page=1`;
            const response = await axios.get(amazonUrl, { headers: this.headers });
            
            // Parse the HTML content and return the result
            return this.parseHtml(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    // private method should be called only from the class and parse the html content with JSDOM
    private parseHtml(html: string): ScrapeResult {
        try {
            const dom = new JSDOM(html);
            // Extract the document object from the JSDOM instance
            const document = dom.window.document;

            // Select all product elements and parse the title, rating, review count, and image URL and map them to an array of Product objects
            const products = Array.from(document.querySelectorAll('.s-result-item'))
                .map((element): Product | null => {
                    try {
                        // Extract the title, rating, review count, and image URL from the product element
                        const title = element.querySelector('h2 a span')?.textContent?.trim() || 'N/A';
                        const rating = element.querySelector('.a-icon-star-small .a-icon-alt')?.textContent?.trim().split(' ')[0] || 'N/A';
                        const reviewCount = element.querySelector('.a-size-small .a-link-normal')?.textContent?.trim() || '0';
                        const imageUrl = element.querySelector('.s-image')?.getAttribute('src') || 'N/A';

                        return title !== 'N/A' ? { title, rating, reviewCount, imageUrl } : null;
                    } catch (error) {
                        console.error('Error parsing product element:', error);
                        return null;
                    }
                })// Filter out any null values from the array
                .filter((product): product is Product => product !== null);

            return {
                success: true,
                data: products
            };
        } catch (error) {
            console.error('Error parsing HTML:', error);
            return {
                success: false,
                error: {
                    message: 'Failed to parse Amazon page content',
                    details: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }

    // private method should be called only from the class and handle the error if axios fails to fetch the page
    private handleError(error: unknown): ScrapeResult {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            
            return {
                success: false,
                error: {
                    message: 'Failed to fetch Amazon page',
                    details: {
                        status: axiosError.response?.status,
                        statusText: axiosError.response?.statusText,
                        message: axiosError.message
                    }
                }
            };
        }

        return {
            success: false,
            error: {
                message: 'An unexpected error occurred',
                details: error instanceof Error ? error.message : String(error)
            }
        };
    }
}