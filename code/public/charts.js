const username = localStorage.getItem('username');
document.getElementById('usernameDisplay').textContent = username;

const authToken = localStorage.getItem('token');
if (!authToken) {
    //if authentication token is missing, redirect to the login page
    window.location.href = 'login.html';
}

document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('myBarChart').getContext('2d');

    fetch('/getPriceHistory')
    .then(response => response.json())
    .then(data => {
        // Extract product names and their count prices from the fetched data
        const productNames = data.priceHistory.map(item => item.product_name);
        const countPrices = data.priceHistory.map(item => item.count_price);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productNames,
                datasets: [{
                    label: 'Αριθμός Προσφορών',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    data: countPrices
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            precision: 0  
                        }
                    }]
                }
            }
        });
    })
    .catch(error => {
        console.error('There was an error fetching the data:', error);
    });
});
