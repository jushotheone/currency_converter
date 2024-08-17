exports.handler = async function (event, context) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY; // AlphaVantage API Key
    const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=EUR&apikey=${apiKey}`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const data = await response.json();

        if (!response.ok || !data['Time Series FX (Daily)']) {
            throw new Error('Invalid data format from API');
        }

        const timeSeries = data['Time Series FX (Daily)'];
        const dates = Object.keys(timeSeries);

        if (dates.length < 2) {
            throw new Error('Not enough data to calculate gainers/losers');
        }

        const latestDate = dates[0];
        const previousDate = dates[1];

        const latestPrice = parseFloat(timeSeries[latestDate]['4. close']);
        const previousPrice = parseFloat(timeSeries[previousDate]['4. close']);

        const percentageChange = ((latestPrice - previousPrice) / previousPrice) * 100;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify([{ currency: "USD/EUR", percentageChange: percentageChange.toFixed(2) }]),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Failed to fetch gainers/losers data" }),
        };
    }
};