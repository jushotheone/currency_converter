exports.handler = async function (event, context) {
    const apiKey = "2-nzs42kZNMvPEUnnCzy"; // Nasdaq API Key
    const url = `https://data.nasdaq.com/api/v3/datasets/COM/WLD_SPT_YA.json?api_key=${apiKey}`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const commoditiesData = data.dataset.data.map(item => ({
            date: item[0],
            value: item[1],
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(commoditiesData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Server Error: " + error.message }),
        };
    }
};