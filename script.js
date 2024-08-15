// Get all necessary elements
const formgroup = document.querySelectorAll(".form-group select"),
    fromCurrency = document.querySelector(".from-currency"),
    toCurrency = document.querySelector(".to-currency"),
    getButton = document.querySelector("form button");

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
});

// Handle Conversion Event
getButton.addEventListener("click", e => {
    e.preventDefault();
    console.log('Convert button clicked.');
    getExchangeRate();
});

function getExchangeRate() {
    const amount = document.querySelector("#amount").value || 1;
    const exchangeRateText = document.querySelector(".exchange-rate");
    exchangeRateText.innerText = "Receiving exchange rate...";

    console.log(`Fetching exchange rate for ${fromCurrency.value} to ${toCurrency.value}, amount: ${amount}`);

    // Using ExchangeRate-API
    const apiKey = "dcb063aad8ea4242a6e32141"; // Use your correct API Key here
    let url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency.value}`;
    
    fetch(url)
    .then(response => response.json())
    .then(result => {
        console.log('Exchange rate data received:', result);
        if (result.conversion_rates) {
            let exchangeRate = result.conversion_rates[toCurrency.value];
            let totalExchangeRate = (amount * exchangeRate).toFixed(2);
            exchangeRateText.innerText = `${amount} ${fromCurrency.value} = ${totalExchangeRate} ${toCurrency.value}`;
        } else {
            console.error('Error fetching exchange rates:', result);
            exchangeRateText.innerText = "Something went wrong. Please try again later";
        }
    })
    .catch(error => {
        console.error('Error in fetch operation:', error);
        exchangeRateText.innerText = "Something went wrong. Please try again later";
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
        const apiKey = "dcb063aad8ea4242a6e32141"; // Use your correct API Key here
        let url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency.value}`;
        
        fetch(url)
        .then(response => response.json())
        .then(result => {
            console.log('Polling data received:', result);
            const currentRate = result.conversion_rates[toCurrency.value];
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
        console.log('Creating PayPal order');
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '10.00' // Replace with actual dynamic value
                }
            }]
        });
    },
    onApprove: function (data, actions) {
        console.log('PayPal order approved:', data);
        return actions.order.capture().then(function (details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
        });
    }
}).render('#paypal-button-container');

// Spending Analysis with Chart.js
var ctx = document.getElementById('spendingChart').getContext('2d');
console.log('Rendering spending chart');
var spendingChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Spending in USD',
            data: [120, 90, 150, 180, 110],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// News API for Educational Resources
fetch('https://newsapi.org/v2/everything?q=forex&apiKey=5ed6bdf83c124c429f912406482f0aae') // Use your NewsAPI key
    .then(response => response.json())
    .then(data => {
        console.log('News data received:', data);
        let articles = data.articles;
        let newsSection = document.getElementById('news-section');
        articles.forEach(article => {
            let articleElem = `<div class="article mt-4">
                <h3 class="font-semibold">${article.title}</h3>
                <p>${article.description}</p>
                <a href="${article.url}" target="_blank" class="text-blue-500 underline">Read more</a>
            </div>`;
            newsSection.innerHTML += articleElem;
        });
    })
    .catch(error => {
        console.error('Error fetching news:', error);
        document.getElementById('news-section').innerText = "Error fetching news. Please try again later.";
    });

// Service Worker for Offline Mode
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
        console.log('Service Worker Registered');
    });
}