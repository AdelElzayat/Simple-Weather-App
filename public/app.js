const countryInput = document.getElementById('countryInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const suggestionsBox = document.getElementById('suggestionsBox');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const resultsContainer = document.getElementById('resultsContainer');

let countriesList = [];
let selectedCountry = '';

async function loadCountries() {
  try {
    const res = await fetch('/api/countries');
    const data = await res.json();
    countriesList = data.countries;
  } catch (err) {
    console.error('Failed to load countries list:', err);
  }
}

loadCountries();

countryInput.addEventListener('input', function () {
  const query = this.value.trim().toLowerCase();
  suggestionsBox.classList.remove('show');
  selectedCountry = '';

  if (query.length < 1) {
    return;
  }

  const matches = countriesList.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.capital.toLowerCase().includes(query)
  ).slice(0, 8);

  if (matches.length === 0) {
    return;
  }

  suggestionsBox.innerHTML = '';
  matches.forEach(country => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `
      <span class="country-name">${country.name}</span>
      <span class="country-meta">${country.capital} (${country.code})</span>
    `;
    div.addEventListener('click', function () {
      countryInput.value = country.name;
      selectedCountry = country.name;
      suggestionsBox.classList.remove('show');
      fetchWeather();
    });
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.classList.add('show');
});

countryInput.addEventListener('blur', function () {
  setTimeout(() => suggestionsBox.classList.remove('show'), 200);
});

countryInput.addEventListener('focus', function () {
  if (this.value.trim().length >= 1) {
    this.dispatchEvent(new Event('input'));
  }
});

countryInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    suggestionsBox.classList.remove('show');
    fetchWeather();
  }
});

getWeatherBtn.addEventListener('click', fetchWeather);

async function fetchWeather() {
  const country = countryInput.value.trim();

  if (!country) {
    showError('Please enter a country name.');
    return;
  }

  hideError();
  hideResults();
  showLoading();

  try {
    const res = await fetch(`/api/weather/${encodeURIComponent(country)}`);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch weather data.');
    }

    displayResults(data);
    hideLoading();
  } catch (err) {
    hideLoading();
    showError(err.message);
  }
}

function displayResults(data) {
  if (!data || !data.weather) {
    showError('Invalid data received from server.');
    hideLoading();
    return;
  }

  const w = data.weather;
  const countryName = data.country ? data.country.charAt(0).toUpperCase() + data.country.slice(1) : 'N/A';

  document.getElementById('countryName').textContent = countryName;
  document.getElementById('capitalName').textContent = data.capital || 'N/A';
  document.getElementById('countryCode').textContent = data.country_code || 'N/A';

  document.getElementById('latitude').textContent = data.latitude !== undefined ? `${data.latitude.toFixed(4)}°` : 'N/A';
  document.getElementById('longitude').textContent = data.longitude !== undefined ? `${data.longitude.toFixed(4)}°` : 'N/A';

  if (w.icon) {
    document.getElementById('tempIcon').innerHTML = `<img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="${w.description}" width="64" height="64">`;
  } else {
    document.getElementById('tempIcon').innerHTML = '<i class="fas fa-cloud-sun" style="font-size:2.5rem;color:#f39c12;"></i>';
  }
  document.getElementById('temperature').textContent = w.temperature !== undefined ? `${Math.round(w.temperature)}°C` : 'N/A';
  document.getElementById('feelsLike').textContent = w.feels_like !== undefined ? `${Math.round(w.feels_like)}°C` : 'N/A';
  document.getElementById('tempMinMax').textContent = (w.temp_min !== undefined && w.temp_max !== undefined) ? `${Math.round(w.temp_min)}°C / ${Math.round(w.temp_max)}°C` : 'N/A';
  document.getElementById('weatherDesc').textContent = w.description ? w.description.charAt(0).toUpperCase() + w.description.slice(1) : 'N/A';

  document.getElementById('humidity').textContent = w.humidity !== undefined ? `${w.humidity}%` : 'N/A';
  document.getElementById('pressure').textContent = w.pressure !== undefined ? `${w.pressure} hPa` : 'N/A';
  document.getElementById('windSpeed').textContent = w.wind_speed !== undefined ? `${w.wind_speed} m/s` : 'N/A';
  document.getElementById('cloudiness').textContent = w.clouds !== undefined ? `${w.clouds}%` : 'N/A';
  document.getElementById('visibility').textContent = w.visibility !== undefined ? `${(w.visibility / 1000).toFixed(1)} km` : 'N/A';

  document.getElementById('sunrise').textContent = w.sunrise ? formatTime(w.sunrise, w.timezone) : 'N/A';
  document.getElementById('sunset').textContent = w.sunset ? formatTime(w.sunset, w.timezone) : 'N/A';
  document.getElementById('windDirection').textContent = w.wind_deg !== undefined ? `${w.wind_deg}° ${getWindDirection(w.wind_deg)}` : 'N/A';

  resultsContainer.classList.remove('hidden');
}

function formatTime(unixTimestamp, timezoneOffset) {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function showLoading() {
  loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

function showError(msg) {
  errorText.textContent = msg || 'An unknown error occurred.';
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function hideResults() {
  resultsContainer.classList.add('hidden');
}