
// Uses native fetch (Node 18+)
async function testGeneration() {
    console.log("Testing...");

    try {
        const response = await fetch('http://localhost:3000/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                class: '11',
                subject: 'Physics',
                chapter: 'Laws of Motion',
                topic: 'Newton\'s Second Law',
                difficulty: 'Hard',
                questionType: 'Numerical'
            })
        });

        const data = await response.json();
        console.log("FULL_RESPONSE:");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testGeneration();
