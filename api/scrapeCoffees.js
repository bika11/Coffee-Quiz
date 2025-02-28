import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Ensure correct path to .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Use ANON_KEY and set up RLS
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ADD THIS ---
const coffeeTableColumns = {
  productPageUrl: 'product_page_url',
  name: 'name',
  description: 'description',
  imageUrl: 'image_url',
  origin: 'origin',
  region: 'region',
  producer: 'producer',
  varieties: 'varieties',
  processing: 'processing',
  cropYear: 'crop_year',  // Use underscores consistently
  altitude: 'altitude',
  roastLevel: 'roast_level',  // Use underscores consistently
  flavorNotes: 'flavor_notes', // Use underscores consistently
  roaster: 'roaster',
  batchSize: 'batch_size',  // Use underscores consistently
  endTemperature: 'end_temperature',  // Use underscores consistently
  time: 'time',
  aboutSections: 'about_sections', // Use underscores consistently
  availability: 'availability',
};
// --- END ADD ---

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
            const delay = 2 ** retries * 1000; // Exponential backoff (1s, 2s, 4s)
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function scrapeAmokkaCoffees() {
    try {
        const collectionResponse = await fetchWithRetry('https://amokka.com/en/collections/coffee');
        const collectionHtml = await collectionResponse.text(); // Use .text() here
        const $collection = cheerio.load(collectionHtml);

        const coffeeLinks = [];
        $collection('a[href^="/en/products/"]').each((i, el) => {
            const relativeUrl = $collection(el).attr('href');
            // Filter to only include coffee products (good practice)
            if (relativeUrl.includes("coffee") || relativeUrl.includes("blend")) {
                const fullUrl = new URL(relativeUrl, 'https://amokka.com').href;
                coffeeLinks.push(fullUrl);
            }
        });

        // Fetch existing product URLs from Supabase *before* scraping
        const { data: existingProducts, error: existingProductsError } = await supabase
            .from('Coffees') // Your table name
            .select(coffeeTableColumns.productPageUrl); // Use the constant

        if (existingProductsError) {
            console.error("Error fetching existing products:", existingProductsError);
            throw existingProductsError; // Handle the error appropriately
        }

        // Create an array of existing product URLs
        const existingProductUrls = existingProducts.map(product => product[coffeeTableColumns.productPageUrl]); // Use the constant

        // Filter the scraped links to ONLY include new products
        const newCoffeeLinks = coffeeLinks.filter(link => !existingProductUrls.includes(link));

        // Process only the NEW coffee links
        const promises = newCoffeeLinks.map(async (coffeeUrl) => {
            try {
                const html = await fetchWithRetry(coffeeUrl);
                const $ = cheerio.load(html);

                const name = $("h1.product-title.h3").text().trim();
                const description = $("div.product-info__block-item[data-block-type='description'] div.prose").text().trim();

                // Corrected image selector
                let imageUrl = $("div.product-gallery__image img").attr("src");
                if (imageUrl && !imageUrl.startsWith("https:")) {
                  imageUrl = "https:" + imageUrl; // Prepend https:
                }

                // --- Coffee Details ---
                let coffeeDetails = {};
                $('details.accordion__disclosure:contains("Coffee Details")').find('.accordion__content p').each((i, el) => {
                    const strongText = $(el).find('strong').text().trim();
                    const detailText = $(el).text().trim().replace(strongText, '').trim();
                    if (strongText === 'Origin') coffeeDetails.origin = detailText;
                    if (strongText === 'Region') coffeeDetails.region = detailText;
                    if (strongText === 'Producer') coffeeDetails.producer = detailText;
                    if (strongText === 'Varieties') coffeeDetails.varieties = detailText;
                    if (strongText === 'Processing') coffeeDetails.processing = detailText;
                    if (strongText === 'Crop Year') coffeeDetails.crop_year = detailText; // Use snake_case
                    if (strongText === 'Altitude') coffeeDetails.altitude = detailText;
                });

                // --- Roasting Details ---
                let roastingDetails = {};
                $('details.accordion__disclosure:contains("Roasting Details")').find('.accordion__content p').each((i, el) => {
                    const strongText = $(el).find('strong').text().trim();
                    const detailText = $(el).text().trim().replace(strongText, '').trim();
                    if (strongText === 'Roast level') roastingDetails.roast_level = detailText; // Use snake_case
                    if (strongText === 'Flavour Notes') roastingDetails.flavor_notes = detailText; // Use snake_case
                    if (strongText === 'Roaster') roastingDetails.roaster = detailText;
                    if (strongText === 'Batch Size') roastingDetails.batch_size = detailText; // Use snake_case
                    if (strongText === 'End Temperature') roastingDetails.end_temperature = detailText; // Use snake_case
                    if (strongText === 'Time') roastingDetails.time = detailText;
                });

                // --- About Sections ---
                let aboutSections = {};
                $('details.accordion__disclosure').each((i, el) => {
                    const summaryText = $(el).find('summary .text-with-icon').text().trim();
                    if (summaryText.startsWith('About')) {
                        const aboutText = $(el).find('.accordion__content.prose').text().trim();
                        aboutSections[summaryText] = aboutText;
                    }
                });

                const availability = $(".product-form__submit-label").text().trim();


              await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
                return {
                    [coffeeTableColumns.name]: name,  // Use the constants
                    [coffeeTableColumns.description]: description,
                    [coffeeTableColumns.imageUrl]: imageUrl,
                    [coffeeTableColumns.productPageUrl]: coffeeUrl,
                    [coffeeTableColumns.origin]: coffeeDetails.origin,
                    [coffeeTableColumns.region]: coffeeDetails.region,
                    [coffeeTableColumns.producer]: coffeeDetails.producer,
                    [coffeeTableColumns.varieties]: coffeeDetails.varieties,
                    [coffeeTableColumns.processing]: coffeeDetails.processing,
                    [coffeeTableColumns.cropYear]: coffeeDetails.crop_year,
                    [coffeeTableColumns.altitude]: coffeeDetails.altitude,
                    [coffeeTableColumns.roastLevel]: roastingDetails.roast_level,
                    [coffeeTableColumns.flavorNotes]: roastingDetails.flavor_notes,
                    [coffeeTableColumns.roaster]: roastingDetails.roaster,
                    [coffeeTableColumns.batchSize]: roastingDetails.batch_size,
                    [coffeeTableColumns.endTemperature]: roastingDetails.end_temperature,
                    [coffeeTableColumns.time]: roastingDetails.time,
                    [coffeeTableColumns.aboutSections]: JSON.stringify(aboutSections), // Corrected and stringified
                    [coffeeTableColumns.availability]: availability,
                };
            } catch (error) {
                console.error(`Error processing ${coffeeUrl}:`, error);
                return null; // Return null for failed scrapes
            }
        });

        const newCoffees = (await Promise.all(promises)).filter(coffee => coffee !== null); // Remove null values
        console.log("newCoffees", newCoffees)

        // Upsert the data into Supabase (insert new, update existing)
        const { data, error } = await supabase
            .from('Coffees')
            .upsert(newCoffees, { onConflict: coffeeTableColumns.productPageUrl }); // Use constant

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

    } catch (error) {
        console.error("Scraping Error:", error);
    }
}

scrapeAmokkaCoffees();

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.

<environment_details>
# VSCode Visible Files
api/scrapeCoffees.js

# VSCode Open Tabs
.env
api/scrapeCoffees.js

# Current Time
2/28/2025, 12:58:27 PM (UTC, UTC+0:00)

# Current Mode
ACT MODE
</environment_details>
