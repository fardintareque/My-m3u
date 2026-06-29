const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  try {
    // ইউটিউবের অফিশিয়াল ইন্টারনাল API-তে সরাসরি রিকোয়েস্ট পাঠানো হচ্ছে
    const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
      },
      body: JSON.stringify({
        videoId: id,
        context: {
          client: {
            clientName: 'ANDROID_EMBEDDED_PLAYER',
            clientVersion: '19.22.34',
            hl: 'en',
            gl: 'US'
          }
        }
      })
    });

    const data = await response.json();
    const streamUrl = data?.streamingData?.hlsManifestUrl;

    if (streamUrl) {
      // সাকসেস হলে প্লেয়ারকে সরাসরি .m3u8 লিংকে পাঠিয়ে দেবে
      res.writeHead(302, { Location: streamUrl });
      res.end();
    } else {
      res.status(404).send('Error: HLS Link not found. Check if the video ID is correct and live.');
    }
  } catch (error) {
    res.status(500).send('Server Error: ' + error.message);
  }
};
