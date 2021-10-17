// Search history in local storage
let store = JSON.parse(localStorage.getItem('weather-search-history'));
if (store == null || store == '') {
    store = [];
    //localStorage.setItem('weather-search-history', JSON.stringify(store));
}

// Connect up all the page elements
let inpCitySearchEl = $('#city-search-name');
let btnCitySearchEl = $('#city-search-btn');
let divCitySearchHistoryEl = $('#search-history');
let divWeatherResultsEl = $('#weather-results');
let divWeatherTodayEl = $('#weather-today');
let divWeather5DayEl = $('#weather-5-day');
let errCityNotFoundEl = $('#err-city-not-found');

// update search history 
// They should display in reverse order - most recent at the top
// Only ten entries should be stored and no duplicates
let updateSearchHistory = function(cityName) {
    if (cityName !== '') {
        // don't store duplicates
        if (store.indexOf(cityName)===-1) {
            store.push(cityName);
            if (store.length > 10) {
                // max search history at 10 items
                store.shift();
            }
            // update the browser local storage
            localStorage.setItem('weather-search-history', JSON.stringify(store));
        }   
    }

    // reset the search history by looping through
    divCitySearchHistoryEl.empty();
    for (let i = store.length-1; i >= 0; i--) {
        let btn = $('<button>').addClass('btn btn-secondary my-1').data('city',store[i]).text(store[i]);
        divCitySearchHistoryEl.append(btn);
    }
};

// attach events
let btnCitySearchClick = function(ev) {
    // check if event is present and stop the 
    // default page reload
    if (typeof ev !== 'undefined') {
        ev.preventDefault();
    }
    // trim, reset the input to '' and start the search
    let cityName = inpCitySearchEl.val().trim();
    inpCitySearchEl.val('');
    console.log('Search on city: ' + cityName);
    if (cityName !== '') {
        getCityWeather(cityName);
    }
};

// reuse the search click just fill in the input with the button city data 
let btnCitySearchHistoryClick = function() {
    inpCitySearchEl.val($(this).data('city'));
    btnCitySearchClick();
};


// catch input 'enter' key and button clicks
inpCitySearchEl.keypress(function(e) { if (e.which == 13) { btnCitySearchClick(e); }});
btnCitySearchEl.on('click', btnCitySearchClick);
divCitySearchHistoryEl.on('click', '.btn', btnCitySearchHistoryClick);

// display the weather section
let displayWeatherToday = function(json) {
    let d = new Date(json.dt * 1000);

    let cityNameEl = $('<h2>').text(json.name + ' (' + d.toLocaleDateString() + ')');
    cityNameEl.append($('<img>').addClass('weather-img').attr('alt','weather icon').attr('src','https://openweathermap.org/img/wn/' + json.weather[0].icon + '@2x.png'));
    let cityTempEl = $('<p>').text('Temp: ' + json.main.temp + ' F');
    let cityWindEl = $('<p>').text('Wind: ' + json.wind.speed + ' Mph');
    let cityHumidityEl = $('<p>').text('Humidity: ' + json.main.humidity + '%');
    divWeatherTodayEl.empty();
    divWeatherTodayEl.append(cityNameEl).append(cityTempEl).append(cityWindEl).append(cityHumidityEl);
};

// append a forecast card - should be called as many times as forecast cards to be added
// make sure to remove everything in the div before starting to fill
let displayForecast = function(json) {
    let d = new Date(json.dt * 1000).toLocaleDateString();
    let colEl = $('<div>').addClass('col-12 col-md-6 col-xl-2');
    let cardEl = $('<div>').addClass('card m-1 bg-secondary text-light text-xl-center');
    cardEl.append($('<h5>').addClass('card-header bg-dark text-light').text(d));
    cardEl.append($('<img>').addClass('weather-img px-auto').attr('alt','weather icon').attr('src','https://openweathermap.org/img/wn/' + json.weather[0].icon + '@2x.png'));
    cardEl.append($('<p>').text('Temp: ' + json.temp.day + ' F'));
    cardEl.append($('<p>').text('Wind: ' + json.wind_speed + ' Mph'));
    cardEl.append($('<p>').text('Humidity: ' + json.humidity + '%'));
    colEl.append(cardEl);
    
    divWeather5DayEl.append(colEl);
};

// display the UVI and add classes to get severity coloring
let displayUvIndex = function(uvi) {
    let css = '';
    if (uvi < 2.5) {
        css = 'low';
    } else if (uvi < 5.5) {
        css = 'med';
    } else if (uvi < 7.5) {
        css = 'high';
    } else if (uvi < 10) {
        css = 'extreme';
    }
    let uvIndex = $('<span>').addClass('badge ' + css).text(uvi);
    let uvIndexMessage = $('<p>').text('UVI: ').append(uvIndex);
    divWeatherTodayEl.append(uvIndexMessage);
};

// show an error message if the API call fails because the city is not found
let showCityNotFoundError = function() {
    inpCitySearchEl.addClass('is-invalid');
    setTimeout(function() {
        inpCitySearchEl.removeClass('is-invalid');
    }, 3000);
};

// Calls the onecall API with lat and lon of the city
let getUvIndexAndForecast = async function(lat, lon) {
    let response = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=hourly,minutely&units=imperial&appid=4828b496af91abffe8c14b98e9eb5a2c')
    
    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();

        // empty the forecast div and then refill with 5 entries from tomorrow
        divWeather5DayEl.empty();
        for (let i = 1; i < 6; i++) {
            displayForecast(json.daily[i]);
        }
        // onecall API includes UVI so update the current weather with that data
        displayUvIndex(json.current.uvi);
    } else {
        console.log("HTTP-Error: " + response.status);
        showCityNotFoundError();
    }
};

// get current weather for a city by name
// onecall api doesn't allow name so use this one first and 
// then call onecall using the lat and lon supplied in this 
// response
let getCityWeather = async function(cityName) {
    let response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial&appid=4828b496af91abffe8c14b98e9eb5a2c');

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        // display current weather and then make the calls to
        // get forecast data, UVI and update to search history
        displayWeatherToday(json);
        getUvIndexAndForecast(json.coord.lat, json.coord.lon);
        updateSearchHistory(cityName);
        // show the results if they are hidden
        divWeatherResultsEl.show();
    } else {
        console.log("HTTP-Error: " + response.status);
        showCityNotFoundError();
    }
};

updateSearchHistory('');