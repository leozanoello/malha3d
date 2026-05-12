const http = require('http');

http.get('http://localhost:3000/admin', (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Body length:', data.length);
        if (res.statusCode === 500) {
            console.log('Body:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
