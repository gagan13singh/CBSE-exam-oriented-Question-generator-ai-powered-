require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There isn't a direct listModels on genAI instance in the simplified SDK sometimes, 
        // but let's try a simple generation to see specific error detail.
        // actually let's just stick to the generation test but print more info.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("StatusText:", error.response.statusText);
        }
    }
}

listModels();
