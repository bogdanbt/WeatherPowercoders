window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation);
  } else {
    console.log("Geolocation is not supported.");
  }
};

async function successLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  try {
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const weather = weatherData.current_weather;

    document.getElementById("weather-result").innerHTML = `
        <strong>Location:</strong> Your current location<br/>
        <strong>Temperature:</strong> ${weather.temperature}°C<br/>
        <strong>Wind Speed:</strong> ${weather.windspeed} km/h
      `;
  } catch (error) {
    document.getElementById("weather-result").innerText =
      "Could not fetch weather for your location.";
  }
}

function errorLocation() {
  console.log("User denied geolocation or an error occurred.");
  document.getElementById("weather-result").innerText =
    "Please enter a city above to get weather data.";
}

async function getWeather() {
  const city = document.getElementById("city-input").value.trim();
  if (!city) {
    alert("Please enter a city.");
    return;
  }

  try {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}`;
    const geoRes = await fetch(geocodeUrl);
    const geoData = await geoRes.json();
    const location = geoData.results?.[0];

    if (!location) {
      document.getElementById("weather-result").innerText = "City not found.";
      return;
    }

    const { latitude, longitude, name, country } = location;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const weather = weatherData.current_weather;

    document.getElementById("weather-result").innerHTML = `
      <strong>📍 Weather in ${name}, ${country}</strong><br/>
      <strong>Temperature:</strong> ${weather.temperature}°C<br/>
      <strong>Wind Speed:</strong> ${weather.windspeed} km/h
    `;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("weather-result").innerText =
      "Error fetching weather data.";
  }
}
