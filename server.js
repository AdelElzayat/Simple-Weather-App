require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.OPENWEATHER_API_KEY;
const GEOCODING_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

app.use(cors());

const COUNTRY_CAPITALS = {
  "afghanistan": { city: "Kabul", code: "AF" },
  "albania": { city: "Tirana", code: "AL" },
  "algeria": { city: "Algiers", code: "DZ" },
  "andorra": { city: "Andorra la Vella", code: "AD" },
  "angola": { city: "Luanda", code: "AO" },
  "argentina": { city: "Buenos Aires", code: "AR" },
  "armenia": { city: "Yerevan", code: "AM" },
  "australia": { city: "Canberra", code: "AU" },
  "austria": { city: "Vienna", code: "AT" },
  "azerbaijan": { city: "Baku", code: "AZ" },
  "bahrain": { city: "Manama", code: "BH" },
  "bangladesh": { city: "Dhaka", code: "BD" },
  "belarus": { city: "Minsk", code: "BY" },
  "belgium": { city: "Brussels", code: "BE" },
  "bolivia": { city: "Sucre", code: "BO" },
  "brazil": { city: "Brasília", code: "BR" },
  "bulgaria": { city: "Sofia", code: "BG" },
  "cambodia": { city: "Phnom Penh", code: "KH" },
  "cameroon": { city: "Yaoundé", code: "CM" },
  "canada": { city: "Ottawa", code: "CA" },
  "chile": { city: "Santiago", code: "CL" },
  "china": { city: "Beijing", code: "CN" },
  "colombia": { city: "Bogotá", code: "CO" },
  "costa rica": { city: "San José", code: "CR" },
  "croatia": { city: "Zagreb", code: "HR" },
  "cuba": { city: "Havana", code: "CU" },
  "cyprus": { city: "Nicosia", code: "CY" },
  "czech republic": { city: "Prague", code: "CZ" },
  "czechia": { city: "Prague", code: "CZ" },
  "denmark": { city: "Copenhagen", code: "DK" },
  "dominican republic": { city: "Santo Domingo", code: "DO" },
  "ecuador": { city: "Quito", code: "EC" },
  "egypt": { city: "Cairo", code: "EG" },
  "el salvador": { city: "San Salvador", code: "SV" },
  "england": { city: "London", code: "GB" },
  "estonia": { city: "Tallinn", code: "EE" },
  "ethiopia": { city: "Addis Ababa", code: "ET" },
  "finland": { city: "Helsinki", code: "FI" },
  "france": { city: "Paris", code: "FR" },
  "georgia": { city: "Tbilisi", code: "GE" },
  "germany": { city: "Berlin", code: "DE" },
  "ghana": { city: "Accra", code: "GH" },
  "greece": { city: "Athens", code: "GR" },
  "guatemala": { city: "Guatemala City", code: "GT" },
  "haiti": { city: "Port-au-Prince", code: "HT" },
  "honduras": { city: "Tegucigalpa", code: "HN" },
  "hungary": { city: "Budapest", code: "HU" },
  "iceland": { city: "Reykjavik", code: "IS" },
  "india": { city: "New Delhi", code: "IN" },
  "indonesia": { city: "Jakarta", code: "ID" },
  "iran": { city: "Tehran", code: "IR" },
  "iraq": { city: "Baghdad", code: "IQ" },
  "ireland": { city: "Dublin", code: "IE" },
  "israel": { city: "Jerusalem", code: "IL" },
  "italy": { city: "Rome", code: "IT" },
  "jamaica": { city: "Kingston", code: "JM" },
  "japan": { city: "Tokyo", code: "JP" },
  "jordan": { city: "Amman", code: "JO" },
  "kazakhstan": { city: "Astana", code: "KZ" },
  "kenya": { city: "Nairobi", code: "KE" },
  "kuwait": { city: "Kuwait City", code: "KW" },
  "kyrgyzstan": { city: "Bishkek", code: "KG" },
  "laos": { city: "Vientiane", code: "LA" },
  "latvia": { city: "Riga", code: "LV" },
  "lebanon": { city: "Beirut", code: "LB" },
  "libya": { city: "Tripoli", code: "LY" },
  "lithuania": { city: "Vilnius", code: "LT" },
  "luxembourg": { city: "Luxembourg", code: "LU" },
  "madagascar": { city: "Antananarivo", code: "MG" },
  "malaysia": { city: "Kuala Lumpur", code: "MY" },
  "maldives": { city: "Malé", code: "MV" },
  "malta": { city: "Valletta", code: "MT" },
  "mexico": { city: "Mexico City", code: "MX" },
  "monaco": { city: "Monaco", code: "MC" },
  "mongolia": { city: "Ulaanbaatar", code: "MN" },
  "montenegro": { city: "Podgorica", code: "ME" },
  "morocco": { city: "Rabat", code: "MA" },
  "myanmar": { city: "Naypyidaw", code: "MM" },
  "nepal": { city: "Kathmandu", code: "NP" },
  "netherlands": { city: "Amsterdam", code: "NL" },
  "new zealand": { city: "Wellington", code: "NZ" },
  "nicaragua": { city: "Managua", code: "NI" },
  "nigeria": { city: "Abuja", code: "NG" },
  "north korea": { city: "Pyongyang", code: "KP" },
  "norway": { city: "Oslo", code: "NO" },
  "oman": { city: "Muscat", code: "OM" },
  "pakistan": { city: "Islamabad", code: "PK" },
  "palestine": { city: "Ramallah", code: "PS" },
  "panama": { city: "Panama City", code: "PA" },
  "paraguay": { city: "Asunción", code: "PY" },
  "peru": { city: "Lima", code: "PE" },
  "philippines": { city: "Manila", code: "PH" },
  "poland": { city: "Warsaw", code: "PL" },
  "portugal": { city: "Lisbon", code: "PT" },
  "qatar": { city: "Doha", code: "QA" },
  "romania": { city: "Bucharest", code: "RO" },
  "russia": { city: "Moscow", code: "RU" },
  "saudi arabia": { city: "Riyadh", code: "SA" },
  "scotland": { city: "Edinburgh", code: "GB" },
  "senegal": { city: "Dakar", code: "SN" },
  "serbia": { city: "Belgrade", code: "RS" },
  "singapore": { city: "Singapore", code: "SG" },
  "slovakia": { city: "Bratislava", code: "SK" },
  "slovenia": { city: "Ljubljana", code: "SI" },
  "somalia": { city: "Mogadishu", code: "SO" },
  "south africa": { city: "Pretoria", code: "ZA" },
  "south korea": { city: "Seoul", code: "KR" },
  "spain": { city: "Madrid", code: "ES" },
  "sri lanka": { city: "Sri Jayawardenepura Kotte", code: "LK" },
  "sudan": { city: "Khartoum", code: "SD" },
  "sweden": { city: "Stockholm", code: "SE" },
  "switzerland": { city: "Bern", code: "CH" },
  "syria": { city: "Damascus", code: "SY" },
  "taiwan": { city: "Taipei", code: "TW" },
  "tajikistan": { city: "Dushanbe", code: "TJ" },
  "tanzania": { city: "Dodoma", code: "TZ" },
  "thailand": { city: "Bangkok", code: "TH" },
  "tunisia": { city: "Tunis", code: "TN" },
  "turkey": { city: "Ankara", code: "TR" },
  "turkmenistan": { city: "Ashgabat", code: "TM" },
  "uganda": { city: "Kampala", code: "UG" },
  "ukraine": { city: "Kyiv", code: "UA" },
  "united arab emirates": { city: "Abu Dhabi", code: "AE" },
  "united kingdom": { city: "London", code: "GB" },
  "united states": { city: "Washington D.C.", code: "US" },
  "usa": { city: "Washington D.C.", code: "US" },
  "uruguay": { city: "Montevideo", code: "UY" },
  "uzbekistan": { city: "Tashkent", code: "UZ" },
  "vatican city": { city: "Vatican City", code: "VA" },
  "venezuela": { city: "Caracas", code: "VE" },
  "vietnam": { city: "Hanoi", code: "VN" },
  "yemen": { city: "Sana'a", code: "YE" },
  "zambia": { city: "Lusaka", code: "ZM" },
  "zimbabwe": { city: "Harare", code: "ZW" },
};

async function getGeolocation(country) {
  const countryKey = country.toLowerCase();
  const capitalInfo = COUNTRY_CAPITALS[countryKey];

  if (capitalInfo) {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        q: `${capitalInfo.city},${capitalInfo.code}`,
        limit: 1,
        appid: API_KEY,
      },
    });

    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat, lon, city: capitalInfo.city, code: capitalInfo.code };
    }
  }

  const response = await axios.get(GEOCODING_URL, {
    params: {
      q: country,
      limit: 5,
      appid: API_KEY,
    },
  });

  if (response.data.length === 0) {
    throw new Error(`Country "${country}" not found. Please check the spelling and try again.`);
  }

  const { lat, lon, name: city, country: code } = response.data[0];
  return { lat, lon, city, code };
}

async function getWeather(lat, lon) {
  const response = await axios.get(WEATHER_URL, {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: API_KEY,
    },
  });

  const data = response.data;
  return {
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    description: data.weather[0].description,
    main: data.weather[0].main,
    icon: data.weather[0].icon,
    wind_speed: data.wind.speed,
    wind_deg: data.wind.deg,
    clouds: data.clouds.all,
    visibility: data.visibility,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone,
  };
}

app.get('/api/weather/:country', async (req, res) => {
  try {
    const country = req.params.country;

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      return res.status(500).json({ error: 'No valid API key found. Please configure OPENWEATHER_API_KEY in .env file.' });
    }

    const geo = await getGeolocation(country);
    const weather = await getWeather(geo.lat, geo.lon);

    res.json({
      success: true,
      country: country,
      capital: geo.city,
      country_code: geo.code,
      latitude: geo.lat,
      longitude: geo.lon,
      weather: weather,
    });
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        res.status(401).json({ error: 'Invalid API token (401 Unauthorized). Please check your OPENWEATHER_API_KEY.' });
      } else if (error.response.status === 404) {
        res.status(404).json({ error: `Country "${req.params.country}" not found.` });
      } else {
        res.status(error.response.status).json({ error: `API returned status ${error.response.status}.` });
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      res.status(503).json({ error: 'Network error. Could not reach the API server. Please check your internet connection.' });
    } else if (error.message.startsWith('Country')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/countries', (req, res) => {
  const countryList = Object.keys(COUNTRY_CAPITALS).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    capital: COUNTRY_CAPITALS[key].city,
    code: COUNTRY_CAPITALS[key].code,
  }));
  res.json({ countries: countryList });
});

// Serve static files (API routes take priority)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Weather App server running at http://localhost:${PORT}`);
});