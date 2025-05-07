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
  getWeatherByCoords(latitude, longitude, "your location");
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

    getWeatherByCoords(
      location.latitude,
      location.longitude,
      `${location.name}, ${location.country}`
    );
  } catch (error) {
    console.error("Error fetching location:", error);
    document.getElementById("weather-result").innerText =
      "Error fetching location.";
  }
}

async function getWeatherByCoords(lat, lon, locationName) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const weather = weatherData.current_weather;
    const humidityNow = weatherData.hourly?.relative_humidity_2m?.[0];

    document.getElementById("weather-result").innerHTML = `
      <strong>📍 Weather in ${locationName}</strong><br/>
      <strong>Temperature:</strong> ${weather.temperature}°C<br/>
      <strong>Wind Speed:</strong> ${weather.windspeed} km/h<br/>
      <strong>Humidity:</strong> ${humidityNow}% 💧
    `;

    const weatherCondition = getWeatherCondition(
      weather.temperature,
      weather.windspeed,
      humidityNow
    );

    const videoUrl = await getBackgroundVideoUrl(weatherCondition);
    if (videoUrl) {
      const bgVideo = document.getElementById("bg-video");
      bgVideo.src = videoUrl;
    }

    getHourlyForecast(lat, lon);
  } catch (error) {
    console.error("Weather fetch error:", error);
    document.getElementById("weather-result").innerText =
      "Could not fetch weather.";
  }
}

function getWeatherCondition(temp, wind, humidity) {
  if (humidity > 80) return "rain";
  if (wind > 25) return "wind";
  if (temp > 30) return "heat";
  if (temp < 10) return "snow";
  return "sunny";
}

async function getBackgroundVideoUrl(searchQuery) {
  const PEXELS_API_KEY =
    "j9j04cv861PfKGJDiRCoUsyfk6GPA6xiYeRhHsYh7WWoOHqfn0EsSGWc";

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${searchQuery}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch from Pexels");

    const data = await response.json();
    const video = data.videos?.[0];

    if (video && video.video_files?.length) {
      const file =
        video.video_files.find(
          (v) => v.quality === "sd" && v.file_type === "video/mp4"
        ) || video.video_files[0];
      return file.link;
    }
  } catch (error) {
    console.error("Video fetch error:", error);
  }

  return null;
}

async function getHourlyForecast(lat, lon) {
  try {
    const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&timezone=auto`;
    const res = await fetch(hourlyUrl);
    const data = await res.json();

    const hours = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const humidity = data.hourly.relative_humidity_2m;
    const rain = data.hourly.precipitation_probability;

    const container = document.getElementById("hourly-forecast");
    container.innerHTML = "";

    for (let i = 0; i < 12; i++) {
      const time = new Date(hours[i]).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const rainIcon = rain[i] >= 30 ? "🌧️" : "☀️";

      const card = document.createElement("div");
      card.className = "hour-card";
      card.innerHTML = `
        <strong>${time}</strong><br/>
        ${temps[i]}°C<br/>
        💧${humidity[i]}%<br/>
        ${rainIcon}
      `;
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Hourly forecast error:", error);
  }
}
