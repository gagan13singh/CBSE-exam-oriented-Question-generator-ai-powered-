const http = require('http');

const data = JSON.stringify({
    class: "10",
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    topic: "pH Scale",
    difficulty: "Exam-Oriented",
    questionType: "MCQ"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/generate-questions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY: ' + body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
