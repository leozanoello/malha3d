const http = require('http');

http.get('http://localhost:3000/api/calculator-settings', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      console.log('BODY:', rawData);
      const parsedData = JSON.parse(rawData);
      console.log('PARSED:', parsedData);
    } catch (e) {
      console.error('PARSE ERROR:', e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
