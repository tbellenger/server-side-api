// Search history in local storage
let inpCitySearchEl = $('#city-search-name');
let btnCitySearchEl = $('#city-search-btn');
let divCitySearchHistoryEl = $('#search-history');

// attach events
let btnCitySearchClick = function() {
    let cityName = inpCitySearchEl.val();
    console.log('Search on city: ' + cityName);
    if (cityName !== '') {
        getCityWeather(cityName);
    }
}

btnCitySearchEl.on('click', btnCitySearchClick);

let getFiveDayForecast = function(id) {
    let response = fetch('https://api.openweathermap.org/data/2.5/forecast?id=' + id + '&appid=4828b496af91abffe8c14b98e9eb5a2c');

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = response.json();
        console.log(json);
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

let getCityWeather = async function(cityName) {
    console.log('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=4828b496af91abffe8c14b98e9eb5a2c');
    let response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=4828b496af91abffe8c14b98e9eb5a2c');

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        console.log(json);

        console.log(json.id);
        // update the search history with city
        // display the city current weather
        // extract the id for the city
        // call the 5 day api using lat and long
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

