const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  try {
    // ইউটিউবকে ট্রিক করার জন্য ব্রাউজার হেডার যুক্ত করা হয়েছে
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await response.text();
    const match = html.match(/"hlsManifestUrl":"([^"]+)"/);
    
    if (match && match[1]) {
      const streamUrl = match[1].replace(/\\/g, '');
      // সফল হলে প্লেয়ারকে মূল স্ট্রিম লিংকে রিডাইরেক্ট করবে
      res.writeHead(302, { Location: streamUrl });
      res.end();
    } else {
      res.status(404).send('Error: Stream not found. YouTube might be blocking Vercel.');
    }
  } catch (error) {
    res.status(500).send('Server Error: ' + error.message);
  }
};
