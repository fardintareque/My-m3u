const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  // ১. পাইপড (Piped) ইনস্ট্যান্স পুল
  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.video',
    'https://pipedapi.moomoo.me',
    'https://pipedapi.synced.review',
    'https://pipedapi.charlie.re'
  ];

  for (const instance of pipedInstances) {
    try {
      const response = await fetch(`${instance}/streams/${id}`, { timeout: 2500 });
      if (response.ok) {
        const data = await response.json();
        if (data && data.hls) {
          res.writeHead(302, { Location: data.hls });
          return res.end();
        }
      }
    } catch (e) {}
  }

  // ২. ইনভিডিয়াস (Invidious) ইনস্ট্যান্স পুল (ফলব্যাক)
  const invidiousInstances = [
    'https://yewtu.be',
    'https://iv.melmac.space',
    'https://invidious.perennialte.ch',
    'https://inv.tux.digital',
    'https://invidious.nerdvpn.de'
  ];

  for (const instance of invidiousInstances) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${id}`, { timeout: 2500 });
      if (response.ok) {
        const data = await response.json();
        if (data && data.hlsUrl) {
          let streamUrl = data.hlsUrl;
          if (streamUrl.startsWith('/')) {
            streamUrl = `${instance}${streamUrl}`;
          }
          res.writeHead(302, { Location: streamUrl });
          return res.end();
        }
      }
    } catch (e) {}
  }

  // যদি ১০টি সার্ভারের সবগুলোই ব্যর্থ হয়
  res.status(500).send('Error: All hybrid networks are temporarily rate-limited. Please refresh in a moment.');
};
