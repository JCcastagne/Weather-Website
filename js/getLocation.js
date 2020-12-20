document.addEventListener("DOMContentLoaded", getLocation);
document.body.addEventListener("click", getLocation);

function getLocation(){
  if(navigator.geolocation){ 
    //find position
    let to = 1000 * 30;  //1000 * 30 = 30sec
    let max = 1000 * 30 * 30;  //1000 * 30 * 30 = 1hr
    var params = {enableHighAccuracy: false, timeout:to, maximumAge:max};
    navigator.geolocation.getCurrentPosition( reportPosition, gpsError, params );
  }else{
    //browser does not support geolocation api
    alert("Sorry, your browser does not support location detection.")
  }
};

function reportPosition(position) {

  //check if data exists

  let key = `openWeather-jc`;
	const localValue = localStorage.getItem(key);
	if (!localValue) {
    //if data doesn't exist, fetch
		fetchData(position);
	}
  const item = JSON.parse(localValue);

  //if data is +30mins old, remove old data, fetch
  const now = new Date();
	if (now.getTime() > item['expiry']) {
		localStorage.removeItem(key);
		fetchData(position);
  }
  //if data is present && >30mins old, build data from storage
	buildData(item.value);
}

function fetchData(position) {
  
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let API = 'e78f8841cd9c4c49b05e8cf384ff8db0';
  let units = 'metric';
  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API}&units=${units}`;

  fetch(url)
    .then((resp)=>{
      if(resp.ok){
        console.log('good response');
        //response is the response object
        //we extract the text(), json(), or blob() from it
        return resp.json() //this line calls the next then()
      }else{
        console.log('bad response', response.status);
        throw new Error ('BAD RESPONSE')
      }
    })
    .then((data)=>{
      //store data to local storage
      let value = data;
      let key = `openWeather-jc`;
      const ttl = 1800000 //30mins
      storeKey(key, value, ttl);
      //once fetched, store into local storage
      function storeKey(key, value, ttl) {
        const now = new Date();
        const item = {
          value: value,
          expiry: now.getTime() + ttl,
        }
        localStorage.setItem(key, JSON.stringify(item));
      }
      buildData(data);
    })
    .catch((err)=> {
      //err is the Error object
      //This catch method runs if there is an error anywhere in the process.
      console.error(err);
      //document.querySelector('main').innerHTML += '<p>Unable to fetch<p>'
    });  
}

function buildData(data) {
  // section.weather //
  let weatherHTML='';
  let weather = document.querySelector('.weather');
  weather.innerHTML = '';

  //turn timestamps to hours:
  let sunriseObject = new Date((data.current.sunrise)*1000);
  let sunsetObject = new Date((data.current.sunset)*1000);

  weatherHTML = weatherHTML.concat(`
    <h3>Conditions</h3>

    <div class="container">
      <p>
      <img src="./../img/icons/sunrise.png" alt="sunrise icon">Sunrise ${sunriseObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
      </p>
      <p>
        <img src="./../img/icons/sunset.png" alt="sunrise icon">Sunset ${sunsetObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
      </p>
      <p>
        <img src="./../img/icons/wind.png" alt="wind icon">Wind ${data.current['wind_speed']}km/h
      </p>
      <p>
        <img src="./../img/icons/direction.png" alt="direction icon">Direction ${data.current['wind_deg']}&#176;
      </p>
      <p>
        <img src="./../img/icons/cloud.png" alt="cloud icon">Cloud cover ${data.current.clouds}&#37;
      </p>
    </div>
  `);


  // section.temperature //
  let temperatureHTML='';
  let temperature = document.querySelector('.temperature');
  temperature.innerHTML='';
  
  //round temperatures
  let currentTemp = Math.round((data.current.temp)*10)/10;
  let feelsLike = Math.round((data.current['feels_like'])*10)/10;

  temperatureHTML = temperatureHTML.concat(`
    <h2>Weather</h2>
    <div class="container">

    <div class="tempTop">
      <img src="./../img/weatherIcons/SVG/${data.current.weather[0]['icon']}.svg" alt="weather icon">
      <p>${currentTemp}&#176;C</p>
      <p>feels like ${feelsLike}&#176;C</p>
    </div>

    <div class="tempBot">
    <p>${data.current.weather[0]['description']}</p>
    </div>

    </div>
  `);


  // section.stats //
  let statsHTML='';
  let stats = document.querySelector('.stats');
  stats.innerHTML='';

  //round temperatures
  let dewPoint = Math.round((data.current['dew_point'])*1)/1;

  statsHTML = statsHTML.concat(`
    <h3>Stats</h3>
    <div class="container">

    <p><img src="./../img/icons/pressure.png" alt="pressure icon">
    Pressure ${data.current.pressure}mb</p>
    <p><img src="./../img/icons/humidity.png" alt="humidity icon">
    Humidity ${data.current.humidity}&#37;</p>
    <p><img src="./../img/icons/dewpoint.png" alt="dew point icon">
    Dew ${dewPoint}&#176;C</p>
    <p><img src="./../img/icons/uvi.png" alt="uvi icon">
    Uvi ${data.current.uvi}</p>
    <p><img src="./../img/icons/visibility.png" alt="visibility icon">
    Visibility ${data.current.visibility} Ft.</p>

    </div>
  `)


  // section.hourly
  let hourlyHTML='';
  let hourly = document.querySelector('#hourly');
  hourly.innerHTML='';

  for (let i = 0; i < 12; i++) {

    //turn timestamps to hours
    let hourlyTime = new Date((data.hourly[i]['dt'])*1000);

    hourlyHTML = hourlyHTML.concat(`
      <div class="container">
      <h4>${hourlyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</h4>
      <img src="./../img/weatherIcons/SVG/${data.hourly[i]['weather']['0']['icon']}.svg" alt="weather icon for hour ${hourlyTime}">
      <p>Temperature ${Math.round((data.hourly[i]['temp'])*1)/1}&#176;C</p>
      <p>${data.hourly[i]['weather'][0]['description']}</p>
      <p>Feels like ${Math.round((data.hourly[i]['feels_like'])*1)/1}&#176;C</p>
      <p>P.O.P. ${(data.hourly[i]['pop'])*100}&#37;</p>
      </div>
    `)
  }

  

  // //  appending data  //  //
  weather.innerHTML = weatherHTML;
  temperature.innerHTML = temperatureHTML;
  stats.innerHTML = statsHTML;
  hourly.innerHTML = hourlyHTML;

  // //  done loading animation, display data  //  //
  document.querySelector('#loaderIcon').classList.remove('active');
  let mainWeather = document.querySelector('#mainWeather');
  mainWeather.classList.add('loaded');
  //ADD STAGGER ON ANIMATIONS AFTER DONE CSS
  let hourlySection = document.querySelector('#hourly');
  hourlySection.classList.add('loaded');
}

function gpsError(error){   
  var errors = {
    1: 'Sorry your browser did not have permissions to get your location.',
    2: 'Unable to determine your location.',
    3: 'Location request took too long.'
  };
  //   errors[1]
  alert("Error: " + errors[error.code] + "... " + error.message );
}

//OpenWeather | Created by J-C Castagne @ GitHub: https://github.com/JCcastagne