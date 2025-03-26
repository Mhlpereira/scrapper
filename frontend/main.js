document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keywordInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');
    const loadingIndicator = document.getElementById('loading');

    //connect to the backend with clean code
    const API_ENDPOINT = 'http://localhost:3000/api/scrape';

    // event on click search button
    searchButton.addEventListener('click', async () => {
        const keyword = keywordInput.value.trim();
        
        if (!keyword) {
            showError('Please enter a keyword to search');
            return;
        }

        try {
            // show loading
            loadingIndicator.style.display = 'flex';
            resultsContainer.innerHTML = '';
            errorContainer.style.display = 'none';

            //backend request
            const response = await fetch(`${API_ENDPOINT}?keyword=${encodeURIComponent(keyword)}`);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.products && data.products.length > 0) {
                displayResults(data.products);
            } else {
                showError('Product not foun');
            }
        } catch (error) {
            console.error('Erro fetching product:', error);
            showError(`Erro fetching products: ${error.message}`);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    //show results
    function displayResults(products) {
        resultsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.title}" class="product-image" onerror="this.src='https://via.placeholder.com/280x200?text=Imagem+Indispon%C3%ADvel'">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-rating">⭐ ${product.rating}</div>
                    <div class="product-reviews">${product.reviewCount} avaliações</div>
                </div>
            `;
            
            resultsContainer.appendChild(productCard);
        });
    }

    function showError(message) {
        errorContainer.style.display = 'block';
        errorContainer.textContent = message;
        resultsContainer.innerHTML = '';
    }

    //event on enter
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});