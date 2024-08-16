exports.handler = async function (event, context) {
    const { baseCurrency, targetCurrency } = event.queryStringParameters;
    const apiKey = "d61d522cf1ba42f5ac9fedc454b36711"; // Open Exchange Rates API Key
    const startDate = "2022-01-01"; // Example date
    const endDate = "2022-06-30"; // Example date

    // Assuming baseCurrency is GBP and targetCurrency is USD
    const historicalRates = {};

    try {
        const fetch = await import('node-fetch');

        // Loop through each date in the range and make requests for each date
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const url = `https://openexchangerates.org/api/historical/${dateStr}.json?app_id=${apiKey}&symbols=${baseCurrency},${targetCurrency}`;
            
            const response = await fetch.default(url);
            const data = await response.json();

            if (!data || !data.rates || !data.rates[baseCurrency] || !data.rates[targetCurrency]) {
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: `No valid data for ${dateStr}` })
                };
            }

            // Calculate the conversion rate from GBP to USD using the rates
            const gbpToUsdRate = data.rates[targetCurrency] / data.rates[baseCurrency];
            historicalRates[dateStr] = gbpToUsdRate;

            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(historicalRates),
        };
    } catch (error) {
        console.error("Server Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Error: " + error.message })
        };
    }
};