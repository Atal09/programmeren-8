import express from "express";
import cors from 'cors';
import fetch from 'node-fetch';
import { ChatOpenAI } from "@langchain/openai";

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
        let response;
        messages.push(["human", prompt]);

        if (prompt.toLowerCase().includes("weer")) {
            const weatherResponse = await getWeather();
            const isNiceDay = checkWeather(weatherResponse);
            if (prompt.toLowerCase().includes("weer")) {
                if (isNiceDay) {
                    response = { content: "Wat een prachtige dag! ☀️" };
                } else {
                    response = { content: "Het weer van vandaag is niet geschikt om te voetballen. 🌧️" };
                }
            }

            // Add weather information to the messages array and pass it to the model
            messages.push(["human", `Weather update: ${weatherResponse}`]);
            messages.push(["ai", response.content]);

        } else {
            response = await sport(prompt);
        }

        res.json(response.content);
    } catch (error) {
        console.error("Error chat query", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// This function fetches the current weather information for a specific location
async function getWeather() {
    // Coordinates for the location
    const latitude =  52.98586209935476;
    const longitude = 6.536059716378744;


    // API key for the OpenWeatherMap API
    const apiKey = "03a1fae275570282ad099806a013c79a";

    // URL for the API call, including the coordinates and the API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    try {
        // Make a GET request to the API
        const response = await fetch(url);

        // Parse the response as JSON
        const weatherData = await response.json();

        // Return only the main weather condition
        return weatherData.weather[0].main;
    } catch (error) {

        console.error("Error fetching weather data", error);
        throw error;
    }
}

// This function checks if the weather is suitable for football
function checkWeather(weatherData) {

    // Check if the weather data is valid
    if (!weatherData) {

        console.error("Invalid weather data");
        return false;
    }

    // Check if the weather is clear or partly cloudy
    return weatherData === "Clear" || weatherData === "Clouds";
}

// Function to handle chat prompts
async function sport(prompt) {
    // messages.push(["human", prompt]);

    let response;

    try {
        if (prompt.toLowerCase().includes("joke.")) {
            const joke = await fetchJoke();
            console.log(joke);
            messages.push(["ai", `Here's a joke for you: ${joke.setup}. ${joke.delivery}`]);
            response = { content: `Here's a joke for you: ${joke.setup}. ${joke.delivery}` };
        } else {
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
