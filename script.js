// DOM Elements
const imageUpload = document.getElementById('image-upload');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const resultsSection = document.getElementById('results-section');
const productList = document.getElementById('product-list');
const progressBar = document.getElementById('progress-bar');

// Mock Product Dataset
const mockProducts = [
  { name: 'CeraVe Moisturizing Cream', link: 'https://www.amazon.com/dp/B000YJ2SLG', category: 'Skincare' },
  { name: 'Apple AirPods Pro', link: 'https://www.amazon.com/dp/B09JQMJHXY', category: 'Miscellaneous' },
  { name: "Paula's Choice SKIN PERFECTING 2% BHA Liquid Salicylic Acid Exfoliant", link: 'https://www.amazon.com/Paulas-Choice-SKIN-PERFECTING-Exfoliant-Facial-Blackheads/dp/B00949CTQQ/ref=sr_1_1_sspa', category: 'Skincare' },
  { name: 'Elizabeth Arden Advanced Ceramide Capsules Daily Youth Restoring Serum', link: 'https://www.amazon.com/Elizabeth-Arden-Ceramide-Capsules-Anti-Aging/dp/B0D1G7543F/ref=sr_1_2_sspa', category: 'Skincare' },
  { name: "Paula's Choice C15 Super Booster with 15% Vitamin C", link: 'https://www.amazon.com/Paulas-Choice-Booster-Vitamin-Brightening/dp/B00EYVSOKY/ref=sr_1_4_sspa', category: 'Skincare' },
  { name: 'Under Eye Patches for Dark Circles & Wrinkles', link: 'https://www.amazon.com/Under-Eye-Patches-Treatments-Wrinkles/dp/B09NXS395V/ref=sr_1_8', category: 'Skincare' },
  { name: 'Initial Necklaces - Personalized Pendant Necklace', link: 'https://www.amazon.com/Initial-Necklaces-Necklace-Personalized-Pendant/dp/B0C39R42VC/ref=sr_1_5_sspa', category: 'Accessories' },
  { name: 'Trendsmax Initial Pendant Necklace Stainless Steel', link: 'https://www.amazon.com/Trendsmax-Initial-Pendant-Necklace-Stainless/dp/B07NN5P4C7', category: 'Accessories' }
];

// Load the AI Model
let faceModel;
async function loadModel() {
  try {
    faceModel = await blazeface.load();
    console.log('%cAI Model Loaded Successfully', 'color: #00ff00; font-weight: bold;');
  } catch (error) {
    console.error('Error loading AI model:', error);
    alert('Failed to load AI model. Please refresh the page.');
  }
}
loadModel();

// Event Listeners
analyzeBtn.addEventListener('click', handleAnalyze);
resetBtn.addEventListener('click', resetApp);

// Handle Image Analysis
async function handleAnalyze() {
  const file = imageUpload.files[0];

  if (!file) {
    alert('Please upload an image before analyzing!');
    return;
  }

  showLoadingIndicator();

  try {
    const image = await readImage(file);
    const predictions = await faceModel.estimateFaces(image, false);

    hideLoadingIndicator();

    if (predictions && predictions.length > 0) {
      console.log('Face detected:', predictions);
      const detectedCategory = dynamicCategoryPrediction(predictions); // Dynamically determine category
      console.log(`Detected Category: ${detectedCategory}`);
      displayRecommendations(detectedCategory);
    } else {
      console.log('No face detected. Defaulting to Miscellaneous category.');
      displayRecommendations('Miscellaneous'); // Default recommendation
    }
  } catch (error) {
    hideLoadingIndicator();
    console.error('Error analyzing the image:', error);
    alert('An error occurred during analysis. Please try again with a clear face image.');
  }
}

// Dynamic Category Prediction
function dynamicCategoryPrediction(predictions) {
  try {
    const { landmarks } = predictions[0];
    const featureSize = landmarks.length;

    if (featureSize > 40) {
      return 'Skincare'; // Example: More landmarks mean skincare focus
    } else {
      return 'Accessories'; // Default fallback category for fewer landmarks
    }
  } catch (error) {
    console.error('Error in dynamic category prediction:', error);
    return 'Miscellaneous'; // Default fallback category on error
  }
}

function displayRecommendations(category) {
  resultsSection.hidden = false;
  productList.innerHTML = ''; // Clear previous results

  // Filter products by category
  const recommendedProducts = mockProducts.filter(product => product.category === category);

  if (recommendedProducts.length === 0) {
    productList.innerHTML = '<p>No products found for the selected category.</p>';
    return;
  }

  // Randomize the order of the recommended products
  const shuffledProducts = recommendedProducts.sort(() => 0.5 - Math.random());

  // Limit the number of products displayed (e.g., max 3)
  const productsToShow = shuffledProducts.slice(0, 3);

  // Create and display product cards
  productsToShow.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <h3>${product.name}</h3>
      <a href="${product.link}" target="_blank" class="btn">Buy Now</a>
    `;
    productList.appendChild(productCard);
  });

  console.log(`Displayed ${productsToShow.length} product(s) for category: ${category}`);
}

// Utility: Convert Uploaded Image to Tensor
async function readImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
      img.onload = () => resolve(tf.browser.fromPixels(img));
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

// Reset Application
function resetApp() {
  resultsSection.hidden = true;
  productList.innerHTML = '';
  imageUpload.value = '';
  hideLoadingIndicator();
  progressBar.style.width = '0%'; // Reset progress bar
}

// Loading Indicators
function showLoadingIndicator() {
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
  progressBar.style.width = '50%'; // Simulate progress
}

function hideLoadingIndicator() {
  analyzeBtn.textContent = 'Analyze';
  analyzeBtn.disabled = false;
  progressBar.style.width = '100%'; // Complete progress
  setTimeout(() => (progressBar.style.width = '0%'), 1000); // Reset after 1s
}

// Debugging Logs
function logDebugInfo(message) {
  console.log(`%c${message}`, 'color: #ffcc00; font-weight: bold;');
}
