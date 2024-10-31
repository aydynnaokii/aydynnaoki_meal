// Select elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetails = document.querySelector('.meal-details');
const mealDetailsContent = document.querySelector('.meal-details-content');
const closeBtn = document.getElementById('recipe-close-btn');
const categorySelect = document.getElementById('category-select');

// Initialize an empty grocery list
var groceryList = [];
var currentUpdateIndex = -1;

// Load categories and planner/grocery list on page load
window.onload = () => {
  loadCategories();
  showMealPlanner();
  renderGroceryList(); // Update to call the render function
};

// Fetch and display categories
function loadCategories() {
  fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then(response => response.json())
    .then(data => {
      data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.strCategory;
        option.textContent = category.strCategory;
        categorySelect.appendChild(option);
      });
    });
}

// Event listeners
if (searchBtn) searchBtn.addEventListener('click', searchMeal);
if (mealList) mealList.addEventListener('click', getMealRecipe);
if (closeBtn) closeBtn.addEventListener('click', () => {
  mealDetails.classList.remove('showRecipe');
});
if (categorySelect) categorySelect.addEventListener('change', filterByCategory);

// Search meal by name
function searchMeal() {
  const searchQuery = searchInput.value.trim();
  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`)
    .then(response => response.json())
    .then(data => displayMeals(data.meals));
}

// Filter meals by category
function filterByCategory() {
  const category = categorySelect.value;
  if (category) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
      .then(response => response.json())
      .then(data => displayMeals(data.meals));
  }
}

// Display meals in meal list
function displayMeals(meals) {
  let html = '';
  if (meals) {
    meals.forEach(meal => {
      html += `
        <div class="meal-item" data-id="${meal.idMeal}">
          <div class="meal-img">
            <img src="${meal.strMealThumb}" alt="food">
          </div>
          <div class="meal-name">
            <h3>${meal.strMeal}</h3>
            <a href="#" class="recipe-btn">Get Recipe</a>
            <button onclick="addToPlanner(${meal.idMeal})">Add to Planner</button>
            <button onclick="addToGroceryList(${meal.idMeal})">Add to Grocery List</button>
          </div>
        </div>`;
    });
    mealList.classList.remove('notFound');
  } else {
    html = "Sorry, we didn't find any meal!";
    mealList.classList.add('notFound');
  }
  mealList.innerHTML = html;
}

// Fetch and display meal recipe details in the modal pop-up
function getMealRecipe(e) {
  e.preventDefault();
  if (e.target.classList.contains('recipe-btn')) {
    const mealItem = e.target.closest('.meal-item');
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
      .then(response => response.json())
      .then(data => mealRecipeModal(data.meals[0]));
  }
}

// Recipe modal with full details
function mealRecipeModal(meal) {
  let ingredients = '';
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
    }
  }

  const html = `
    <h2 class="recipe-title">${meal.strMeal}</h2>
    <p class="recipe-category">${meal.strCategory} | ${meal.strArea}</p>
    <div class="recipe-instruct">
      <h3>Instructions:</h3>
      <p>${meal.strInstructions}</p>
    </div>
    <div class="recipe-meal-img">
      <img src="${meal.strMealThumb}" alt="">
    </div>
    <div class="recipe-ingredients">
      <h3>Ingredients:</h3>
      <ul>${ingredients}</ul>
    </div>
    <div class="recipe-link">
      <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
    </div>`;

  mealDetailsContent.innerHTML = html;
  mealDetails.classList.add('showRecipe');
}

// Meal Planner CRUD
function addToPlanner(mealId) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then(response => response.json())
    .then(data => {
      const planner = JSON.parse(localStorage.getItem('mealPlanner')) || [];
      planner.push(data.meals[0]);
      localStorage.setItem('mealPlanner', JSON.stringify(planner));
      alert(`${data.meals[0].strMeal} added to your meal planner!`);
      showMealPlanner();
    });
}

// Grocery List CRUD
function addToGroceryList(mealId) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then(response => response.json())
    .then(data => {
      const groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
      groceryList.push(data.meals[0]);
      localStorage.setItem('groceryList', JSON.stringify(groceryList));
      alert(`${data.meals[0].strMeal} added to your grocery list!`);
      renderGroceryList(); // Call to render grocery list
    });
}

// Show Meal Planner
function showMealPlanner() {
  const planner = JSON.parse(localStorage.getItem('mealPlanner')) || [];
  const html = planner.map((meal, index) => 
    `<li>${meal.strMeal} <button onclick="deleteFromPlanner(${index})">Delete</button></li>`
  ).join('');
  document.getElementById('planner').innerHTML = html;
}

// Show Grocery List
function renderGroceryList() {
  var groceryListElement = document.getElementById('groceryList');
  groceryListElement.innerHTML = ''; // Clear current list
  const groceryList = JSON.parse(localStorage.getItem('groceryList')) || []; // Ensure to fetch from local storage
  groceryList.forEach((meal, index) => {
    var li = document.createElement('li');
    li.innerHTML = `
      <span>${meal.strMeal}</span>
      <div>
        <button onclick="openUpdateModal(${index})">Update</button>
        <button onclick="deleteFromGroceryList(${index})">Delete</button>
      </div>
    `;
    groceryListElement.appendChild(li);
  });
}

// Function to delete an item from the grocery list
function deleteFromGroceryList(index) {
  const groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
  groceryList.splice(index, 1);
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderGroceryList(); // Re-render the grocery list
}

// Function to open the update modal
function openUpdateModal(index) {
  currentUpdateIndex = index; // Set the index of the item to be updated
  const groceryList = JSON.parse(localStorage.getItem('groceryList')) || []; // Fetch updated grocery list
  document.getElementById('update-input').value = groceryList[index].strMeal; // Pre-fill input with current value
  document.getElementById('update-modal').style.display = 'flex'; // Show the modal
}

// Close modal functionality
document.getElementById('update-close-btn').onclick = function() {
  document.getElementById('update-modal').style.display = 'none'; // Hide modal on close
};

// Update item functionality
document.getElementById('update-btn').onclick = function() {
  var newValue = document.getElementById('update-input').value; // Get new value from input
  if (newValue) {
    const groceryList = JSON.parse(localStorage.getItem('groceryList')) || []; // Fetch updated grocery list
    groceryList[currentUpdateIndex].strMeal = newValue; // Update the meal name in the list
    localStorage.setItem('groceryList', JSON.stringify(groceryList)); // Save updated grocery list
    document.getElementById('update-modal').style.display = 'none'; // Hide the modal
    renderGroceryList(); // Re-render the grocery list
  }
};

// Delete function for meal planner
function deleteFromPlanner(index) {
  const planner = JSON.parse(localStorage.getItem('mealPlanner')) || [];
  planner.splice(index, 1);
  localStorage.setItem('mealPlanner', JSON.stringify(planner));
  showMealPlanner();
}

// Example: Adding initial groceries for testing
groceryList.push('Milk', 'Eggs', 'Bread');
renderGroceryList(); // Initial rendering of the grocery list


