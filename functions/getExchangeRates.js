exports.handler = async function (event, context) {
    const { baseCurrency, targetCurrency } = event.queryStringParameters;
    const apiKey = "dcb063aad8ea4242a6e32141"; // ExchangeRate-API key
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${baseCurrency}/${targetCurrency}`;

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
            body: JSON.stringify({ error: "Failed to fetch data" }),
        };
    }
};