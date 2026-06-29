const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  // ক্লাউডফ্লেয়ার নেটওয়ার্কের প্রক্সি পুল (যা ইউটিউব ব্লক করতে পারবে না)
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.youtube.com/embed/' + id)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent('https://www.youtube.com/embed/' + id)}`
  ];

  let streamUrl = null;

  // পদ্ধতি ১: ক্লাউডফ্লেয়ার প্রক্সি দিয়ে এম্বেড পেজ স্ক্র্যাপ করা
  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, { 
        timeout: 3500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        // HLS Manifest URL এক্সট্রাক্ট করা
        const match = html.match(/"hlsManifestUrl":"([^"]+)"/);
        if (match && match[1]) {
          streamUrl = match[1].replace(/\\/g, '');
          break; // লিংক পেয়ে গেলে লুপ বন্ধ হবে
        }
      }
    } catch (e) {
      // একটি প্রক্সি ফেইল করলে পরেরটি ট্রাই করবে
    }
  }

  // পদ্ধতি ২: ফলব্যাক (যদি ক্লাউডফ্লেয়ার কাজ না করে, অল্টারনেট পাইপড চেক করবে)
  if (!streamUrl) {
    const backupPiped = [
      'https://pipedapi.us.to',
      'https://piped-api.garudalinux.org',
      'https://pipedapi.kavin.rocks'
    ];
    
    for (const instance of backupPiped) {
      try {
        const response = await fetch(`${instance}/streams/${id}`, { timeout: 3000 });
        if (response.ok) {
          const data = await response.json();
          if (data && data.hls) {
            streamUrl = data.hls;
            break;
          }
        }
      } catch (e) {}
    }
  }

  // ফাইনাল রেসপন্স
  if (streamUrl) {
    res.writeHead(302, { Location: streamUrl });
    res.end();
  } else {
    res.status(500).send('Error: YouTube security layer is too high. Please refresh in a moment.');
  }
};
