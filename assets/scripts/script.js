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
        if (store.indexOf(cityName)===-1) {
            store.push(cityName);
            if (store.length > 10) {
                // max search history at 10 items
                store.shift();
            }
            localStorage.setItem('weather-search-history', JSON.stringify(store));
        }   
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
    cityNameEl.append($('<img>').addClass('card-img').attr('alt','weather icon').attr('src','http://openweathermap.org/img/wn/' + json.weather[0].icon + '@2x.png'));
    let cityTempEl = $('<p>').text('Temp: ' + json.main.temp + 'F');
    let cityWindEl = $('<p>').text('Wind: ' + json.wind.speed + 'Mph');
    let cityHumidityEl = $('<p>').text('Humidity: ' + json.main.humidity + '%');
    divWeatherTodayEl.empty();
    divWeatherTodayEl.append(cityNameEl).append(cityTempEl).append(cityWindEl).append(cityHumidityEl);
}

let displayForecast = function(json) {
    let d = new Date(json.dt * 1000).toLocaleDateString();
    let colEl = $('<div>').addClass('col-12 col-md-6 col-xl-2');
    let cardEl = $('<div>').addClass('card m-1 bg-secondary text-light text-xl-center');
    cardEl.append($('<h5>').addClass('card-header bg-dark text-light').text(d));
    cardEl.append($('<img>').addClass('card-img').attr('alt','weather icon').attr('src','http://openweathermap.org/img/wn/' + json.weather[0].icon + '@2x.png'));
    cardEl.append($('<p>').text('Temp: ' + json.temp.day + 'F'));
    cardEl.append($('<p>').text('Wind: ' + json.wind_speed + 'Mph'));
    cardEl.append($('<p>').text('Humidity: ' + json.humidity + '%'));
    
    //cardEl.append(headerEl).append(contentEl);
    colEl.append(cardEl);
    
    divWeather5DayEl.append(colEl);
}

let getUvIndexAndForecast = async function(lat, lon) {
    console.log(lat, lon);
    let response = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=hourly,minutely&units=imperial&appid=4828b496af91abffe8c14b98e9eb5a2c')
    
    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        console.log(json);

        divWeather5DayEl.empty();
        for (let i = 1; i < 6; i++) {
            displayForecast(json.daily[i]);
        }

        let uvi = json.current.uvi;
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
        let uvIndex = $('<span>').addClass('badge ' + css).text(json.current.uvi);
        let uvIndexMessage = $('<p>').text('UVI: ').append(uvIndex);
        divWeatherTodayEl.append(uvIndexMessage);
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

let getCityWeather = async function(cityName) {
    let response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial&appid=4828b496af91abffe8c14b98e9eb5a2c');

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        displayWeatherToday(json);
        getUvIndexAndForecast(json.coord.lat, json.coord.lon);
        //getFiveDayForecast(json.id);
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

updateSearchHistory('');