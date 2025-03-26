//interfaces to define the shape of the data that we will be working with

export interface Product {
    title: string;
    rating: string;
    reviewCount: string;
    imageUrl: string;
}

export interface ScrapeResult {
    success: boolean;
    data?: Product[];
    error?: {
        message: string;
        details?: any;
    };
}

export interface AmazonScraperService {
    scrapeProducts(keyword: string): Promise<ScrapeResult>;
}