document.addEventListener("DOMContentLoaded", getLocation);
document.body.addEventListener("click", getLocation);

function getLocation(){
  if( navigator.geolocation ){ 
    //code goes here to find position
    let to = 1000 * 30;  //1000 times 30 = 30 seconds
    let max = 1000 * 30 * 30;  //1000 * 30 * 30 = 1 hour
    var params = {enableHighAccuracy: false, timeout:to, maximumAge:max};
    navigator.geolocation.getCurrentPosition( reportPosition, gpsError, params );
  }else{
    //browser does not support geolocation api
    alert("Sorry, your browser does not support location detection.")
  }
};

function reportPosition(position){

  //var output = document.querySelector("#output");

  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  //let app_id = 'ef35be60';
  let API = 'e78f8841cd9c4c49b05e8cf384ff8db0';
  let units = 'metric';
  //let to = Math.round(Math.random()*(4-2)+2);
  //let ts = Date.now();

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

      // section.weather
      let weatherHTML='';
      let weather = document.querySelector('.weather');
      weather.innerHTML = '';
      weatherHTML = weatherHTML.concat(`
        <h3>Conditions</h3>
        <div class="container">
        <p>Sunrise: ${data.current.sunrise}</p>
        <p>Sunset: ${data.current.sunset}</p>
        <p>Wind speed: ${data.current['wind_speed']}km/h</p>
        <p>Wind direction: ${data.current['wind_deg']}&#176;</p>
        <p>Cloud cover: ${data.current.clouds}&#37;</p>
        </div>
      `);

      // section.temperature
      let temperatureHTML='';
      let temperature = document.querySelector('.temperature');
      temperature.innerHTML='';
      temperatureHTML = temperatureHTML.concat(`
        <h2>Weather</h2>
        <div class="container">
        <div class="tempTop">
          <img src="../img/weatherIcons/SVG/${data.current.weather[0]['icon']}.svg" alt="weather icon">
          <p>${data.current.temp}&#176;C</p>
          <p>feels like ${data.current['feels_like']}&#176;C</p>
        </div>

        <div class="tempBot">
          
          <p>${data.current.weather[0]['description']}</p>
        </div>
        </div>
      `);

      // section.stats
      let statsHTML='';
      let stats = document.querySelector('.stats');
      stats.innerHTML='';
      statsHTML = statsHTML.concat(`
        <h3>Stats</h3>
        <div class="container">
        <p>Pressure: ${data.current.pressure}mb</p>
        <p>Humidity: ${data.current.humidity}&#37;</p>
        <p>Dew Point: ${data.current['dew_point']}&#176;C</p>
        <p>Uvi: ${data.current.uvi}</p>
        <p>Visibility: ${data.current.visibility} Ft.</p>
        </div>
      `)


      //appending data
      weather.innerHTML = weatherHTML;
      temperature.innerHTML = temperatureHTML;
      stats.innerHTML = statsHTML;
  
    })
    .catch((err)=> {
      //err is the Error object
      //This catch method runs if there is an error anywhere in the process.
      console.error(err);
      //document.querySelector('main').innerHTML += '<p>Unable to fetch<p>'
    });


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