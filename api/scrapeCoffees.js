// api/scrapeCoffees.js
import * as cheerio from 'cheerio';

async function scrapeAmokkaCoffees() {
  try {
    const collectionResponse = await fetch('https://amokka.com/en/collections/coffee');
    if (!collectionResponse.ok) {
      throw new Error(`HTTP error! status: ${collectionResponse.status}`);
    }
    const collectionHtml = await collectionResponse.text();
    const $collection = cheerio.load(collectionHtml);

    const coffeeLinks = [];
    $collection('a[href^="/en/products/"]').each((i, el) => {
      const relativeUrl = $collection(el).attr('href');
      const fullUrl = new URL(relativeUrl, 'https://amokka.com').href; // Construct absolute URL
      coffeeLinks.push(fullUrl);
    });

    const coffees = [];
    for (const coffeeUrl of coffeeLinks) {
      const response = await fetch(coffeeUrl);
      if (!response.ok) {
        console.error(`Failed to fetch ${coffeeUrl}: ${response.status}`); // Log individual errors
        continue; // Skip to the next coffee on error
      }
      const html = await response.text();
      const $ = cheerio.load(html);

      const name = $('h1.product-title.h3').text().trim();
      const description = $('div.product-info__block-item[data-block-type="description"] div.prose').text().trim();
        // Use a more robust selector for description
      let imageUrl = $(
  "div.product-gallery__image img"
).attr("src"); // Get the src attribute
if (imageUrl && !imageUrl.startsWith("https:")) {
  imageUrl = "https:" + imageUrl; // Prepend https:
}

      coffees.push({
        name,
        description,
        imageUrl,
        productPageUrl: coffeeUrl, // Store the URL
      });
    }

    console.log(coffees); // Log the scraped data

    // // Basic error handling - improve this
    // if (!coffees.length) {
    //     throw new Error('No coffees found');
    //   }
    //   // Upload to supabase
    //   const { data, error } = await supabase
    //     .from('Coffees')
    //     .upsert(coffees, { onConflict: 'name' }); // Consider a better unique constraint

    //   if (error) {
    //     throw error;
    //   }
    //console.log('Coffees scraped and uploaded successfully');

  } catch (error) {
    console.error("Scraping Error:", error); // Improved error logging
  }
}

scrapeAmokkaCoffees();
