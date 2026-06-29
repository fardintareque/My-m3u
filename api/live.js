const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send('Error: Missing ID');

  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`);
    const html = await response.text();
    const match = html.match(/"hlsManifestUrl":"([^"]+)"/);

    if (match && match[1]) {
      const streamUrl = match[1].replace(/\\/g, '');
      res.writeHead(302, { Location: streamUrl });
      res.end();
    } else {
      res.status(404).send('Error: Stream not found');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
