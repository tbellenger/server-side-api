// Search history in local storage
let store = JSON.parse(localStorage.getItem('weather-search-history'));
if (store == null || store == '') {
    store = [];
    //localStorage.setItem('weather-search-history', JSON.stringify(store));
}
let inpCitySearchEl = $('#city-search-name');
let btnCitySearchEl = $('#city-search-btn');
let divCitySearchHistoryEl = $('#search-history');
let divWeatherResultsEl = $('#weather-results');
let divWeatherTodayEl = $('#weather-today');
let divWeather5DayEl = $('#weather-5-day');

let updateSearchHistory = function(cityName) {
    if (cityName !== '') {
        console.log('storing ' + cityName);
        store.push(cityName);
        if (store.length > 10) {
            // max search history at 10 items
            store.shift();
        }
        localStorage.setItem('weather-search-history', JSON.stringify(store));
    }
    divCitySearchHistoryEl.empty();
    for (let i = store.length-1; i >= 0; i--) {
        let btn = $('<button>').addClass('btn btn-secondary my-1').data('city',store[i]).text(store[i]);
        divCitySearchHistoryEl.append(btn);
    }
}

// attach events
let btnCitySearchClick = function() {
    let cityName = inpCitySearchEl.val().trim();
    inpCitySearchEl.val('');
    console.log('Search on city: ' + cityName);
    if (cityName !== '') {
        updateSearchHistory(cityName);
        getCityWeather(cityName);
        divWeatherResultsEl.show();
    }
}

let btnCitySearchHistoryClick = function() {
    inpCitySearchEl.val($(this).data('city'));
    btnCitySearchClick();
}

inpCitySearchEl.keypress(function(e) { if (e.which == 13) { btnCitySearchClick(); }});
btnCitySearchEl.on('click', btnCitySearchClick);
divCitySearchHistoryEl.on('click', '.btn', btnCitySearchHistoryClick);

let displayWeatherToday = function(json) {
    let d = new Date(json.dt * 1000);

    let cityNameEl = $('<h2>').text(json.name + ' (' + d.toLocaleDateString() + ')');
    cityNameEl.append($('<img>').attr('src','http://openweathermap.org/img/wn/' + json.weather[0].icon + '.png'));
    let cityTempEl = $('<p>').text('Temp: ' + json.main.temp + 'F');
    let cityWindEl = $('<p>').text('Wind: ' + json.wind.speed + 'Mph');
    let cityUvIndexEl = $('<p>').text('Humidity: ' + json.main.humidity);
    divWeatherTodayEl.empty();
    divWeatherTodayEl.append(cityNameEl).append(cityTempEl).append(cityWindEl).append(cityUvIndexEl);
}

let getFiveDayForecast = async function(id) {
    let response = await fetch('https://api.openweathermap.org/data/2.5/forecast?id=' + id + '&units=imperial&appid=4828b496af91abffe8c14b98e9eb5a2c');

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        console.log(json);
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

let getCityWeather = async function(cityName) {
    let response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial&appid=4828b496af91abffe8c14b98e9eb5a2c');

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        console.log(json);
        displayWeatherToday(json);
        getFiveDayForecast(json.id);
        // update the search history with city
        // display the city current weather
        // extract the id for the city
        // call the 5 day api using id
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

updateSearchHistory('');