const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_URL = "https://api.openai.com/v1/chat/completions";
  const API_KEY = process.env.OPENAI_API_KEY;

  return new Promise((resolve, reject) => {
    const req = https.request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Corrected this line by adding comma
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 10000  // 10 seconds timeout
    }, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: 200,
          body: data
        });
      });
    });

    req.on('error', error => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({error: error.message})
      });
    });

    req.on('timeout', () => {  // Handling timeout
      req.destroy();
      resolve({
        statusCode: 500,
        body: JSON.stringify({error: "Request timed out"})
      });
    });

    req.write(event.body);
    req.end();
  });
}
