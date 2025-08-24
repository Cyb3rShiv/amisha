// Your Firebase configuration
const firebaseConfig = {
      apiKey: "AIzaSyB90fkCeTNQImloJFnAXqNBRiXJKbJh9BA",
  authDomain: "amisha-85a3d.firebaseapp.com",
  projectId: "amisha-85a3d",
  storageBucket: "amisha-85a3d.firebasestorage.app",
  messagingSenderId: "463022691693",
  appId: "1:463022691693:web:794ca3d98f4f82b3783664",
  measurementId: "G-Z2K4FVC3F0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// App Configuration
const PAGE_SIZE = 6; // Adjusted for a 3-column grid
let lastVisible = null;
let isFetching = false;
let hasMore = true;

// DOM Elements
const contentContainer = document.getElementById('content');
const loadMoreBtn = document.getElementById('load-more-btn');

// Load Initial Content
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(true);
});

// Load More Handler
loadMoreBtn.addEventListener('click', () => loadProducts(false));

/**
 * Fetches products from the Firestore database and renders them.
 * @param {boolean} initialLoad - Whether it's the first page load.
 */
async function loadProducts(initialLoad = true) {
    if (isFetching || !hasMore) return;
    isFetching = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
        let query = db.collection("products")
            .orderBy("createdAt", "desc")
            .limit(PAGE_SIZE);

        if (!initialLoad && lastVisible) {
            query = query.startAfter(lastVisible);
        }

        const snapshot = await query.get();
        
        if (snapshot.empty) {
            hasMore = false;
            loadMoreBtn.style.display = 'none';
            if(initialLoad) {
                contentContainer.innerHTML = '<p class="text-center col-12">No products found at the moment. Check back soon!</p>';
            }
            return;
        }

        lastVisible = snapshot.docs[snapshot.docs.length - 1];

        snapshot.forEach(doc => {
            const data = doc.data();
            contentContainer.appendChild(createProductCard(data));
        });

    } catch (error) {
        console.error("Error loading products:", error);
        showError("Failed to load products. Please check your connection and try again.");
    } finally {
        isFetching = false;
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More Products';
    }
}

/**
 * Creates an HTML element for a single product card with the new design.
 * @param {object} data - The product data from Firestore.
 * @returns {HTMLElement} The product card element.
 */
function createProductCard(data) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'col-md-6 col-lg-4';

    const safeData = {
        name: data.name || 'Unnamed Product',
        price: data.price || 0,
        itemNo: data.itemNo || 'N/A',
        // Use the first image as the main display, or a placeholder
        imageUrl: Array.isArray(data.imageUrls) && data.imageUrls.length > 0 
            ? data.imageUrls[0] 
            : 'https://placehold.co/600x600/ecf0f1/34495e?text=No+Image'
    };

    const instagramUsername = "shiveshsatyam_"; // Your Instagram username
    const message = `I'm interested in the product: ${safeData.name} (Item No: ${safeData.itemNo})`;
    const instagramUrl = `https://www.instagram.com/direct/t/${instagramUsername}?text=${encodeURIComponent(message)}`;

    cardWrapper.innerHTML = `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${safeData.imageUrl}" alt="${safeData.name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x600/ecf0f1/34495e?text=Error';">
            </div>
            <div class="product-info">
                <h2>${safeData.name}</h2>
                <p class="item-no">Item No: ${safeData.itemNo}</p>
                <p class="price">₹${safeData.price.toFixed(2)}</p>
                <a href="${instagramUrl}" target="_blank" class="buy-btn">
                    <i class="fab fa-instagram me-2"></i>Buy on Instagram
                </a>
            </div>
        </div>
    `;
    return cardWrapper;
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    // Update icon
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 col-12';
    errorDiv.textContent = message;
    contentContainer.prepend(errorDiv);
}
