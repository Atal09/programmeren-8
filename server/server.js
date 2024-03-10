import express from "express";
import cors from 'cors';
import fetch from 'node-fetch';
import { ChatOpenAI } from "@langchain/openai";

// import { ChatAnthropic } from "@langchain/anthropic";
//
//
// const model = new ChatAnthropic({
//     temperature: 0.0,
//     apiKey: process.env.ANTHROPIC_API_KEY,
// });

const app = express();
const port = 8000;

app.use(cors()); // Enable CORS
app.use(express.json());

const model = new ChatOpenAI({
    temperature: 0.0,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});


let messages = [
    ["system", "You are a football expert"],
];

app.post("/chat", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const response = await sport(prompt);
        res.json(response.content);
    } catch (error) {
        console.error("Error chat query", error);
        res.status(500).json({ error: "Server Error" });
    }
});
// Function to handle chat prompts
async function sport(prompt) {
    messages.push(["human", prompt]);

    let response;

    try {
        if (prompt.toLowerCase().includes("joke.")) {
            const joke = await fetchJoke();
            console.log(joke);
            // Add the joke to the messages array and construct a response
            messages.push(["ai", `Here's a joke for you: ${joke.setup}. ${joke.delivery}`]);
            response = { content: `Here's a joke for you: ${joke.setup}. ${joke.delivery}` };
        } else {
            // If the prompt is not "joke.", then invoke the model to generate a response
            response = await model.invoke(messages, {
                temperature: 0.0,
                maxTokens: 100,
            });
            messages.push(["ai", response.content]);
        }

        return response;
    } catch (error) {
        console.error("Error invoking model", error);
        throw error;
    }
}

// Function to fetch joke from JokeAPI
async function fetchJoke() {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode');
        const jokeData = await response.json();

// Check if the response contains valid joke data
        if (jokeData && jokeData.setup && jokeData.delivery) {
            const setup = jokeData.setup;
            const delivery = jokeData.delivery;
            return { setup, delivery };
        } else {
            throw new Error("Invalid  data");
        }
    } catch (error) {
        console.error("Error fetching joke", error);
        throw error;
    }
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

