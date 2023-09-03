var map; // Declare globally
var markers = []; // To store all markers

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    map = L.map('map').setView([38.2466, 21.7346], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const storeSelect = document.getElementById('storeSelect');
    storeSelect.addEventListener('change', filterStoresByName);

    fetch('/getStores')
        .then(response => response.json())
        .then(jsonData => {
            console.log("Fetched Data:", jsonData); // Log fetched data

            let storeNames = new Set(); // For storing unique store names

            jsonData.elements.forEach(element => {
                if (element.type === 'node' && element.tags && element.tags.name) {
                    storeNames.add(element.tags.name); // Add store name to set
                    
                    const marker = L.marker([element.lat, element.lon]);

                    let popupContent = `<strong>${element.tags.name || ''}</strong><br>`;
                    
                    if (element.tags.offers) {
                        element.tags.offers.forEach(offer => {
                            popupContent += `Product ID: ${offer.product_id}, Price: ${offer.price}<br>`;
                        });
                    }
    
                marker.bindPopup(popupContent);
                markers.push({ marker, name: element.tags.name }); // Store marker with its associated store name
            }
        });

            

            console.log("Markers:", markers); // Log markers array

            // Populate the dropdown with store names
            const storeSelect = document.getElementById('storeSelect');
            storeNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                storeSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('There was an error fetching the JSON data:', error);
        });

        displayUsername();
});



function filterStoresByName() {
    const selectedStore = document.getElementById('storeSelect').value;
    markers.forEach(({ marker, name }) => {
        if (selectedStore === "" || selectedStore === name) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}


function displayUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = username;
    } else {
        document.getElementById('usernameDisplay').textContent = 'Guest';
    }
}




