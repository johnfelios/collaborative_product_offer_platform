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
                    storeContent += `<div id="offer-${offer.id}">`;  //i open a div so the likes/dislikes are refreshed without reloading the whole page
                    storeContent += `<hr>`;
                    storeContent += `<strong>Product Name: ${offer.product_name}</strong><br>`;
                    storeContent += `<strong>Price: ${offer.price}</strong><br>`;
                    storeContent += `Date: ${offer.date}<br>`;
                    storeContent += `Likes: <span class="likes-count">${offer.likes}</span><br>`; // Use a class for likes count.
                    storeContent += `Dislikes: <span class="dislikes-count">${offer.dislikes}</span><br>`; 
                    storeContent += `Stock: ${offer.stock}<br>`;
                    storeContent += `</div>`; 
                    
                    //debug offer isnt identified
                    console.log("Fetched JSON data:", jsonData);
                    console.log("Found store data:", storeData);
                    console.log("Current offer:", offer);

                    

                    console.log("Current offer ID:", offer.id);
                    storeContent += `<button onclick="updateRating(${offer.id}, 'like')">Like</button>`;

                    //storeContent += `<button onclick="updateRating(${offer.id}, 'like')">Like</button>`;
                    storeContent += `<button onclick="updateRating(${offer.id}, 'dislike')">Dislike</button>`;

                });
            }

            document.querySelectorAll('.like-button').forEach(button => {
                button.addEventListener('click', function() {
                    const offerId = this.getAttribute('data-offer-id');
                    updateOfferRating(offerId, 'like');
                });
            });
        
            document.querySelectorAll('.dislike-button').forEach(button => {
                button.addEventListener('click', function() {
                    const offerId = this.getAttribute('data-offer-id');
                    updateOfferRating(offerId, 'dislike');
                });
            });
        
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




//updare likes/dislikes when user likes or dislikes
function updateRating(offerId, action) {
    console.log("Offer ID:", offerId, "Action:", action);

    fetch('http://localhost:5500/updateRating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offerId: offerId, 
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.newCount !== undefined) {
            const offerElement = document.querySelector(`#offer-${offerId}`);
            
            if (offerElement) {
                if(action === 'like') {
                    const likesElement = offerElement.querySelector('.likes-count');
                    if (likesElement) {
                        likesElement.textContent = data.newCount;
                    }
                } else if (action === 'dislike') {
                    const dislikesElement = offerElement.querySelector('.dislikes-count');
                    if (dislikesElement) {
                        dislikesElement.textContent = data.newCount;
                    }
                }
            }
        }
    })
    .catch(error => {
        console.error('There was an error with the fetch:', error);
    });
}



fetch('http://localhost:5500/updateRating', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        offerId: yourOfferIdValue,
        action: 'like' // or 'dislike'
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

