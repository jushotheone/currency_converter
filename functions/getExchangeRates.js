require('dotenv').config();  // Make sure to load environment variables from .env in local development

exports.handler = async function (event, context) {
    // Log environment to verify .env and Netlify environment variables are working correctly
    console.log("API Key from Environment:", process.env.EXCHANGE_RATE_API_KEY);  // Debug log

    const { baseCurrency, targetCurrency } = event.queryStringParameters;
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;  // Fetch API key from environment variables

    if (!apiKey) {
        console.error("API key is missing!");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key is missing from the environment" }),
        };
    }

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${baseCurrency}/${targetCurrency}`;

    try {
        const fetch = await import('node-fetch');

        console.log(`Fetching exchange rate from ${baseCurrency} to ${targetCurrency}`);
        console.log(`Using API URL: ${url}`);

        // Fetch the exchange rate data
        const response = await fetch.default(url);
        const data = await response.json();

        // Check if the API response is not OK
        if (!response.ok) {
            console.error(`API error: ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }

        // Return the fetched data with appropriate headers
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Ensure CORS is handled
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("Internal server error:", error.message);  // Detailed logging of the error

        // Return a 500 response with error details
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Ensure CORS is handled
            },
            body: JSON.stringify({ error: `Failed to fetch exchange rate data. ${error.message}` }),
        };
    }
};