// getInterestRates.js
exports.handler = async function (event, context) {
    const apiKey = process.env.TRADING_ECONOMICS_API_KEY; // Trading Economics API Key
    const url = `https://api.tradingeconomics.com/country?c=${apiKey}&f=json`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS header
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS header
            },
            body: JSON.stringify({ error: "Failed to fetch interest/inflation rates" }),
        };
    }
};