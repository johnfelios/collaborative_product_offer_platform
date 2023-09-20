document.addEventListener('DOMContentLoaded', () => {
    // Get the store name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const storeName = decodeURIComponent(urlParams.get('storeName'));
    
    

    displayUsername();

    if (!storeName) {
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
                    storeContent += `<span style="font-size: 24px; font-weight: bold;">${offer.product_name}</span><br>`;
                    
                   
                    storeContent += `<img src="public/images/tuborgSoda330.png" alt="${offer.product_name}" style="width: 200px; height: 200px;"><br>`;


                    storeContent += `<strong>Τιμή: ${offer.price} €</strong><br>`;
                    storeContent += `Ενημερώθηκε: ${offer.date}<br><br>`;
                    storeContent += `👍: <span class="likes-count">${offer.likes}</span>`; // Use a class for likes count.
                    storeContent += `&nbsp;&nbsp;&nbsp;&nbsp;` //space
                    storeContent += `👎: <span class="dislikes-count">${offer.dislikes}</span><br><br>`; 
                  
                    storeContent += `</div>`; 
                    
                    //debug offer isnt identified
                    console.log("Fetched JSON data:", jsonData);
                    console.log("Found store data:", storeData);
                    console.log("Current offer:", offer);

                    

                    console.log("Current offer ID:", offer.id);

                    if (offer.stock !== "Μη διαθέσιμο") {
                        storeContent += `<span class="green-bold">Stock: ${offer.stock}</span><br>`;
                        storeContent += `<button class="button" onclick="updateRating(${offer.id}, 'like')" >
                        <div class="hand">
                            <div class="thumb"></div>
                        </div>
                            <span>Like<span>d</span></span>
                         </button>`

                         storeContent += `<button class="button" style="margin-top: 8px;" onclick="updateRating(${offer.id}, 'dislike')" >
                        <div class="hand">
                            <div class="thumb"></div>
                        </div>
                            <span>Dislike<span>d</span></span>
                         </button>`
                        //storeContent += `<button class="button" onclick="updateRating(${offer.id}, 'like')">Like</button>`;
                        //storeContent += `<button class="button" onclick="updateRating(${offer.id}, 'dislike')">Dislike</button>`;
                        storeContent += `<button class="like-button" onclick="toggleStock(${offer.id})">Αλλαγή σε μη διαθέσιμο</button>`;
                    } else {
                        storeContent += `<span class="red-bold">Stock: ${offer.stock}</span><br>`;
                        
                        storeContent += `<button class="button dark" disabled>Like</button>`; // Disabled and greyed out
                        storeContent += `<button class="button dark" disabled >Dislike</button>`; // Disabled and greyed out
                        storeContent += `<button class="like-button" onclick="toggleStock(${offer.id})">Αλλαγή σε Διαθέσιμο</button>`;
                    }
            

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

        document.getElementById("menuToggle").addEventListener("click", function() {
            const menu = document.getElementById("menuList");
            if (menu.style.display === "none" || menu.style.display === "") {
                menu.style.display = "flex";
            } else {
                menu.style.display = "none";
            }
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
    username = localStorage.getItem('username');
    console.log("Offer ID:", offerId, "Action:", action, "Username:", username);

    fetch('http://localhost:5500/updateRating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offerId: offerId, 
            action: action,
            username: username
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


function toggleStock(offerId) {
    fetch('http://localhost:5500/toggleStock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offerId: offerId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.newStockValue) {
            location.reload();  // <-- Call to refresh the container.
        }
    })
    .catch(error => {
        console.error('There was an error with the fetch:', error);
    });
}




document.querySelectorAll('.button').forEach(button => {

    button.addEventListener('click', e => {
        button.classList.toggle('liked');
        if(button.classList.contains('liked')) {
            gsap.fromTo(button, {
                '--hand-rotate': 8
            }, {
                ease: 'none',
                keyframes: [{
                    '--hand-rotate': -45,
                    duration: .16,
                    ease: 'none'
                }, {
                    '--hand-rotate': 15,
                    duration: .12,
                    ease: 'none'
                }, {
                    '--hand-rotate': 0,
                    duration: .2,
                    ease: 'none',
                    clearProps: true
                }]
            });
        }
    })

});



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



