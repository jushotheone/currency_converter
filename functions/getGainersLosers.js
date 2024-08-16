exports.handler = async function (event, context) {
    const apiKey = "N0YQFQC35RNK8WHE";
    const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=EUR&apikey=${apiKey}`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const data = await response.json();

        if (!data || !data['Time Series FX (Daily)']) {
            throw new Error('Invalid data format from API');
        }

        // Extract the daily time series data
        const timeSeries = data['Time Series FX (Daily)'];
        const dates = Object.keys(timeSeries);

        if (dates.length < 2) {
            throw new Error('Not enough data to calculate gainers/losers');
        }

        // Get the most recent two days
        const latestDate = dates[0];
        const previousDate = dates[1];

        const latestPrice = parseFloat(timeSeries[latestDate]['4. close']);
        const previousPrice = parseFloat(timeSeries[previousDate]['4. close']);

        // Calculate the percentage change
        const percentageChange = ((latestPrice - previousPrice) / previousPrice) * 100;

        // Construct the response in the format the frontend expects
        const responseData = [
            {
                currency: "USD/EUR",
                percentageChange: percentageChange.toFixed(2)
            }
        ];

        return {
            statusCode: 200,
            body: JSON.stringify(responseData), // Send back as an array of gainers/losers
        };

    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch gainers/losers data" }),
        };
    }
};