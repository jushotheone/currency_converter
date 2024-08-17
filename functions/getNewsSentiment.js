const axios = require('axios');

const rapidApiKey = process.env.RAPID_API_KEY;
const newsApiKey = process.env.NEWS_API_KEY;

async function fetchSentimentWithRetry(articleDescription, retries = 3, delay = 2000) {
    try {
        return await axios.get(
            'https://twinword-sentiment-analysis.p.rapidapi.com/analyze/',
            {
                params: { text: articleDescription },
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': 'twinword-sentiment-analysis.p.rapidapi.com',
                },
                timeout: 30000 // 30 seconds timeout
            }
        );
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying sentiment analysis... (${retries} retries left)`);
            return new Promise((resolve) =>
                setTimeout(() => resolve(fetchSentimentWithRetry(articleDescription, retries - 1, delay)), delay)
            );
        } else {
            console.error(`Failed after retries: ${error.message}`, error.stack);  // Log detailed error
            throw new Error(`Failed to analyze sentiment after multiple attempts: ${error.message}`);
        }
    }
}

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; // Prevent premature timeout

    const startTime = Date.now(); // Start timer

    try {
        // Fetch forex-related news articles from News API
        const newsResponse = await axios.get(`https://newsapi.org/v2/everything?q=forex&apiKey=${newsApiKey}`);
        const articles = newsResponse.data.articles;

        if (!articles.length) {
            console.log('No news articles found.');
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: 'No news articles found' })
            };
        }

        const sentimentResults = [];

        for (const article of articles) {
            if (!article.description) continue;

            try {
                const sentimentResponse = await fetchSentimentWithRetry(article.description);
                sentimentResults.push({
                    title: article.title,
                    description: article.description,
                    sentiment: sentimentResponse.data.type,
                });
            } catch (sentimentError) {
                console.error(`Error analyzing sentiment for article: ${article.title}`, sentimentError.message);
                sentimentResults.push({
                    title: article.title,
                    description: article.description,
                    sentiment: "error", 
                });
            }
        }

        const endTime = Date.now();
        console.log(`Total Time Taken: ${(endTime - startTime) / 1000} seconds`);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            },
            body: JSON.stringify(sentimentResults)
        };
    } catch (error) {
        console.error('Error fetching news or analyzing sentiment:', error.message, error.stack);  // Log full stack
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: 'Failed to fetch or analyze sentiment data' })
        };
    }
};