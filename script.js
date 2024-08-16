// Get all necessary elements
const formgroup = document.querySelectorAll(".form-group select"),
    fromCurrency = document.querySelector(".from-currency"),
    toCurrency = document.querySelector(".to-currency"),
    getButton = document.querySelector("form button");

let spendingChart;

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
        const countryCode = country_code[currencyCode]; // country_code is from country_list.js
        imgTag.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
        console.log(`Flag updated for currency ${currencyCode}: ${imgTag.src}`);
    }
}

// Call loadFlag on page load to set the initial flags
window.addEventListener("load", () => {
    console.log('Page loaded, setting initial flags and fetching exchange rate.');
    loadFlag(fromCurrency);
    loadFlag(toCurrency);
    getExchangeRate(); // Ensure exchange rate is fetched on load
    getHistoricalData(); // Fetch historical data for chart
});

// Handle Conversion Event
getButton.addEventListener("click", e => {
    e.preventDefault();
    console.log('Convert button clicked.');
    getExchangeRate();
    getHistoricalData(); // Fetch and update chart on conversion
});

function getExchangeRate() {
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

// Fetch Historical Data
function getHistoricalData() {
    const baseCurrency = "GBP"; // Since we're working with GBP -> USD

    fetch(`/.netlify/functions/getHistoricalData?baseCurrency=${baseCurrency}&targetCurrency=USD`)
        .then(response => response.json())
        .then(result => {
            console.log("Historical data received:", result);

            if (result.error) {
                console.error('Error fetching historical data:', result.error);
                return;
            }

            updateChart(result);
        })
        .catch(error => {
            console.error('Error fetching historical data:', error);
        });
}

// Update Chart with Historical Data
function updateChart(data) {
    if (!data) {
        console.error("No data available for the chart");
        return;
    }

    const ctx = document.getElementById('spendingChart').getContext('2d');
    const labels = Object.keys(data); // Dates
    const rates = Object.values(data); // Exchange rates

    if (spendingChart) {
        spendingChart.destroy(); // Destroy the old chart before creating a new one
    }

    spendingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Historical Exchange Rate (GBP to USD)`,
                data: rates,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Update Chart with Historical Data
function updateChart(data) {
    if (!data) {
        console.error("No data available for the chart");
        return;
    }
    const ctx = document.getElementById('spendingChart').getContext('2d');
    const labels = Object.keys(data); // Dates
    const rates = Object.values(data).map(rate => rate[toCurrency.value]); // Extract exchange rates for the target currency

    if (spendingChart) {
        spendingChart.destroy(); // Destroy the old chart before creating a new one
    }

    spendingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Historical Exchange Rate (${fromCurrency.value} to ${toCurrency.value})`,
                data: rates,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Update Chart with Historical Data
function updateChart(data) {
    if (!data) {
        console.error("No data available for the chart");
        return;
    }
    const ctx = document.getElementById('spendingChart').getContext('2d');
    const labels = Object.keys(data); // Dates
    const rates = Object.values(data); // Exchange rates

    if (spendingChart) {
        spendingChart.destroy(); // Destroy the old chart before creating a new one
    }

    spendingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Historical Exchange Rate (${fromCurrency.value} to ${toCurrency.value})`,
                data: rates,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Set Custom Alerts
document.getElementById('setAlert').addEventListener('click', () => {
    const targetRate = parseFloat(document.getElementById('alertRate').value);
    console.log('Setting alert for rate:', targetRate);
    setCustomAlert(targetRate);
});

function setCustomAlert(targetRate) {
    const interval = setInterval(() => {
        console.log(`Polling exchange rate every minute for alert. Target rate: ${targetRate}`);
        const baseCurrency = fromCurrency.value;

        fetch(`/.netlify/functions/getExchangeRates?baseCurrency=${baseCurrency}&targetCurrency=${toCurrency.value}`)
            .then(response => response.json())
            .then(result => {
                const currentRate = result.conversion_rate;
                if (currentRate >= targetRate) {
                    alert(`Target rate of ${targetRate} reached: 1 ${fromCurrency.value} = ${currentRate} ${toCurrency.value}`);
                    clearInterval(interval);
                }
            });
    }, 60000); // Poll every minute
}

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