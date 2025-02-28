import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Use ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

const coffeeTableColumns = {
    productPageUrl: 'product_page_url', // Corrected name
    name: 'name',
    description: 'description',
    imageUrl: 'image_url',
    origin: 'origin',
    region: 'region',
    producer: 'producer',
    varieties: 'varieties',
    processing: 'processing',
    cropYear: 'crop_year',
    altitude: 'altitude',
    roastLevel: 'roast_level',
    flavorNotes: 'flavor_notes',
    roaster: 'roaster',
    batchSize: 'batch_size',
    endTemperature: 'end_temperature',
    time: 'time',
    aboutSections: 'about_sections',
    availability: 'availability',
};

async function fetchWithRetry(url, maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            retries++;
            console.error(`Attempt ${retries} failed for ${url}:`, error);
            if (retries === maxRetries) {
                throw error;
            }
            const delay = 2 ** retries * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function scrapeAmokkaCoffees() {
    try {
        const collectionResponse = await fetchWithRetry('https://amokka.com/en/collections/coffee');
        const collectionHtml = collectionResponse; // Corrected .text() removal
        const $collection = cheerio.load(collectionHtml);

        const coffeeLinks = [];
        $collection('a[href^="/en/products/"]').each((i, el) => {
            const relativeUrl = $collection(el).attr('href');
            if (relativeUrl.includes("coffee") || relativeUrl.includes("blend")) {
                const fullUrl = new URL(relativeUrl, 'https://amokka.com').href;
                coffeeLinks.push(fullUrl);
            }
        });

        // Fetch existing product URLs from Supabase *before* scraping
        const { data: existingProducts, error: existingProductsError } = await supabase
            .from('Coffees') // Correct table name
            .select(coffeeTableColumns.productPageUrl); // Use the constant

        if (existingProductsError) {
            console.error("Error fetching existing products:", existingProductsError);
            throw existingProductsError; // Handle the error
        }

        const existingProductUrls = existingProducts.map(product => product[coffeeTableColumns.productPageUrl]);

        // Filter the scraped links to ONLY include new products
        const newCoffeeLinks = coffeeLinks.filter(link => !existingProductUrls.includes(link));

        // Process only the NEW coffee links
        const promises = newCoffeeLinks.map(async (coffeeUrl) => {
            try {
                const html = await fetchWithRetry(coffeeUrl);
                const $ = cheerio.load(html);

                const name = $("h1.product-title.h3").text().trim();
                const description = $("div.product-info__block-item[data-block-type='description'] div.prose").text().trim();

                // Image URL (Set to null for now)
                let image_url = null;

                // --- Coffee Details
            } catch (error) {
                console.error("Error scraping coffee details:", error);
            }
        });

        await Promise.all(promises);

    } catch (error) {
        console.error("Error scraping Amokka coffees:", error);
    }
}
