import { createClient } from '@supabase/supabase-js';
import cheerio from 'cheerio';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const response = await fetch('https://amokka.com/en/coffee/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const coffees = [];
    $('.product-grid-item').each((i, el) => {
      const name = $(el).find('.product-title').text().trim();
      const description = $(el).find('.product-description').text().trim();
      const imageUrl = $(el).find('.product-image img').attr('src');
      const productPageUrl = $(el).find('a').attr('href');

      coffees.push({
        name,
        description,
        imageUrl,
        productPageUrl,
      });
    });

    // Basic error handling - improve this
    if (!coffees) {
      throw new Error('No coffees found');
    }

    // Upload to supabase
    const { data, error } = await supabase
      .from('Coffees')
      .upsert(coffees, { onConflict: 'name' });

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Coffees scraped and uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scrape coffees' });
  }
}
