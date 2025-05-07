async function getWeather() {
  const city = document.getElementById("city-input").value;
  if (!city) return alert("Please enter a city");

  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

  try {
    const geoRes = await fetch(geocodeUrl);
    const geoData = await geoRes.json();
    const location = geoData.results?.[0];
    if (!location) {
      document.getElementById("weather-result").innerText = "City not found!";
      return;
    }

    const { latitude, longitude } = location;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const weather = weatherData.current_weather;
    document.getElementById("weather-result").innerHTML = `
        <strong>Temperature:</strong> ${weather.temperature}°C<br/>
        <strong>Wind Speed:</strong> ${weather.windspeed} km/h
      `;
  } catch (error) {
    console.error(error);
    document.getElementById("weather-result").innerText =
      "Error fetching weather data.";
  }
}
