const username = localStorage.getItem('username');
document.getElementById('usernameDisplay').textContent = username;


function fetchOffersForSubCategory(subCategoryId) {
    return fetch(`/getOffersForSubCategory/${subCategoryId}`)
        .then(response => response.json())
        .then(data => data.offers)
        .catch(error => {
            console.error('There was an error fetching the offers:', error);
        });
}


// Fetch categories from the server
fetch('/getCategories')
    .then(response => response.json())
    .then(data => {

// Extract main and sub categories from the data
const mainCategories = data.categories.filter(category => category.parent_id === null);
const subCategories = data.categories.filter(category => category.parent_id !== null);

let accordionContent = '';

mainCategories.forEach(mainCat => {
    accordionContent += `
    <div class="card">
        <div class="card-header">
            <a class="card-link" data-toggle="collapse" href="#cat-${mainCat.id}">
                ${mainCat.name}
            </a>
        </div>
        <div id="cat-${mainCat.id}" class="collapse">
            <div class="card-body">
                <div id="sub-accordion-${mainCat.id}">
                    <!-- Subcategories will be injected here -->
                </div>
            </div>
        </div>
    </div>`;

    // Add subcategories to the accordion
    const relevantSubCategories = subCategories.filter(subCat => subCat.parent_id === mainCat.id);
    let subAccordionContent = '';
    relevantSubCategories.forEach(subCat => {
        subAccordionContent += `
        <div class="card">
            <div class="card-header">
                <a class="card-link" data-toggle="collapse" href="#subcat-${subCat.id}">
                    ${subCat.name}
                </a>
            </div>
            <div id="subcat-${subCat.id}" class="collapse">
                <div class="card-body">
                    <!-- Add content related to this subcategory here, if any -->
                </div>
            </div>
        </div>`;
    });
    accordionContent = accordionContent.replace(`<!-- Subcategories will be injected here -->`, subAccordionContent);
});

//for each subcategories fetch offers and add them to the accordion
subCategories.forEach(subCat => {
    fetchOffersForSubCategory(subCat.id)
        .then(offers => {
            let subAccordionContent = '';
            offers.forEach(offer => {
                subAccordionContent += `
                <div class="card">
                    <div class="card-body">
                        <a class="card-link" data-toggle="collapse" href="#offer-${offer.id}">
                            ${offer.product_name}
                                <div class="card-body">
                                    <span class="update-price-link" onclick="showPriceUpdateForm(${offer.id})">Προσθήκη Προσφοράς</span>
                                    <div id="price-update-form-${offer.id}" style="display: none;">
                                        <input id="price-${offer.id}" placeholder="Νέα Τιμή">
                                        <button class="like-button" onclick="updatePrice(${offer.id})">Υποβολή</button>
                                    </div>
                                </div>    
                        </a>
                    
                </div>`;
            });
            document.getElementById(`subcat-${subCat.id}`).innerHTML = subAccordionContent;
        });
});


// Inject the entire structure into the accordion div
document.getElementById('accordion').innerHTML = accordionContent;

    });


    function updatePrice(offerId,price) {
        console.log("Updating price for offer with ID: ", offerId);
        let newPrice = document.querySelector(`#price-${offerId}`).value;
        let username = localStorage.getItem('username'); // Retrieve username from localStorage

        console.log("New price on updatePrice function: ", newPrice);
        
        if(price) {
            console.log("Inside if ");
            newPrice = price;
        }
        if(newPrice && username) {
            fetch(`/updateOfferPrice/${offerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: newPrice, username: username })
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    alert('Price updated successfully!');
                } else {
                    alert('There was an error updating the price.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error updating the price.');
            });
        } else {
            alert('Please enter a valid price and ensure you are logged in.');
        }
    }
    
    
    function showPriceUpdateForm(offerId) {
        const form = document.querySelector(`#price-update-form-${offerId}`);
        form.style.display = 'block';
    }
  //-------------------  
    //Search bar autocomplete
    $(document).ready(function() {
        const resultsDropdown = $("#autocomplete-results");
        const priceUpdateSection = $("#priceUpdateSection");
        const offerPriceInput = $("#offerPrice");
        let selectedOfferId; // To store the selected offer's ID
    
        $("#offerSearch").on("input", function() {
            const query = $(this).val();
            
    
            if (query.length > 2) {
                $.get(`/searchOffers?q=${encodeURIComponent(query)}`, function(data) {
                    resultsDropdown.empty();
    
                    if (data && data.offers && data.offers.length) {
                        data.offers.forEach(offer => {
                            resultsDropdown.append(`<a class="dropdown-item" data-offer-id="${offer.id}" data-offer-price="${offer.price}">${offer.product_name}</a>`);
                        });
                    } else {
                        resultsDropdown.append(`<div class="dropdown-item">No results found</div>`);
                    }
                });
            } else {
                resultsDropdown.empty();
            }
        });
        
        resultsDropdown.on("click", ".dropdown-item", function() {
            const selectedOfferName = $(this).text();
            
            const offerId = $(this).data('offer-id');
        

            console.log("Selected offer Data: ", selectedOfferName, offerId);

            $("#offerSearch").val(selectedOfferName);
            
            $("#submitPrice").data('offer-id', offerId); // Save the offer.id as a data attribute on the button
            $("#priceUpdateSection").show();
            
            resultsDropdown.empty();
      

        $("#submitPrice").on("click", function() {
            const newOPrice = $("#offerPrice").val();
            console.log("Submiting new price from dropdown for offer with ID: ", offerId);
            console.log("New price inputed: ", newOPrice);

            updatePrice(offerId, newOPrice);
           
        });
    
    });


    });
//------------------

    

dropdown.addEventListener('change', function() {
    // Show the price update section when an offer is selected
    document.getElementById('priceUpdateSection').style.display = 'block';
});


    
    $("#offerSearch").on("input", function() {
        console.log("Input detected: ", $(this).val());
    });
    
    