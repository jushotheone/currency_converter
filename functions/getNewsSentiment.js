const axios = require('axios');

// RapidAPI Twinword API key
const rapidApiKey = '1a7d5e8000msh30799faf663f753p1ba766jsn64824f945daf';

exports.handler = async (event, context) => {
  try {
    // Fetch forex-related news articles from News API
    const newsApiKey = '5ed6bdf83c124c429f912406482f0aae';
    const newsResponse = await axios.get(`https://newsapi.org/v2/everything?q=forex&apiKey=${newsApiKey}`);
    const articles = newsResponse.data.articles;

    if (!articles.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No news articles found' })
      };
    }

    // Initialize sentiment analysis results
    const sentimentResults = [];

    // Loop through each article to analyze sentiment
    for (const article of articles) {
      if (!article.description) continue;

      // Send the description to Twinword Sentiment Analysis API via RapidAPI
      const sentimentResponse = await axios.get(
        'https://twinword-twinword-bundle-v1.p.rapidapi.com/sentiment_analysis/',
        {
          params: { text: article.description },
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'twinword-twinword-bundle-v1.p.rapidapi.com',
          }
        }
      );

      // Push sentiment data and the related article into the results array
      sentimentResults.push({
        title: article.title,
        description: article.description,
        sentiment: sentimentResponse.data.type, // sentiment can be positive, neutral, or negative
      });
    }

    // Return the analyzed sentiment results
    return {
      statusCode: 200,
      body: JSON.stringify(sentimentResults)
    };
  } catch (error) {
    console.error('Error fetching news or analyzing sentiment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch or analyze sentiment data' })
    };
  }
};