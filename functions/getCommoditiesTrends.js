exports.handler = async function (event, context) {
    const apiKey = "2-nzs42kZNMvPEUnnCzy";
    const url = `https://data.nasdaq.com/api/v3/datasets/COM/WLD_SPT_YA.json?api_key=${apiKey}`;

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(url);
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Failed to fetch commodities data: ${response.statusText}` }),
            };
        }

        // Send only relevant data back (e.g., date and values)
        const commoditiesData = data.dataset.data.map(item => ({
            date: item[0],   // Assuming the first index is the date
            value: item[1],  // Assuming the second index is the value of the commodity
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(commoditiesData),
        };
    } catch (error) {
        console.error("Error fetching commodities data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Error: " + error.message }),
        };
    }
};