exports.handler = async function (event, context) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY; // AlphaVantage API Key
    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=USD&to_symbol=EUR&interval=5min&apikey=${apiKey}`;

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
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Failed to fetch heatmap data" }),
        };
    }
};