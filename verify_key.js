require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testHelp() {
    console.log("Testing API Key:", process.env.GEMINI_API_KEY);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("FULL ERROR:", e.message);
        console.error("DETAILS:", JSON.stringify(e, null, 2));
    }
}

testHelp();
