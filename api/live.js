const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  // বিভিন্ন সচল Piped এপিআই ইনস্ট্যান্সের লিস্ট (একটি ডাউন হলে অন্যটি কাজ করবে)
  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.video',
    'https://pipedapi.oxymoron.biz',
    'https://pipedapi.moomoo.me'
  ];

  let streamUrl = null;

  // লুপ চালিয়ে সচল প্রক্সি থেকে .m3u8 লিংকটি বের করা
  for (const instance of instances) {
    try {
      const response = await fetch(`${instance}/streams/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Piped আমাদের সরাসরি রেডিমেড hls (.m3u8) লিংক দিয়ে দেয়
        if (data && data.hls) {
          streamUrl = data.hls;
          break; 
        }
      }
    } catch (e) {
      // এই ইনস্ট্যান্স ফেইল করলে পরেরটা ট্রাই করবে
    }
  }

  if (streamUrl) {
    // সফল হলে প্লেয়ারকে সরাসরি রিডাইরেক্ট করবে
    res.writeHead(302, { Location: streamUrl });
    res.end();
  } else {
    res.status(404).send('Error: All secure proxy bridges are currently rate-limited by YouTube. Try again in a few minutes.');
  }
};
