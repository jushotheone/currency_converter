exports.handler = async function (event, context) {
    const apiKey = process.env.NASDAQ_API_KEY; // Nasdaq API Key
    const url = `https://data.nasdaq.com/api/v3/datasets/COM/WLD_SPT_YA.json?api_key=${apiKey}`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);

        // Log the response status and headers
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers.raw());

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}: ${response.statusText}`);
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if the dataset and data fields exist in the response
        if (!data.dataset || !data.dataset.data) {
            console.error('Unexpected data structure:', data);
            throw new Error('Unexpected data structure from API.');
        }

        const commoditiesData = data.dataset.data.map(item => ({
            date: item[0],
            value: item[1],
        }));

        console.log('Structured Commodities Data:', commoditiesData);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(commoditiesData),
        };
    } catch (error) {
        console.error("Error fetching commodities data:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Server Error: " + error.message }),
        };
    }
};