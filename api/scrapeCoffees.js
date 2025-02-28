// import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// const supabaseUrl = process.env.SUPABASE_URL; //Not needed for local testing
// const supabaseKey = process.env.SUPABASE_ANON_KEY; //Not needed for local testing
// const supabase = createClient(supabaseUrl, supabaseKey); //Not needed for local testing

async function scrapeAmokkaCoffees() {
  try {
    const response = await fetch('https://amokka.com/en/products/colombia-luzmila-gonzalez');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const name = $('h1.product-title.h3').text().trim();
    const description = $('div.prose').text().trim();
    const imageUrl = $('img[src]').attr('src');

    const coffee = {
      name,
      description,
      imageUrl,
      productPageUrl: 'https://amokka.com/en/products/colombia-luzmila-gonzalez',
    };

    console.log(coffee); // Log the scraped data

    // // Basic error handling - improve this
    // if (!coffees.length) {
    //     throw new Error('No coffees found');
    //   }
    //   // Upload to supabase
    //   const { data, error } = await supabase
    //     .from('Coffees')
    //     .upsert(coffees, { onConflict: 'name' });

    //   if (error) {
    //     throw error;
    //   }
    //console.log('Coffees scraped and uploaded successfully');

  } catch (error) {
    console.error("Scraping Error:", error); // Improved error logging
  }
}

scrapeAmokkaCoffees(); // Call the scraping function

// export default async function handler(req, res) { //Commented out
//   // ... (Original handler code - now inside scrapeAmokkaCoffees) ...
// }
