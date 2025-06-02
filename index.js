const axios = require('axios');
const fs = require('fs').promises;

async function fetchAllCoins() {
  const allCoins = [];
  const totalPages = 3402;

  for (let page = 1; page <= totalPages; page++) {
    try {
      // Prepare form data using URLSearchParams
      const formData = new URLSearchParams({ page: String(page) });

      // POST request
      const response = await axios.post(
        'https://safepal.com/coin/lists_json',
        formData.toString(), // Send form-encoded body
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000, // 10s timeout
        }
      );

      const data = response.data;
      // Check that the response matches the expected structure
      if (data.code === 0 && data.data && Array.isArray(data.data.list)) {
        const coins = data.data.list;
        allCoins.push(...coins);
        console.log(`Fetched page ${page} with ${coins.length} coins. Total so far: ${allCoins.length}`);
      } else {
        console.warn(`Unexpected structure at page ${page}:`, data);
      }
    } catch (error) {
      console.error(`Request failed on page ${page}:`, error.message);
      // Decide whether to break, retry, or just continue.
      // Here we just continue so it attempts other pages.
    } finally {
      // Wait for a few seconds before making the next request
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return allCoins;
}

async function main() {
  try {
    const allCoins = await fetchAllCoins();
    // Save the entire array to JSON
    await fs.writeFile('coins.json', JSON.stringify(allCoins, null, 2), 'utf-8');
    console.log(`Done! Saved ${allCoins.length} coins to coins.json.`);
  } catch (error) {
    console.error('Failed to fetch or save coins:', error.message);
  }
}

main();
