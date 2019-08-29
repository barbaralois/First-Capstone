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
    to: $('#max-results').val(),
    app_id: edamamID,
    app_key: edamamKey
  }
  let ingQueryString=formatQueryParams(ingParams);
  let ingURL = baseIngURL + ingQueryString;
  fetch(ingURL)
    .then(response => response.json())
    .then(responseJson => displayRecipes(responseJson));
}

function displayRecipes(responseJson) {
  $('main').empty();
  $('main').addClass("recipes");
  $('button').removeClass("hidden");
  $('#recipe-instructions').removeClass("hidden");
  for (let i=0; i<responseJson.hits.length; i++) {    
    let recipeName=responseJson.hits[i].recipe.label;
    let recipePic=responseJson.hits[i].recipe.image;
    let recipeServings=responseJson.hits[i].recipe.yield;
    let recipeURL=responseJson.hits[i].recipe.url;
    $('main').append(`<section class="recipe-info"><img src="${recipePic}" alt="recipe picture" class="recipe-pic"><div class="recipe-details"><h3 class="recipe-title"><a href="${recipeURL}" target="_blank">${recipeName}</h3></a><h4 class="servings">${recipeServings} Servings</h4><ul class="ing-list"></ul></div></section>`);
    for (let j=0; j<responseJson.hits[i].recipe.ingredientLines.length; j++) {
      let ingItem=responseJson.hits[i].recipe.ingredientLines[j];
      $('.ing-list').append(`<li>•${ingItem}</li>`)
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
      .then(responseJson => displayRandom(responseJson))
}

function displayRandom(responseJson) {
  let randomTitle = responseJson.meals[0].strMeal;
  let randomImg = responseJson.meals[0].strMealThumb;
  let randomURL = responseJson.meals[0].strSource;
  let randomCuisine = responseJson.meals[0].strArea;
  let randomCategory = responseJson.meals[0].strCategory;
  $('main').append(`<section class="recipe-info"><img src="${randomImg}" alt="recipe picture" class="recipe-pic"><div class="recipe-details"><h3 class="recipe-title"><a href="${randomURL}" target="_blank">${randomTitle}</h3></a><h4 class="random-info">${randomCuisine} ${randomCategory}</h4><ul class="ing-list"></ul></div></section>`);
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
        $('.ing-list').append(`<li>•${ingredientsList[i]}</li>`)
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
    //count: $('#max-restaurants').val(),
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
    .then(responseJson => displayRestaurants(responseJson));
}

function displayRestaurants(responseJson) {
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
    $('main').append(`<section class="restaurant-info"><img src="${restaurantPic}" alt="restaurant or meal image" class="restaurant-pic"><div class="restaurant-details"><a href="${restaurantURL}"><h2 class="restaurant-name">${restaurantName}</h2></a><h4 class="cuisine-and-cost">${restaurantCuisines} - Around $${restaurantCost} for 2</h4><h4 class="address">${restaurantAddress}</h4></div></section>`)
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