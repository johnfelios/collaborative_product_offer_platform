document.addEventListener('DOMContentLoaded', () => {
    // Get the store name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const storeName = decodeURIComponent(urlParams.get('storeName'));

    displayUsername();

    if (!storeName) {
        // Handle error, maybe redirect to another page or show a message.
        console.error("Store name missing from the URL.");
        return;
    }

    // Fetch the data for the specific store.
    fetch('/getStores')
        .then(response => response.json())
        .then(jsonData => {
            const storeData = jsonData.elements.find(element => element.tags.name === storeName);

            if (!storeData) {
                // Handle the case where the store is not found.
                console.error("Store not found in fetched data.");
                return;
            }

            // Display the store and its offers. This is a basic example.
            const contentArea = document.getElementById('content'); // Assuming you have an element with id 'content' in your review.html

            let storeContent = `<strong>${storeData.tags.name || ''}</strong><br>`;

            if (storeData.tags.offers) {
                storeData.tags.offers.forEach(offer => {
                    storeContent += `<hr>`;
                    storeContent += `<strong>Product Name: ${offer.product_name}</strong><br>`;
                    storeContent += `<strong>Price: ${offer.price}</strong><br>`;
                    storeContent += `Date: ${offer.date}<br>`;
                    storeContent += `Likes: ${offer.likes}<br>`;
                    storeContent += `Dislikes: ${offer.dislikes}<br>`;
                    storeContent += `Stock: ${offer.stock}<br>`;
                });
            }
            if(contentArea) {
                contentArea.innerHTML = storeContent;
            } else {
                console.error('Content area not found');
            }

            
        })
        .catch(err => {
            console.error("Error fetching store data:", err);
        });
});


function displayUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = username;
    } else {
        document.getElementById('usernameDisplay').textContent = 'Guest';
    }
}
