
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/tags',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log("Ollama is running!");
            console.log("Available models:");
            parsed.models.forEach(m => console.log(`- ${m.name}`));
        } catch (e) {
            console.error("Error parsing response:", e);
            console.log("Raw response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
