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
                    <div class="card-header">
                        <a class="card-link" data-toggle="collapse" href="#offer-${offer.id}">
                            ${offer.product_name}
                        </a>
                    </div>
                    <div id="offer-${offer.id}" class="collapse">
                        <div class="card-body">
                            <p>Price: ${offer.price}</p>
                            <p>Date: ${offer.date}</p>  
                            <p>Likes: ${offer.likes}</p>
                            <p>Dislikes: ${offer.dislikes}</p>
                            <p>Stock: ${offer.stock}</p>
                        </div>
                    </div>
                </div>`;
            });
            document.getElementById(`subcat-${subCat.id}`).innerHTML = subAccordionContent;
        });
});





// Inject the entire structure into the accordion div
document.getElementById('accordion').innerHTML = accordionContent;

    });
