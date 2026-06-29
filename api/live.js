const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  try {
    // ওয়াচ পেজের বদলে এম্বেড পেজ ব্যবহার করা হয়েছে (ব্লক হওয়া এড়াতে)
    const response = await fetch(`https://www.youtube.com/embed/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
      }
    });
    
    const html = await response.text();
    let streamUrl = null;

    // মেথড ১: HLS লিংক খোঁজা
    const match = html.match(/"hlsManifestUrl":"([^"]+)"/);
    if (match && match[1]) {
      streamUrl = match[1].replace(/\\/g, '');
    } else {
      // মেথড ২: বিকল্প JSON ডাটা চেক করা
      const jsonMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (jsonMatch) {
        try {
          const playerResponse = JSON.parse(jsonMatch[1]);
          streamUrl = playerResponse?.streamingData?.hlsManifestUrl;
        } catch (e) {}
      }
    }

    if (streamUrl) {
      // সাকসেস হলে প্লেয়ারকে রিডাইরেক্ট করবে
      res.writeHead(302, { Location: streamUrl });
      res.end();
    } else {
      res.status(404).send('Error: Stream not found. Channel might be offline.');
    }
  } catch (error) {
    res.status(500).send('Server Error: ' + error.message);
  }
};
