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

    //ipothetiki topothesia
   
    userslocation = L.marker([38.2466, 21.7346]).addTo(map)
    .bindPopup("Τρέχουσα τοποθεσία");

    fetch('/getStores')
        .then(response => response.json())
        .then(jsonData => {
            console.log("Fetched Data:", jsonData); // Log fetched data

            let storeNames = new Set(); // For storing unique store names

            jsonData.elements.forEach(element => {
                if (element.type === 'node' && element.tags && element.tags.name) {
                    storeNames.add(element.tags.name); // Add store name to set
                    let color;
                    if (element.tags.offers && element.tags.offers.length > 0) {
                        color = 'green'; // Color for stores with offers
                       
                        
                    } else {
                        color = 'blue'; // Color for stores without offers
                    }
                
                    const marker = L.circleMarker([element.lat, element.lon], {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.5,
                        radius: 10
                    });

                    const distanceFromUser = calculateDistance(38.2466, 21.7346, element.lat, element.lon);
                    let popupContent = `<strong>${element.tags.name || ''}</strong><br>`;
                    
                    if (element.tags.offers) {
                        element.tags.offers.forEach(offer => {
                            popupContent += `<hr>`;
                            popupContent += `<strong>Product Name: ${offer.product_name}</strong><br>`;
                            popupContent += `<strong>Price: ${offer.price}</strong><br>`;

                            popupContent += `Date: ${offer.date}<br>`;
                            popupContent += `Likes: ${offer.likes}<br>`;
                            popupContent += `Dislikes: ${offer.dislikes}<br>`;
                            popupContent += `Stock: ${offer.stock}<br>`;
                            
                            //needed to make the location bigger to see it work (default:50)
                            if (distanceFromUser <= 300) { // If store is within 50* meters of user's location
                                popupContent += `<br><a href="review.html" class="btn">Αξιολόγηση</a>`;
                                popupContent += `<br><a href="review.html" class="btn">Προσθήκη Προσφοράς</a>`;
                            }
                        });
                    }
    
                    marker.bindPopup(popupContent);
                    
                    markers.push({ marker, name: element.tags.name }); // Store marker with its associated store name
                    
                    //check the stores with offers and add markerd by default before filter
                    if (element.tags.offers && element.tags.offers.length > 0) {
                        marker.addTo(map); // Add marker to the map
                       }
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




function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // Distance in meters
    return d;
}
