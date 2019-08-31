'use strict';

const zomatoKey = "32312aba7e93842299db5940c836756b";
const openCageKey = "a59e5686483241deb66b04c5df566648";
const edamamKey = "acf9384e7d3edd92b83b0fae2140f325";
const edamamID = "37ac22a7";

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
  return queryItems.join('&');
}

function getIngRecipes() {
  let baseIngURL = "https://api.edamam.com/search?";
  const ingParams = {
    q: $('#ingredient').val(),
    to: 10,
    app_id: edamamID,
    app_key: edamamKey
  }
  let ingQueryString=formatQueryParams(ingParams);
  let ingURL = baseIngURL + ingQueryString;
  fetch(ingURL)
    .then(response => response.json())
    .then(responseJson => displayRecipes(responseJson))
}

function buildRecipes(responseJson) {
  let recipes=[];
  let recipe={};
  for (let i=0; i<responseJson.hits.length; i++) {
    recipe.recipeName=responseJson.hits[i].recipe.label;
    recipe.recipePic=responseJson.hits[i].recipe.image;
    recipe.recipeServings=responseJson.hits[i].recipe.yield;
    recipe.recipeURL=responseJson.hits[i].recipe.url;
    recipe.ingredientLines=[];
    for (let j=0; j<responseJson.hits[i].recipe.ingredientLines.length; j++) {
      recipe.ingredientLines.push(responseJson.hits[i].recipe.ingredientLines[j]);
    }
    recipes.push(recipe);
    recipe={};
  }
  return recipes;
}

function displayRecipes(responseJson) {
  if (responseJson.count===0) {
    alert("No results found, check your spelling or try a different ingredient")
  } else {  
    const recipes=buildRecipes(responseJson);
    $('main').empty();
    $('main').addClass("recipes");
    $('button').removeClass("hidden");
    $('#recipe-instructions').removeClass("hidden");
    for (let i=0; i<recipes.length; i++) {    
      $('main').append(`<section class="recipe-info"><img src="${recipes[i].recipePic}" alt="recipe picture" class="recipe-pic"><div class="recipe-details"><div class="results-header"><h3 class="recipe-title"><a href="${recipes[i].recipeURL}" target="_blank">${recipes[i].recipeName}</h3></a><h4 class="servings">${recipes[i].recipeServings} Servings</h4></div><ul class="ing-list-${i}"></ul></div></section>`);
      for (let j=0; j<recipes[i].ingredientLines.length; j++) {
        let ingItem=recipes[i].ingredientLines[j];
        $(`.ing-list-${i}`).append(`<li>•${ingItem}</li>`)
      }
    }
  }
}

function ingFormSubmit() {
  $('#ingredient-search').submit(event => {
    event.preventDefault();
    getIngRecipes();
  });
}

function getRandomRecipes() {
  $('main').empty();
  $('main').addClass("recipes");
  $('button').removeClass("hidden");
  $('#random-instructions').removeClass("hidden");
  for (let i=0; i<10; i++)
    fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
      .then(response=>response.json())
      .then(responseJson => displayRandom(responseJson, i))
}

function displayRandom(responseJson, recipeNum) {
  let randomTitle = responseJson.meals[0].strMeal;
  let randomImg = responseJson.meals[0].strMealThumb;
  let randomURL = responseJson.meals[0].strSource;
  let randomCuisine = responseJson.meals[0].strArea;
  let randomCategory = responseJson.meals[0].strCategory;
  $('main').append(`<section class="recipe-info"><img src="${randomImg}" alt="recipe picture" class="recipe-pic"><div class="recipe-details"><div class="results-header"><h3 class="recipe-title"><a href="${randomURL}" target="_blank">${randomTitle}</h3></a><h4 class="random-info">${randomCuisine} ${randomCategory}</h4></div><ul class="ing-list-${recipeNum}"></ul></div></section>`);
  function organizeIng(responseJson) {
    const ingredientsList = [];
      for (let i=0; i <= 20; i++) {
        let ingredientProperty = 'strIngredient' + i;
        let measureProperty = 'strMeasure' + i;
        let ingredient = responseJson.meals[0][ingredientProperty] + ', ' + responseJson.meals[0][measureProperty];
        ingredientsList.push(ingredient);
      }
    for (let i=0; i<ingredientsList.length; i++) {
      if (ingredientsList[i] === ", ") {
        continue;
      } else if (ingredientsList[i] === "null, null") {
        continue;
      } else if (ingredientsList[i] ===",  ") {
        continue;
      }  else if (ingredientsList[i] === "undefined, undefined") {
        continue;
        } else { 
        $(`.ing-list-${recipeNum}`).append(`<li>•${ingredientsList[i]}</li>`)
      }
    }
  }
  organizeIng(responseJson);
}

function randomFormSubmit() {
  $('#random-search').submit(event => {
    event.preventDefault();
    getRandomRecipes();
  });
}

function getCoords() {
  let baseCoordsURL = "https://api.opencagedata.com/geocode/v1/json?";
  const coordsParams = {
    key: openCageKey,
    q: $('#address').val()
  }
  let coordsQueryString = formatQueryParams(coordsParams);
  let coordsURL = baseCoordsURL + coordsQueryString;
  fetch(coordsURL)
    .then(response => response.json())
    .then(responseJson => passCoords(responseJson));
}

function passCoords(responseJson) {
  let coordsLat = responseJson.results[0].geometry.lat;
  let coordsLong = responseJson.results[0].geometry.lng;
  getRestaurants(coordsLat, coordsLong);
}

function getRestaurants(latitude, longitude) {
  let baseZomatoURL = "https://developers.zomato.com/api/v2.1/geocode?"
  const zomatoParams = {
    lat: latitude,
    lon: longitude
  };
  const restOptions = {
    headers: new Headers({
      "user-key": zomatoKey})
  };
  let restQueryString = formatQueryParams(zomatoParams);
  let restURL = baseZomatoURL + restQueryString;
  fetch(restURL, restOptions)
    .then(response => response.json())
    .then(responseJson => displayRestaurants(responseJson))
}

function displayRestaurants(responseJson) {
  if (responseJson.code === 400) {
    alert("Please enter a valid address")
  } else {
    $('main').empty();
    $('main').addClass("restaurants");
    $('button').removeClass("hidden");
    for (let i=0; i<10; i++) {
      let restaurantName = responseJson.nearby_restaurants[i].restaurant.name;
      let restaurantURL = responseJson.nearby_restaurants[i].restaurant.url;
      let restaurantAddress = responseJson.nearby_restaurants[i].restaurant.location.address;
      let restaurantCost = responseJson.nearby_restaurants[i].restaurant.average_cost_for_two;
      let restaurantPic = responseJson.nearby_restaurants[i].restaurant.thumb || "https://dummyimage.com/500x350/000/ffffff&text=No+Image+Available";
      let restaurantCuisines = responseJson.nearby_restaurants[i].restaurant.cuisines;
      $('main').append(`<section class="restaurant-info"><img src="${restaurantPic}" alt="restaurant or meal image" class="restaurant-pic"><div class="restaurant-details"><div class="results-header"><a href="${restaurantURL}"><h2 class="restaurant-name">${restaurantName}</h2></a><h4 class="cuisine-and-cost">${restaurantCuisines} - Around $${restaurantCost} for 2</h4><h4 class="address">${restaurantAddress}</h4></div></div></section>`)
    }
  }
}

function restaurantFormSubmit() {
  $('#restaurant-search').submit(event => {
    event.preventDefault();
    getCoords();
  });
}

$(function() {
  console.log('App is Loaded');
  ingFormSubmit();
  randomFormSubmit();
  restaurantFormSubmit();
});