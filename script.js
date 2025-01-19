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
  { name: 'La Roche-Posay Gentle Cleanser', link: 'https://www.amazon.com/dp/B01MSSDEPK', category: 'Skincare' },
  { name: 'Dyson Supersonic Hair Dryer', link: 'https://www.amazon.com/dp/B01N5IV1H8', category: 'Miscellaneous' },
  { name: 'Maybelline Matte Ink', link: 'https://www.amazon.com/dp/B071YS2JXZ', category: 'Cosmetics' },
  { name: 'Neutrogena Sunscreen SPF 70', link: 'https://www.amazon.com/dp/B0009F3S78', category: 'Skincare' },
  { name: 'Apple AirPods Pro', link: 'https://www.amazon.com/dp/B09JQMJHXY', category: 'Miscellaneous' },
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

    if (predictions.length > 0) {
      console.log('Face detected:', predictions);
      const detectedCategory = dynamicCategoryPrediction(predictions); // Dynamically determine category
      displayRecommendations(detectedCategory);
    } else {
      console.log('No face detected');
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
  // Placeholder logic for dynamic category detection
  const { landmarks } = predictions[0];
  const featureSize = landmarks.length;

  if (featureSize > 40) return 'Skincare'; // Example: More landmarks mean skincare focus
  return 'Cosmetics'; // Default fallback category
}

// Display Recommendations
function displayRecommendations(category) {
  resultsSection.hidden = false;
  productList.innerHTML = ''; // Clear previous results

  const recommendedProducts = mockProducts.filter(product => product.category === category);

  if (recommendedProducts.length === 0) {
    productList.innerHTML = '<p>No products found for the selected category.</p>';
    return;
  }

  recommendedProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <h3>${product.name}</h3>
      <a href="${product.link}" target="_blank" class="btn">Buy Now</a>
    `;
    productList.appendChild(productCard);
  });
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

// Utility: Debounced Log for Performance Insights
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Advanced Logging for Debugging
function logDebugInfo(message) {
  console.log(`%c${message}`, 'color: #ffcc00; font-weight: bold;');
}

// Future Enhancements Placeholder
// Add interactivity for advanced category detection
