document.addEventListener("DOMContentLoaded", getLocation);
document.body.addEventListener("click", getLocation);

function getLocation() {
  if (navigator.geolocation) {
    //find position
    let to = 1000 * 30; //1000 * 30 = 30sec
    let max = 1000 * 30 * 30; //1000 * 30 * 30 = 1hr
    var params = { enableHighAccuracy: false, timeout: to, maximumAge: max };
    navigator.geolocation.getCurrentPosition(reportPosition, gpsError, params);
  } else {
    //browser does not support geolocation api
    alert("Sorry, your browser does not support location detection.");
  }
}

function reportPosition(position) {
  //check if data exists

  let key = `openWeather-jc`;
  const localValue = localStorage.getItem(key);
  if (!localValue) {
    //if data doesn't exist, fetch
    console.log(`No data in storage; fetching new data.`);
    fetchData(position);
  }
  const item = JSON.parse(localValue);

  //if data is +30mins old, remove old data, fetch
  const now = new Date();
  if (now.getTime() > item["expiry"]) {
    localStorage.removeItem(key);
    fetchData(position);
  }
  //if data is present && >30mins old, build data from storage
  buildData(item.value);
}

function fetchData(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let API = "e78f8841cd9c4c49b05e8cf384ff8db0";
  let units = "metric";
  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API}&units=${units}`;

  fetch(url)
    .then((resp) => {
      if (resp.ok) {
        console.log("good response");
        //response is the response object
        //we extract the text(), json(), or blob() from it
        return resp.json(); //this line calls the next then()
      } else {
        console.log("bad response", response.status);
        throw new Error("BAD RESPONSE");
      }
    })
    .then((data) => {
      //store data to local storage
      let value = data;
      let key = `openWeather-jc`;
      const ttl = 1800000; //30mins
      storeKey(key, value, ttl);
      //once fetched, store into local storage
      function storeKey(key, value, ttl) {
        const now = new Date();
        const item = {
          value: value,
          expiry: now.getTime() + ttl,
        };
        localStorage.setItem(key, JSON.stringify(item));
      }
      buildData(data);
    })
    .catch((err) => {
      //err is the Error object
      console.error(err);
      //document.querySelector('main').innerHTML += '<p>Unable to fetch<p>'
    });
}

function buildData(data) {
  // section.weather //
  let weatherHTML = "";
  let weather = document.querySelector(".weather");
  weather.innerHTML = "";

  //turn timestamps to hours:
  let sunriseObject = new Date(data.current.sunrise * 1000);
  let sunsetObject = new Date(data.current.sunset * 1000);

  weatherHTML = weatherHTML.concat(`
    <h3>Conditions</h3>

    <div class="container">
      <p>
      <img src="./img/icons/sunrise.svg" alt="sunrise icon">Sunrise ${sunriseObject.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}
      </p>
      <p>
        <img src="./img/icons/sunset.svg" alt="sunrise icon">Sunset ${sunsetObject.toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )}
      </p>
      <p>
        <img src="./img/icons/wind.svg" alt="wind icon">Wind ${
          data.current["wind_speed"]
        }km/h
      </p>
      <p>
        <img src="./img/icons/direction.svg" alt="direction icon">Direction ${
          data.current["wind_deg"]
        }&#176;
      </p>
      <p>
        <img src="./img/icons/cloud.svg" alt="cloud icon">Cloud cover ${
          data.current.clouds
        }&#37;
      </p>
    </div>
  `);

  // section.temperature //
  let temperatureHTML = "";
  let temperature = document.querySelector(".temperature");
  temperature.innerHTML = "";

  //round temperatures
  let currentTemp = Math.round(data.current.temp * 10) / 10;
  let feelsLike = Math.round(data.current["feels_like"] * 10) / 10;

  temperatureHTML = temperatureHTML.concat(`
  <img src="./img/weatherIcons/SVG/${
    data.current.weather[0]["icon"]
  }.svg" alt="weather icon">
    <div class="container">
      <p>Currently ${Math.round(currentTemp)}&#176;C</p>
      <div>
        <p>${data.current.weather[0]["description"]}</p>
        <p>Feels like ${Math.round(feelsLike)}&#176;C</p>
      </div>
    </div>
  `);

  // section.stats //
  let statsHTML = "";
  let stats = document.querySelector(".stats");
  stats.innerHTML = "";

  //round temperatures
  let dewPoint = Math.round(data.current["dew_point"] * 1) / 1;

  statsHTML = statsHTML.concat(`
    <h3>Stats</h3>

    <div class="container">

    <div>
      <p><img src="./img/icons/pressure.svg" alt="pressure icon">
      Pressure ${data.current.pressure}mb</p>
      <p><img src="./img/icons/humidity.svg" alt="humidity icon">
      Humidity ${data.current.humidity}&#37;</p>
    </div>

    <div>
      <p><img src="./img/icons/uvi.svg" alt="uvi icon">
    Uvi ${data.current.uvi}</p>
      <p><img src="./img/icons/visibility.svg" alt="visibility icon">
    Visibility ${data.current.visibility} Ft.</p>
    </div>

    </div>
  `);

  // section.hourly //

  let hourlyHTML = "";
  let hourly = document.querySelector("#hourly");
  hourly.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    //turn timestamps to hours
    let hourlyTime = new Date(data.hourly[i]["dt"] * 1000);

    //pulling graph data from JSON and rounding numbers
    let temp = Math.round(data.hourly[i]["temp"] * 1) / 1;
    let feelsLike = Math.round(data.hourly[i]["feels_like"] * 1) / 1;
    let pop = Math.round(data.hourly[i]["pop"] * 100);
    //precip is per (if) case bellow

    if (data.hourly[i]["snow"]) {
      //if snow
      let precip = data.hourly[i]["snow"]["1h"];

      hourlyHTML = hourlyHTML.concat(`
      <div class="container">
        <h4>${hourlyTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</h4>
        <img src="./img/weatherIcons/SVG/${
          data.hourly[i]["weather"]["0"]["icon"]
        }.svg" alt="weather icon for hour ${hourlyTime}">
        <span>${data.hourly[i]["weather"][0]["description"]}</span>

        <div class="graph">
            <p>Temperature </p>
            <p style="width:${
              (Math.abs(temp) * 64) / 100 + 33
            }%;">${temp}&#176;C</p>
            <p>Feels like </p>
            <p style="width:${
              (Math.abs(feelsLike) * 64) / 100 + 33
            }%;">${feelsLike}&#176;C</p>
            <p>P.O.P. </p>
            <p style="width:${
              (Math.abs(pop) * 64) / 100 + 33
            }%;">${pop}&#37;</p>
            <p>Snow </p>
            <p style="width:${
              (Math.abs(precip) * 10 * 64) / 100 + 33
            }%;">${precip}%</p>
        </div>
        
      </div>
      `);
    } else if (data.hourly[i]["rain"]) {
      //if rain
      let precip = data.hourly[i]["rain"]["1h"];

      hourlyHTML = hourlyHTML.concat(`
      <div class="container">
        <h4>${hourlyTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</h4>
        <img src="./img/weatherIcons/SVG/${
          data.hourly[i]["weather"]["0"]["icon"]
        }.svg" alt="weather icon for hour ${hourlyTime}">
        <span>${data.hourly[i]["weather"][0]["description"]}</span>

        <div class="graph">
            <p>Temperature </p>
            <p style="width:${
              (Math.abs(temp) * 64) / 100 + 33
            }%;">${temp}&#176;C</p>
            <p>Feels like </p>
            <p style="width:${
              (Math.abs(feelsLike) * 64) / 100 + 33
            }%;">${feelsLike}&#176;C</p>
            <p>P.O.P. </p>
            <p style="width:${
              (Math.abs(pop) * 64) / 100 + 33
            }%;">${pop}&#37;</p>
            <p>Snow </p>
            <p style="width:${
              (Math.abs(precip) * 10 * 64) / 100 + 33
            }%;">${precip}%</p>
        </div>

      </div>
      `);
    } else {
      //no precipitation
      let precip = 0;

      hourlyHTML = hourlyHTML.concat(`
      <div class="container">
        <h4>${hourlyTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</h4>
        <img src="./img/weatherIcons/SVG/${
          data.hourly[i]["weather"]["0"]["icon"]
        }.svg" alt="weather icon for hour ${hourlyTime}">
        <span>${data.hourly[i]["weather"][0]["description"]}</span>

        <div class="graph">
            <p>Temperature </p>
            <p style="width:${
              (Math.abs(temp) * 64) / 100 + 33
            }%;">${temp}&#176;C</p>
            <p>Feels like </p>
            <p style="width:${
              (Math.abs(feelsLike) * 64) / 100 + 33
            }%;">${feelsLike}&#176;C</p>
            <p>P.O.P. </p>
            <p style="width:${
              (Math.abs(pop) * 64) / 100 + 33
            }%;">${pop}&#37;</p>
            <p>Precip. </p>
            <p style="width:${
              (Math.abs(precip) * 10 * 64) / 100 + 33
            }%;">${precip}%</p>
        </div>

      </div>
      `);
    }
  }

  // section.daily //

  let dailyHTML = "";
  let daily = document.querySelector("#daily");
  daily.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    console.dir(data.daily[i]);

    //turn timestamps to hours
    let dailyTime = new Date(data.daily[i]["dt"] * 1000);

    //pulling graph data from JSON and rounding numbers
    let tempMax = Math.round(data.daily[i]["temp"]["max"] * 1) / 1;
    let tempMin = Math.round(data.daily[i]["temp"]["min"] * 1) / 1;
    let feelsLike = Math.round(data.daily[i]["feels_like"] * 1) / 1;
    let pop = Math.round(data.daily[i]["pop"] * 100);

    if (data.daily[i]["snow"]) {
      //if snow
      let precip = data.daily[i]["snow"];

      dailyHTML = dailyHTML.concat(`
      <div class="container">
        <h4>${dailyTime.toLocaleDateString([], {
          month: "short",
          day: "2-digit",
          weekday: "short",
        })}</h4>
        <img src="./img/weatherIcons/SVG/${
          data.daily[i]["weather"]["0"]["icon"]
        }.svg" alt="weather icon for hour ${dailyTime.toLocaleDateString([], {
        month: "short",
        day: "2-digit",
        weekday: "short",
      })}}">
        <span>${data.daily[i]["weather"][0]["description"]}</span>

        <div class="graph">
            <p>High </p>
            <p style="width:${
              (Math.abs(tempMax) * 64) / 100 + 33
            }%;">${tempMax}&#176;C</p>
            <p>Low </p>
            <p style="width:${
              (Math.abs(tempMin) * 64) / 100 + 33
            }%;">${tempMin}&#176;C</p>
            <p>P.O.P. </p>
            <p style="width:${
              (Math.abs(pop) * 64) / 100 + 33
            }%;">${pop}&#37;</p>
            <p>Snow </p>
            <p style="width:${
              (Math.abs(precip) * 10 * 64) / 100 + 33
            }%;">${precip}%</p>
        </div>
        
      </div>
      `);
    } else if (data.daily[i]["rain"]) {
      //if rain
      let precip = data.daily[i]["rain"];

      dailyHTML = dailyHTML.concat(`
      <div class="container">
        <h4>${dailyTime.toLocaleDateString([], {
          month: "short",
          day: "2-digit",
          weekday: "short",
        })}</h4>
        <img src="./img/weatherIcons/SVG/${
          data.daily[i]["weather"]["0"]["icon"]
        }.svg" alt="weather icon for hour ${dailyTime.toLocaleDateString([], {
        month: "short",
        day: "2-digit",
        weekday: "short",
      })}}">
        <span>${data.daily[i]["weather"][0]["description"]}</span>

        <div class="graph">
            <p>High </p>
            <p style="width:${
              (Math.abs(tempMax) * 64) / 100 + 33
            }%;">${tempMax}&#176;C</p>
            <p>Low </p>
            <p style="width:${
              (Math.abs(tempMin) * 64) / 100 + 33
            }%;">${tempMin}&#176;C</p>
            <p>P.O.P. </p>
            <p style="width:${
              (Math.abs(pop) * 64) / 100 + 33
            }%;">${pop}&#37;</p>
            <p>Rain </p>
            <p style="width:${
              (Math.abs(precip) * 64) / 100 + 33
            }%;">${Math.floor(precip)}mm</p>
        </div>
        
      </div>
      `);
    } else {
      //no precipitation
      let precip = 0;

      dailyHTML = dailyHTML.concat(`
      <div class="container">
        <h4>${dailyTime.toLocaleDateString([], {
          month: "short",
          day: "2-digit",
          weekday: "short",
        })}</h4>
        <img src="./img/weatherIcons/SVG/${
          data.daily[i]["weather"]["0"]["icon"]
        }.svg" alt="weather icon for hour ${dailyTime.toLocaleDateString([], {
        month: "short",
        day: "2-digit",
        weekday: "short",
      })}}">
        <span>${data.daily[i]["weather"][0]["description"]}</span>

        <div class="graph">
            <p>High </p>
            <p style="width:${
              (Math.abs(tempMax) * 64) / 100 + 33
            }%;">${tempMax}&#176;C</p>
            <p>Low </p>
            <p style="width:${
              (Math.abs(tempMin) * 64) / 100 + 33
            }%;">${tempMin}&#176;C</p>
            <p>P.O.P. </p>
            <p style="width:${
              (Math.abs(pop) * 64) / 100 + 33
            }%;">${pop}&#37;</p>
            <p>Precip. </p>
            <p style="width:${
              (Math.abs(precip) * 10 * 64) / 100 + 33
            }%;">${precip}mm</p>
        </div>
        
      </div>
      `);
    }
  }

  // //  appending data  //  //
  weather.innerHTML = weatherHTML;
  temperature.innerHTML = temperatureHTML;
  stats.innerHTML = statsHTML;
  hourly.innerHTML = hourlyHTML;
  daily.innerHTML = dailyHTML;

  // //  done loading animation, display data  //  //
  document.querySelector("#loaderIcon").classList.remove("active");

  let mainWeather = document.querySelector("#mainWeather");
  mainWeather.classList.add("loaded");
  let hourlySection = document.querySelector("#hourly");
  hourlySection.classList.add("loaded");
  let dailySection = document.querySelector("#daily");
  dailySection.classList.add("loaded");
}

function gpsError(error) {
  var errors = {
    1: "Sorry your browser did not have permissions to get your location.",
    2: "Unable to determine your location.",
    3: "Location request took too long.",
  };
  //   errors[1]
  alert("Error: " + errors[error.code] + "... " + error.message);
}

//OpenWeather | Created by J-C Castagne @ GitHub: https://github.com/JCcastagne
