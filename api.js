// ── Elementos ──────────────────────────────────────────
const cityInput  = document.getElementById('cityInput');
const errorBox   = document.getElementById('errorBox');
const searchCard = document.getElementById('searchCard');
const resultCard = document.getElementById('resultCard');
const tempValue  = document.getElementById('tempValue');
const cityName   = document.getElementById('cityName');
const searchBtn  = document.getElementById('searchBtn');

// ── Geocodificação: cidade → coordenadas ────────────────
async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
  const res  = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Cidade não encontrada');
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

// ── Temperatura atual via Open-Meteo ────────────────────
async function fetchTemperature(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`;
  const res  = await fetch(url);
  const data = await res.json();

  if (!data.current_weather) {
    throw new Error('Dados climáticos indisponíveis');
  }

  return Math.round(data.current_weather.temperature);
}

// ── Handler principal ───────────────────────────────────
async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    showError('Por favor, digite o nome de uma cidade.');
    return;
  }

  hideError();
  searchBtn.textContent = 'Buscando…';
  searchBtn.disabled = true;

  try {
    const { latitude, longitude, name, country } = await geocodeCity(city);
    const temp = await fetchTemperature(latitude, longitude);

    tempValue.textContent = temp;
    cityName.textContent  = `${name}, ${country}`;

    searchCard.classList.add('hidden');
    resultCard.classList.remove('hidden');

  } catch (err) {
    showError('Cidade não encontrada. Tente novamente.');
  } finally {
    searchBtn.textContent = 'Buscar';
    searchBtn.disabled = false;
  }
}

// ── Voltar para a tela de busca ─────────────────────────
function goHome() {
  resultCard.classList.add('hidden');
  searchCard.classList.remove('hidden');
  cityInput.value = '';
  hideError();
  cityInput.focus();
}

// ── Helpers ─────────────────────────────────────────────
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

// ── Enter para buscar ────────────────────────────────────
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});
