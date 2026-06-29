const fetch = require('node-fetch');

async function fetchStream(id, clientName, clientVersion) {
  try {
    const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: id,
        context: {
          client: {
            clientName: clientName,
            clientVersion: clientVersion,
            hl: 'en',
            gl: 'US'
          }
        }
      })
    });
    const data = await response.json();
    return data?.streamingData?.hlsManifestUrl || null;
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  // পদ্ধতি ১: স্মার্ট টিভি ক্লায়েন্ট (এটি ডেটাসেন্টার ব্লক অনায়াসে বাইপাস করে)
  let streamUrl = await fetchStream(id, 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', '1.0');

  // পদ্ধতি ২: ওয়েব এম্বেড ক্লায়েন্ট ফলব্যাক
  if (!streamUrl) {
    streamUrl = await fetchStream(id, 'WEB_EMBEDDED_PLAYER', '1.20240625.01.00');
  }

  // পদ্ধতি ৩: কোর অ্যান্ড্রয়েড ক্লায়েন্ট ফলব্যাক
  if (!streamUrl) {
    streamUrl = await fetchStream(id, 'ANDROID', '17.31.35');
  }

  if (streamUrl) {
    // যেকোনো একটি পদ্ধতি সফল হলে প্লেয়ারকে রিডাইরেক্ট করবে
    res.writeHead(302, { Location: streamUrl });
    res.end();
  } else {
    res.status(404).send('Error: YouTube is heavily restricting streaming data on this infrastructure.');
  }
};
