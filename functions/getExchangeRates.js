// getExchangeRates.js
const fetch = require('node-fetch'); // Using node-fetch to make server-side requests

exports.handler = async function (event, context) {
    const { baseCurrency, targetCurrency } = event.queryStringParameters;
    const apiKey = "your_exchange_rate_api_key_here";
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${baseCurrency}/${targetCurrency}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify(data),
            };
        } else {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.error }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch data" }),
        };
    }
};