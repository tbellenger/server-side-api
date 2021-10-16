

let response = await fetch('https://api.openweathermap.org/data/2.5/forecast?id=2643743&appid=4828b496af91abffe8c14b98e9eb5a2c');

if (response.ok) { // if HTTP-status is 200-299
  // get the response body (the method explained below)
  let json = await response.json();
  console.log(json);
} else {
  alert("HTTP-Error: " + response.status);
}

let response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=San Francisco&appid=4828b496af91abffe8c14b98e9eb5a2c');

if (response.ok) { // if HTTP-status is 200-299
  // get the response body (the method explained below)
  let json = await response.json();
  console.log(json);
} else {
  alert("HTTP-Error: " + response.status);
}

