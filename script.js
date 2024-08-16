// Get all necessary elements
const formgroup = document.querySelectorAll(".form-group select"),
    fromCurrency = document.querySelector(".from-currency"),
    toCurrency = document.querySelector(".to-currency"),
    getButton = document.querySelector("form button");

let currencyStrengthChart, heatmapChart, gainersLosersChart, commoditiesChart, interestRatesChart, newsSentimentChart;

console.log('Form group elements:', formgroup);
console.log('From Currency element:', fromCurrency);
console.log('To Currency element:', toCurrency);
console.log('Get button element:', getButton);

// Load all currencies dynamically from country_list.js
for (let i = 0; i < formgroup.length; i++) {
    console.log(`Loading currencies into form group ${i}`);
    for (let currency_code in country_code) {
        let selected;
        if (i == 0) selected = currency_code == "GBP" ? "selected" : "";
        if (i == 1) selected = currency_code == "USD" ? "selected" : "";
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        formgroup[i].insertAdjacentHTML("beforeend", optionTag);
    }

    // Add event listener to load the correct flag when the currency changes
    formgroup[i].addEventListener("change", function () {
        console.log(`Currency changed in group ${i}:`, this.value);
        loadFlag(this);
    });
}

// Load the flag based on the selected currency
function loadFlag(element) {
    const currencyCode = element.value;
    const imgTag = element.parentElement.querySelector("img");

    if (imgTag) {
        const countryCode = country_code[currencyCode];
        imgTag.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
        console.log(`Flag updated for currency ${currencyCode}: ${imgTag.src}`);
    }
}

// Call loadFlag on page load to set the initial flags
window.addEventListener("load", () => {
    console.log('Page loaded, setting initial flags and fetching exchange rate.');
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
    console.log('Convert button clicked.');
    fetchExchangeRate(); // Fetch exchange rate
});

// Function for fetching exchange rates
function fetchExchangeRate() {
    const amount = document.querySelector("#amount").value || 1;
    const exchangeRateText = document.querySelector(".exchange-rate");
    exchangeRateText.innerText = "Receiving exchange rate...";

    const baseCurrency = fromCurrency.value;
    const targetCurrency = toCurrency.value;

    fetch(`/.netlify/functions/getExchangeRates?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}`)
        .then(response => response.json())
        .then(result => {
            if (result.conversion_rate) {
                let exchangeRate = result.conversion_rate;
                let totalExchangeRate = (amount * exchangeRate).toFixed(2);
                exchangeRateText.innerText = `${amount} ${baseCurrency} = ${totalExchangeRate} ${targetCurrency}`;
            } else {
                exchangeRateText.innerText = "Something went wrong. Please try again later";
            }
        })
        .catch(error => {
            console.error('Error in fetch operation:', error);
            exchangeRateText.innerText = "Something went wrong. Please try again later";
        });
}

// 1. Global Currency Strength Index
function fetchCurrencyStrength() {
    fetch(`/.netlify/functions/getCurrencyStrength`)
        .then(response => response.json())
        .then(result => {
            console.log("Currency Strength Data:", result);
            renderCurrencyStrengthChart(result);
        })
        .catch(error => {
            console.error('Error fetching currency strength data:', error);
        });
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

// 2. Real-Time Currency Exchange Heatmap
function fetchCurrencyHeatmap() {
    fetch(`/.netlify/functions/getCurrencyHeatmap`)
        .then(response => response.json())
        .then(result => {
            console.log("Currency Heatmap Data:", result);
            renderHeatmap(result);
        })
        .catch(error => {
            console.error('Error fetching heatmap data:', error);
        });
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

// 3. Top Gainers and Losers
function fetchGainersLosers() {
    fetch(`/.netlify/functions/getGainersLosers`)
        .then(response => response.json())
        .then(result => {
            console.log("Gainers and Losers Data:", result);
            renderGainersLosersChart(result);
        })
        .catch(error => {
            console.error('Error fetching gainers and losers data:', error);
        });
}

function renderGainersLosersChart(data) {
    const ctx = document.getElementById('currencyMoversChart').getContext('2d');
    const labels = data.map(item => item.currency);
    const values = data.map(item => item.percentageChange);

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

// 4. Commodities Price Trends
function fetchCommoditiesTrends() {
    fetch(`/.netlify/functions/getCommoditiesTrends`)
        .then(response => response.json())
        .then(result => {
            console.log("Commodities Trends Data:", result);
            renderCommoditiesChart(result);
        })
        .catch(error => {
            console.error('Error fetching commodities trends data:', error);
        });
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

// 5. Country-Specific Inflation/Interest Rates
function fetchInterestRates() {
    fetch(`/.netlify/functions/getInterestRates`)
        .then(response => response.json())
        .then(result => {
            console.log("Interest/Inflation Rates Data:", result);
            renderInterestRatesChart(result);
        })
        .catch(error => {
            console.error('Error fetching interest rates data:', error);
        });
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
                borderColor:                'rgba(255, 159, 64, 1)',
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

// 6. Forex News Sentiment Analysis
function fetchNewsSentiment() {
    fetch(`/.netlify/functions/getNewsSentiment`)
        .then(response => response.json())
        .then(result => {
            console.log("Forex News Sentiment Data:", result);
            renderNewsSentimentChart(result);
        })
        .catch(error => {
            console.error('Error fetching news sentiment data:', error);
        });
}

function renderNewsSentimentChart(data) {
    const ctx = document.getElementById('newsSentimentChart').getContext('2d');
    const labels = ['Positive', 'Neutral', 'Negative'];
    const sentimentCounts = [data.positive, data.neutral, data.negative];

    const backgroundColors = ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'];
    const borderColors = ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'];

    if (newsSentimentChart) {
        newsSentimentChart.destroy();
    }

    newsSentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Forex News Sentiment',
                data: sentimentCounts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
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

// PayPal Integration
paypal.Buttons({
    createOrder: function (data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '10.00' // Replace this with the dynamic value if needed
                }
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
    console.log(`Storing in wallet: ${currency}, amount: ${amount}`);
    let wallet = JSON.parse(localStorage.getItem('multiCurrencyWallet')) || {};
    wallet[currency] = (wallet[currency] || 0) + parseFloat(amount);
    localStorage.setItem('multiCurrencyWallet', JSON.stringify(wallet));
}

function displayWallet() {
    let wallet = JSON.parse(localStorage.getItem('multiCurrencyWallet')) || {};
    console.log('Displaying wallet:', wallet);
    let walletDisplay = document.querySelector('.wallet-display');
    walletDisplay.innerHTML = Object.entries(wallet)
        .map(([currency, amount]) => `${currency}: ${amount}`)
        .join('<br>');
}

displayWallet();

// News API for Educational Resources with Categories and Carousel
const newsCategories = ['forex', 'crypto', 'commodities', 'bonds', 'banking', 'regulation', 'macroeconomics', 'fintech'];

function fetchNews(category, containerId) {
    let url = `https://newsapi.org/v2/everything?q=${category}&apiKey=5ed6bdf83c124c429f912406482f0aae`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let articles = data.articles;
            let newsSection = document.getElementById(containerId);
            newsSection.innerHTML = ''; // Clear previous news
            articles.forEach(article => {
                let articleElem = `<div class="news-item bg-gray-700 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg">${article.title}</h3>
                    <p class="mt-2 text-sm">${article.description || 'No description available'}</p>
                    <a href="${article.url}" target="_blank" class="mt-2 text-blue-500 underline block">Read more</a>
                </div>`;
                newsSection.innerHTML += articleElem;
            });
        })
        .catch(error => {
            console.error(`Error fetching ${category} news:`, error);
        });
}

// Load news for each category
newsCategories.forEach(category => fetchNews(category, `${category}-news`));