require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json()); // To handle JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // To handle URL-encoded bodies

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory mapping for demonstration purposes (replace with a database for production)
const urlMapping = {};
let idCounter = 1; // Counter for short URL IDs

app.post('/api/shorturl', function (req, res) {
  const requestData = req.body.url;  // Extract the data sent in the POST request body
  console.log(requestData)
  let hostname;
  try {
    hostname = new URL(req.body.url).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
  // Use dns.lookup to verify the hostname
  dns.lookup(hostname, (err, address) => {
    if (err) {
      // If DNS lookup fails, return invalid URL
      return res.json({ error: 'invalid url' });
    }
    const shortUrl = idCounter++;
    urlMapping[shortUrl] = requestData;
    res.json({
      original_url: requestData,
      short_url: shortUrl
    });
  });
  // Send back a response with the received data

});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  // Check if the shortUrl is a valid number
  if (!/^\d+$/.test(shortUrl)) {
    return res.json({ error: 'Invalid short URL' });
  }

  // Fetch the original URL from the mapping using the shortUrl
  const originalUrl = urlMapping[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL
    return res.redirect(originalUrl);
  } else {
    // If the short URL is not found, send a 404 response
    return res.status(404).json({ error: 'URL not found' });
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
