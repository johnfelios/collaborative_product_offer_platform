document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    var map = L.map('map').setView([38.2466, 21.7346], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Fetch the JSON data from stores.json
    fetch('stores.json')
        .then(response => {
            // Parse the response as JSON
            return response.json();
        })
        .then(jsonData => {
            // jsonData now contains the parsed data from stores.json

            // Ensure that 'elements' exists in jsonData before proceeding
            if (!jsonData.elements) {
                console.error('Invalid JSON format: Expected an "elements" property.');
                return;
            }

            // Iterate over the elements in your JSON data
            jsonData.elements.forEach(element => {
                if (element.type === 'node') {
                    // Create a marker for each node and add it to the map
                    const marker = L.marker([element.lat, element.lon]).addTo(map);

                    // If there are tags for the element, add them as a popup to the marker
                    if (element.tags) {
                        let popupContent = "";

                        // For example, you can use the 'name' and 'shop' tags
                        if (element.tags.name) {
                            popupContent += `<strong>${element.tags.name}</strong><br>`;
                        }
                        if (element.tags.shop) {
                            popupContent += `${element.tags.shop}<br>`;
                        }
                        // ... Add more tags if needed ...

                        marker.bindPopup(popupContent);
                    }
                }
            });
        })
        .catch(error => {
            console.error('There was an error fetching the JSON data:', error);
        });
});
