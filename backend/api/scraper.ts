import axios from "axios";
import { JSDOM } from "jsdom";

// Define interface for product structure
export interface AmazonProduct {
  title: string;
  rating: number | null;
  reviewsCount: number | null;
  imageUrl: string;
}

//randomize user agents for header to avoid blocking
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
];

const randomDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000));

// headers to mimic a browser request
const randomHeaders = () => ({
  "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  Referer: "https://www.amazon.com/",
  "Upgrade-Insecure-Requests": "1",
});

export async function scrapeAmazonProducts(
  keyword: string
): Promise<AmazonProduct[]> {
  try {
    //avoid fast requests to avoid blocking
    await randomDelay();
    // Encode the keyword for URL
    const encodedKeyword = encodeURIComponent(keyword);

    const response = await axios.get(
      `https://www.amazon.com/s?k=${encodedKeyword}`,
      {
        headers: randomHeaders(),
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.data.includes("Enter the characters you see below")) {
      throw new Error("CAPTCHA detected");
    }

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const products: AmazonProduct[] = [];

    // Select product cards
    const productCards = document.querySelectorAll(
      '[class="s-product-image-container aok-relative s-text-center s-image-overlay-grey puis-image-overlay-grey s-padding-left-small s-padding-right-small puis-spacing-small s-height-equalized puis puis-vaea7rvosgazv2d9dwv7m1j59w"]'
    );

    productCards.forEach((card) => {
      try {
        // Product Title
        const titleElement = card.querySelector(
          ".a-size-base-plus a-spacing-none a-color-base a-text-normal"
        );
        const title = titleElement
          ? titleElement.textContent?.trim() || "N/A"
          : "N/A";

        // Rating
        const ratingElement = card.querySelector(
          ".a-icon a-icon-star-small a-star-small-4-5"
        );
        const ratingText = ratingElement
          ? ratingElement.textContent?.split(" ")[0]
          : null;
        const rating = ratingText ? parseFloat(ratingText) : null;

        // Number of Reviews
        const reviewsElement = card.querySelector(
          ".a-size-base s-underline-text"
        );
        const reviewsText = reviewsElement
          ? reviewsElement.textContent?.replace(/,/g, "")
          : null;
        const reviewsCount = reviewsText ? parseInt(reviewsText) : null;

        // Product Image
        const imageElement = card.querySelector(
          "img.s-image"
        ) as HTMLImageElement;
        const imageUrl = imageElement ? imageElement.src : "N/A";

        // Only add products with a title
        if (title !== "N/A") {
          products.push({
            title,
            rating,
            reviewsCount,
            imageUrl,
          });
        }
      } catch (cardError) {
        console.error("Error processing product card:", cardError);
      }
    });

    return products;
  } catch (error) {
    console.error("Comprehensive scraping error:", error);
    throw error;
  }
}
