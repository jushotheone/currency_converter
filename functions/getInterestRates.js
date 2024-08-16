// getInterestRates.js
exports.handler = async function (event, context) {
    const apiKey = "28fd8c4619114fb:r2dx8rjei7ddd6t";
    const url = `https://api.tradingeconomics.com/country?c=${apiKey}&f=json`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch interest/inflation rates" }),
        };
    }
};