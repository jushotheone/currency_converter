// Get all necessary elements
const formgroup = document.querySelectorAll(".form-group select"),
    fromCurrency = document.querySelector(".from-currency"),
    toCurrency = document.querySelector(".to-currency"),
    getButton = document.querySelector("form button");

let currencyStrengthChart, heatmapChart, gainersLosersChart, commoditiesChart, interestRatesChart, newsSentimentChart;

// Load all currencies dynamically from country_list.js
for (let i = 0; i < formgroup.length; i++) {
    for (let currency_code in country_code) {
        let selected;
        if (i === 0) selected = currency_code === "GBP" ? "selected" : "";
        if (i === 1) selected = currency_code === "USD" ? "selected" : "";
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        formgroup[i].insertAdjacentHTML("beforeend", optionTag);
    }

    // Add event listener to load the correct flag when the currency changes
    formgroup[i].addEventListener("change", function () {
        loadFlag(this);
    });
}

// Load the flag based on the selected currency
function loadFlag(element) {
    const currencyCode = element.value;
    const imgTag = element.parentElement.querySelector("img");

    if (imgTag && country_code[currencyCode]) {
        const countryCode = country_code[currencyCode];
        imgTag.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
    } else {
        imgTag.src = ''; // Optionally hide or remove the image if no flag available
    }
}

// Call loadFlag on page load to set the initial flags
window.addEventListener("load", () => {
    loadFlag(fromCurrency);
    loadFlag(toCurrency);
    fetchCurrencyStrength(); // Fetch currency strength data
    fetchCurrencyHeatmap(); // Fetch real-time heatmap data
    fetchGainersLosers(); // Fetch top gainers and losers
    fetchCommoditiesTrends(); // Fetch commodity price trends
    fetchInterestRates(); // Fetch interest/inflation rates
    fetchNewsSentiment(); // Fetch forex news sentiment analysis
});

// Handle Conversion Event
getButton.addEventListener("click", e => {
    e.preventDefault();
    fetchExchangeRate(); // Fetch exchange rate
});

// Function for fetching exchange rates
function fetchExchangeRate() {
    const amount = document.querySelector("#amount").value || 1;
    const exchangeRateText = document.querySelector(".exchange-rate");
    exchangeRateText.innerText = "Receiving exchange rate...";

    const baseCurrency = fromCurrency.value;
    const targetCurrency = toCurrency.value;

    const url = `/.netlify/functions/getExchangeRates?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.conversion_rate) {
                const exchangeRate = result.conversion_rate;
                const totalExchangeRate = (amount * exchangeRate).toFixed(2);
                exchangeRateText.innerText = `${amount} ${baseCurrency} = ${totalExchangeRate} ${targetCurrency}`;
            } else {
                exchangeRateText.innerText = "Failed to retrieve the exchange rate. Please try again later.";
            }
        })
        .catch(error => {
            exchangeRateText.innerText = `Error: ${error.message}. Please check your internet connection or try again later.`;
        });
}

// Fetch and cache Currency Strength data
function fetchCurrencyStrength() {
    fetchDataWithCache('/.netlify/functions/getCurrencyStrength', 'currencyStrength', renderCurrencyStrengthChart);
}

function renderCurrencyStrengthChart(data) {
    const ctx = document.getElementById('currencyStrengthChart').getContext('2d');
    const labels = Object.keys(data['Time Series FX (Daily)']);
    const strength = Object.values(data['Time Series FX (Daily)']).map(item => parseFloat(item['1. open']));

    if (currencyStrengthChart) {
        currencyStrengthChart.destroy();
    }

    currencyStrengthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: 'Global Currency Strength Index (USD to EUR)',
                data: strength.reverse(),
                borderColor: 'rgba(54, 162, 235, 0.6)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

// Fetch and cache Currency Heatmap data
function fetchCurrencyHeatmap() {
    fetchDataWithCache('/.netlify/functions/getCurrencyHeatmap', 'currencyHeatmap', renderHeatmap);
}

function renderHeatmap(data) {
    const heatmapContainer = document.getElementById('currencyHeatmap');
    heatmapContainer.innerHTML = '';

    for (const [pair, values] of Object.entries(data)) {
        const latestValue = values[Object.keys(values)[0]];
        const heatmapItem = document.createElement('div');
        heatmapItem.className = 'heatmap-item';
        heatmapItem.textContent = `${pair}: ${latestValue['1. open']}`;
        heatmapContainer.appendChild(heatmapItem);
    }
}

// Fetch and cache Gainers and Losers data
function fetchGainersLosers() {
    fetchDataWithCache('/.netlify/functions/getGainersLosers', 'gainersLosers', renderGainersLosersChart);
}

function renderGainersLosersChart(data) {
    const ctx = document.getElementById('currencyMoversChart').getContext('2d');
    const labels = data.map(item => item.currency || 'Unknown');
    const values = data.map(item => item.percentageChange || 0);

    if (gainersLosersChart) {
        gainersLosersChart.destroy();
    }

    gainersLosersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '24h Change (%)',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Fetch and cache Commodities Trends data
function fetchCommoditiesTrends() {
    fetchDataWithCache('/.netlify/functions/getCommoditiesTrends', 'commoditiesTrends', renderCommoditiesChart);
}

function renderCommoditiesChart(data) {
    const ctx = document.getElementById('commoditiesChart').getContext('2d');
    const labels = Object.keys(data);
    const prices = Object.values(data);

    if (commoditiesChart) {
        commoditiesChart.destroy();
    }

    commoditiesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Commodities Price Trends',
                data: prices,
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

// Fetch and cache Interest Rates data
function fetchInterestRates() {
    fetchDataWithCache('/.netlify/functions/getInterestRates', 'interestRates', renderInterestRatesChart);
}

function renderInterestRatesChart(data) {
    const ctx = document.getElementById('inflationInterestChart').getContext('2d');
    const labels = Object.keys(data);
    const rates = Object.values(data).map(item => item['interest_rate']);

    if (interestRatesChart) {
        interestRatesChart.destroy();
    }

    interestRatesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Interest/Inflation Rates (%)',
                data: rates,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Forex News Sentiment Analysis with retries and caching
function fetchNewsSentiment(retries = 3, delay = 2000) {
    fetchDataWithCache('/.netlify/functions/getNewsSentiment', 'newsSentiment', renderNewsSentimentChart, retries, delay);
}

function renderNewsSentimentChart(data) {
    const ctx = document.getElementById('newsSentimentChart').getContext('2d');
    const labels = ['Positive', 'Neutral', 'Negative'];
    const sentimentCounts = [data.positive, data.neutral, data.negative];

    if (newsSentimentChart) {
        newsSentimentChart.destroy();
    }

    newsSentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{                label: 'Forex News Sentiment',
                data: sentimentCounts,
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        }
    });
}

// Function to fetch data with caching and retries
function fetchDataWithCache(url, cacheKey, renderFunction, retries = 3, delay = 2000) {
    const cache = JSON.parse(localStorage.getItem(cacheKey));

    if (cache) {
        console.log(`[${cacheKey}] Loading from cache`);
        renderFunction(cache);
        return;
    }

    const fetchWithRetries = (retryCount) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${cacheKey}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                renderFunction(data);
            })
            .catch(error => {
                if (retryCount > 0) {
                    console.warn(`[${cacheKey}] Retrying fetch... (${retryCount} retries left)`);
                    setTimeout(() => fetchWithRetries(retryCount - 1), delay);
                } else {
                    console.error(`[${cacheKey}] Failed to fetch data after retries: ${error.message}`);
                }
            });
    };

    fetchWithRetries(retries);
}

// PayPal Integration
paypal.Buttons({
    createOrder: function (data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: { value: '10.00' }
            }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
        });
    }
}).render('#paypal-button-container');

// Store and Retrieve Multi-Currency Wallet
function storeInWallet(currency, amount) {
    let wallet = JSON.parse(localStorage.getItem('multiCurrencyWallet')) || {};
    wallet[currency] = (wallet[currency] || 0) + parseFloat(amount);
    localStorage.setItem('multiCurrencyWallet', JSON.stringify(wallet));
}

function displayWallet() {
    let wallet = JSON.parse(localStorage.getItem('multiCurrencyWallet')) || {};
    let walletDisplay = document.querySelector('.wallet-display');
    walletDisplay.innerHTML = Object.entries(wallet)
        .map(([currency, amount]) => `${currency}: ${amount}`)
        .join('<br>');
}

displayWallet();

// News API for Educational Resources with Categories and Carousel
const newsCategories = ['forex', 'crypto', 'commodities', 'bonds', 'banking', 'regulation', 'macroeconomics', 'fintech'];

function fetchNews(category, containerId) {
    const url = `https://newsapi.org/v2/everything?q=${category}&apiKey=5ed6bdf83c124c429f912406482f0aae`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch news for category ${category}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const articles = data.articles;
            const newsSection = document.getElementById(containerId);
            newsSection.innerHTML = ''; // Clear previous news
            articles.forEach(article => {
                const articleElem = `
                <div class="news-item bg-gray-700 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg">${article.title}</h3>
                    <p class="mt-2 text-sm">${article.description || 'No description available'}</p>
                    <a href="${article.url}" target="_blank" class="mt-2 text-blue-500 underline block">Read more</a>
                </div>`;
                newsSection.innerHTML += articleElem;
            });
        })
        .catch(error => {
            console.error(`[News API] Error fetching news for category ${category}: ${error.message}`);
        });
}

// Load news for each category
newsCategories.forEach(category => fetchNews(category, `${category}-news`));