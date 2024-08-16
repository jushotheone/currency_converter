// getGainersLosers.js
exports.handler = async function (event, context) {
    const apiKey = "N0YQFQC35RNK8WHE";
    const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=EUR&apikey=${apiKey}`;

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
            body: JSON.stringify({ error: "Failed to fetch gainers/losers data" }),
        };
    }
};