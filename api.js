const WMO_MAP = {
  0: { desc: 'Céu limpo', icon: 'wi-day-sunny' },
  1: { desc: 'Predom. limpo', icon: 'wi-day-cloudy' },
  2: { desc: 'Parcialmente nublado', icon: 'wi-day-cloudy' },
  3: { desc: 'Nublado', icon: 'wi-cloudy' },
  45: { desc: 'Neblina', icon: 'wi-fog' },
  61: { desc: 'Chuva leve', icon: 'wi-rain' },
  63: { desc: 'Chuva moderada', icon: 'wi-rain' },
  80: { desc: 'Pancadas de chuva', icon: 'wi-showers' },
  95: { desc: 'Tempestade', icon: 'wi-thunderstorm' }
};

const NIGHT_ICON_MAP = { 'wi-day-sunny': 'wi-night-clear', 'wi-day-cloudy': 'wi-night-alt-cloudy' };

function getThemeByCode(code, isDay) {
  if (!isDay) return 'theme-night';
  if (code === 0) return 'theme-day';
  if (code >= 1 && code <= 3) return 'theme-cloudy';
  if (code >= 51 && code <= 82) return 'theme-rain';
  if (code >= 95) return 'theme-storm';
  return 'theme-day';
}

// Nova função para formatar a hora baseada no Timezone da cidade buscada
function formatLocalTime(timezone) {
  const options = { 
    weekday: 'long', day: 'numeric', month: 'long', 
    hour: '2-digit', minute: '2-digit', 
    timeZone: timezone 
  };
  const formatter = new Intl.DateTimeFormat('pt-BR', options);
  return formatter.format(new Date());
}

async function handleSearch() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  try {
    // 1. Busca coordenadas e Fuso Horário (timezone)
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results) return alert('Cidade não encontrada');
    
    const { latitude, longitude, name, country, timezone } = geoData.results[0];

    // 2. Busca Clima usando o timezone da cidade
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${encodeURIComponent(timezone)}`);
    const weatherData = await weatherRes.json();
    const { temperature, weathercode, is_day } = weatherData.current_weather;

    // 3. Aplica o Tema e Horário Local
    document.body.className = getThemeByCode(weathercode, is_day === 1);
    document.getElementById('dateTime').textContent = formatLocalTime(timezone);

    // 4. Ícone e Textos
    const wmo = WMO_MAP[weathercode] || { desc: 'Desconhecido', icon: 'wi-na' };
    let iconClass = wmo.icon;
    if (is_day === 0 && NIGHT_ICON_MAP[iconClass]) iconClass = NIGHT_ICON_MAP[iconClass];

    document.getElementById('tempValue').textContent = Math.round(temperature);
    document.getElementById('cityName').textContent = `${name}, ${country}`;
    document.getElementById('weatherDesc').textContent = wmo.desc;
    document.getElementById('weatherIcon').className = `wi weather-icon ${iconClass}`;

    document.getElementById('searchCard').classList.add('hidden');
    document.getElementById('resultCard').classList.remove('hidden');
  } catch (e) { alert('Erro na busca'); }
}

function goHome() {
  document.getElementById('resultCard').classList.add('hidden');
  document.getElementById('searchCard').classList.remove('hidden');
  document.body.className = 'theme-day';
  document.getElementById('cityInput').value = '';
}

document.getElementById('cityInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });

//teste
if (typeof module !== 'undefined') {
  module.exports = { geocodeCity, fetchWeather, formatLocalTime };
}