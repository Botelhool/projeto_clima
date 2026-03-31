/**
 * @fileoverview Módulo principal de consumo de APIs climáticas.
 *
 * Responsável por:
 * - Geocodificar nomes de cidades em coordenadas geográficas
 * - Consultar condições climáticas em tempo real + previsão de 5 dias via Open-Meteo
 * - Renderizar os resultados na interface
 * - Gerenciar temas visuais (dia, noite, chuva, tempestade etc.)
 *
 * @author      Leonardo
 * @version     3.0.0
 * @since       2025
 * @see         {@link https://open-meteo.com/} Open-Meteo API
 * @see         {@link https://erikflowers.github.io/weather-icons/} Weather Icons
 */

// ══════════════════════════════════════════════════════════════════════════════
//  CONSTANTES E MAPEAMENTOS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @typedef  {Object} WmoEntry
 * @property {string} desc - Descrição em português do estado do clima.
 * @property {string} icon - Classe CSS da biblioteca Weather Icons correspondente.
 */

/**
 * Mapeamento dos códigos WMO (World Meteorological Organization) para
 * descrição textual em português e ícone visual.
 *
 * @constant
 * @type {Object.<number, WmoEntry>}
 */
const WMO_MAP = {
  0:  { desc: 'Céu limpo',                     icon: 'wi-day-sunny'       },
  1:  { desc: 'Predom. limpo',                 icon: 'wi-day-cloudy'      },
  2:  { desc: 'Parcialmente nublado',          icon: 'wi-day-cloudy'      },
  3:  { desc: 'Nublado',                       icon: 'wi-cloudy'          },
  45: { desc: 'Neblina',                       icon: 'wi-fog'             },
  48: { desc: 'Neblina com geada',             icon: 'wi-fog'             },
  51: { desc: 'Chuvisco leve',                icon: 'wi-sprinkle'        },
  53: { desc: 'Chuvisco moderado',            icon: 'wi-sprinkle'        },
  55: { desc: 'Chuvisco intenso',             icon: 'wi-sprinkle'        },
  61: { desc: 'Chuva leve',                   icon: 'wi-rain'            },
  63: { desc: 'Chuva moderada',               icon: 'wi-rain'            },
  65: { desc: 'Chuva intensa',                icon: 'wi-rain'            },
  71: { desc: 'Neve leve',                    icon: 'wi-snow'            },
  73: { desc: 'Neve moderada',                icon: 'wi-snow'            },
  75: { desc: 'Neve intensa',                 icon: 'wi-snow'            },
  77: { desc: 'Grãos de neve',                icon: 'wi-snow-wind'       },
  80: { desc: 'Pancadas de chuva',            icon: 'wi-showers'         },
  81: { desc: 'Pancadas moderadas',           icon: 'wi-showers'         },
  82: { desc: 'Pancadas violentas',           icon: 'wi-storm-showers'   },
  85: { desc: 'Pancadas de neve leve',        icon: 'wi-snow'            },
  86: { desc: 'Pancadas de neve intensa',     icon: 'wi-snow'            },
  95: { desc: 'Tempestade',                   icon: 'wi-thunderstorm'    },
  96: { desc: 'Tempestade com granizo',       icon: 'wi-hail'            },
  99: { desc: 'Tempestade com granizo forte', icon: 'wi-hail'            },
};

/**
 * Mapeamento de ícones diurnos para seus equivalentes noturnos.
 *
 * @constant
 * @type {Object.<string, string>}
 */
const NIGHT_ICON_MAP = {
  'wi-day-sunny':  'wi-night-clear',
  'wi-day-cloudy': 'wi-night-alt-cloudy',
};

/**
 * Mapeamento de temas CSS por faixa de código WMO.
 *
 * @constant
 * @type {Array.<{min: number, max: number, theme: string}>}
 */
const THEME_RULES = [
  { min: 0,  max: 0,  theme: 'theme-day'    },
  { min: 1,  max: 3,  theme: 'theme-cloudy' },
  { min: 45, max: 48, theme: 'theme-cloudy' },
  { min: 51, max: 82, theme: 'theme-rain'   },
  { min: 85, max: 86, theme: 'theme-snow'   },
  { min: 71, max: 77, theme: 'theme-snow'   },
  { min: 95, max: 99, theme: 'theme-storm'  },
];

// ══════════════════════════════════════════════════════════════════════════════
//  FUNÇÕES UTILITÁRIAS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Determina a classe de tema CSS com base no código WMO e no período do dia.
 *
 * @param   {number}  code  - Código WMO retornado pela API.
 * @param   {boolean} isDay - `true` se for período diurno.
 * @returns {string}          Classe CSS do tema.
 */
function getThemeByCode(code, isDay) {
  const rule  = THEME_RULES.find(r => code >= r.min && code <= r.max);
  const theme = rule ? rule.theme : 'theme-day';
  if (!isDay) return theme === 'theme-snow' ? 'theme-snow' : 'theme-night';
  return theme;
}

/**
 * Formata a data e hora atual no fuso horário da cidade consultada.
 *
 * @param   {string} timezone - Identificador IANA do fuso.
 * @returns {string}            String formatada em pt-BR.
 */
function formatLocalTime(timezone) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    weekday:  'long',
    day:      'numeric',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: timezone,
  });

  const raw = formatter.format(new Date());
  return raw.replace(/^(.)/, c => c.toUpperCase())
            .replace(/\s(\d{2}:\d{2})$/, ' · $1');
}

/**
 * Formata uma data ISO (YYYY-MM-DD) no fuso da cidade em nome de dia e data curta.
 *
 * @param   {string} isoDate  - Data no formato 'YYYY-MM-DD'.
 * @param   {string} timezone - Identificador IANA do fuso.
 * @param   {number} index    - Índice do dia (0 = hoje).
 * @returns {{ weekday: string, shortDate: string }}
 */
function formatDayLabel(isoDate, timezone, index) {
  const date = new Date(`${isoDate}T12:00:00`);

  const weekday = index === 0
    ? 'Hoje'
    : index === 1
      ? 'Amanhã'
      : new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: timezone })
          .format(date)
          .replace(/^(.)/, c => c.toUpperCase());

  const shortDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', timeZone: timezone,
  }).format(date);

  return { weekday, shortDate };
}

/**
 * Exibe uma mensagem de erro na caixa de erro do formulário.
 *
 * @param   {string} msg - Texto da mensagem.
 * @returns {void}
 */
function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = msg;
  box.classList.remove('hidden');
}

/**
 * Oculta a caixa de erro do formulário.
 *
 * @returns {void}
 */
function hideError() {
  document.getElementById('errorBox').classList.add('hidden');
}

// ══════════════════════════════════════════════════════════════════════════════
//  FUNÇÕES DE ACESSO À API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Geocodifica o nome de uma cidade em coordenadas geográficas.
 *
 * @async
 * @param   {string} city - Nome da cidade.
 * @returns {Promise<{latitude, longitude, name, country, timezone}>}
 * @throws  {Error} 'NOT_FOUND' | 'API_ERROR' | 'NETWORK'
 */
async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search`
    + `?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('NETWORK');
  }

  if (!res.ok) throw new Error('API_ERROR');

  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('NOT_FOUND');

  const { latitude, longitude, name, country, timezone } = data.results[0];
  return { latitude, longitude, name, country, timezone };
}

/**
 * @typedef  {Object} DailyForecast
 * @property {string}  date     - Data ISO (YYYY-MM-DD).
 * @property {string}  weekday  - Nome do dia da semana (ex: 'Segunda-feira').
 * @property {string}  shortDate - Data curta (ex: '31/03').
 * @property {number}  max      - Temperatura máxima (°C).
 * @property {number}  min      - Temperatura mínima (°C).
 * @property {number}  code     - Código WMO do dia.
 * @property {string}  icon     - Classe CSS do ícone weather-icons.
 * @property {string}  desc     - Descrição textual do clima.
 */

/**
 * @typedef  {Object} WeatherResult
 * @property {number}           temp    - Temperatura atual arredondada (°C).
 * @property {number}           code    - Código WMO da condição atual.
 * @property {boolean}          isDay   - `true` se for período diurno.
 * @property {DailyForecast[]}  daily   - Previsão dos próximos 5 dias.
 */

/**
 * Consulta as condições climáticas atuais e a previsão de 5 dias.
 *
 * @async
 * @param   {number}               latitude  - Latitude.
 * @param   {number}               longitude - Longitude.
 * @param   {string}               timezone  - Fuso horário IANA.
 * @returns {Promise<WeatherResult>}
 * @throws  {Error} 'API_ERROR' | 'NETWORK'
 */
async function fetchWeather(latitude, longitude, timezone) {
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${latitude}&longitude=${longitude}`
    + `&current_weather=true`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min`
    + `&forecast_days=5`
    + `&timezone=${encodeURIComponent(timezone)}`;

  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('NETWORK');
  }

  if (!res.ok) throw new Error('API_ERROR');

  const data = await res.json();
  if (!data.current_weather || !data.daily) throw new Error('API_ERROR');

  const { temperature, weathercode, is_day } = data.current_weather;

  // Processa os 5 dias
  const daily = data.daily.time.map((isoDate, i) => {
    const code            = data.daily.weather_code[i];
    const wmo             = WMO_MAP[code] ?? { desc: 'Desconhecido', icon: 'wi-na' };
    const { weekday, shortDate } = formatDayLabel(isoDate, timezone, i);

    return {
      date:      isoDate,
      weekday,
      shortDate,
      max:       Math.round(data.daily.temperature_2m_max[i]),
      min:       Math.round(data.daily.temperature_2m_min[i]),
      code,
      icon:      wmo.icon,
      desc:      wmo.desc,
    };
  });

  return {
    temp:  Math.round(temperature),
    code:  weathercode,
    isDay: is_day === 1,
    daily,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTROLADORES DE INTERFACE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Retorna mensagem de erro amigável em português.
 *
 * @param   {string} code - Código interno do erro.
 * @returns {string}
 */
function friendlyError(code) {
  const messages = {
    NOT_FOUND: 'Cidade não encontrada. Verifique o nome e tente novamente.',
    NETWORK:   'Sem conexão com a internet. Verifique sua rede.',
    API_ERROR: 'Serviço temporariamente indisponível. Tente mais tarde.',
  };
  return messages[code] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Manipulador do evento de busca. Orquestra geocodificação → dados climáticos
 * → renderização dos dados atuais + previsão de 5 dias.
 *
 * @async
 * @returns {Promise<void>}
 */
async function handleSearch() {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const city      = cityInput.value.trim();

  if (!city) {
    showError('Por favor, digite o nome de uma cidade.');
    return;
  }

  hideError();
  searchBtn.textContent = 'Buscando…';
  searchBtn.disabled    = true;

  try {
    // 1. Geocodificação
    const { latitude, longitude, name, country, timezone } = await geocodeCity(city);

    // 2. Dados climáticos (atual + 5 dias)
    const { temp, code, isDay, daily } = await fetchWeather(latitude, longitude, timezone);

    // 3. Tema visual baseado nas condições atuais
    document.body.className = getThemeByCode(code, isDay);

    // 4. Ícone atual (com troca dia/noite)
    const wmo       = WMO_MAP[code] ?? { desc: 'Desconhecido', icon: 'wi-na' };
    let   iconClass = wmo.icon;
    if (!isDay && NIGHT_ICON_MAP[iconClass]) iconClass = NIGHT_ICON_MAP[iconClass];

    // 5. Preenche seção atual
    const todayMax = daily[0]?.max ?? temp;
    const todayMin = daily[0]?.min ?? temp;

    document.getElementById('weatherIcon').className   = `wi weather-icon ${iconClass}`;
    document.getElementById('tempMax').textContent     = `${todayMax}°`;
    document.getElementById('tempMin').textContent     = `${todayMin}°`;
    document.getElementById('cityName').textContent    = name;
    document.getElementById('countryName').textContent = country;
    document.getElementById('weatherDesc').textContent = wmo.desc;
    document.getElementById('dateTime').textContent    = formatLocalTime(timezone);

    // 6. Preenche lista dos 5 dias
    const list = document.getElementById('forecastList');
    list.innerHTML = '';

    daily.forEach(day => {
      const dayWmo = WMO_MAP[day.code] ?? { desc: 'Desconhecido', icon: 'wi-na' };

      const row = document.createElement('div');
      row.className = 'forecast-row';
      row.innerHTML = `
        <div class="forecast-day">
          <span class="f-weekday">${day.weekday}</span>
          <span class="f-date">${day.shortDate}</span>
        </div>
        <div class="forecast-cond">
          <i class="wi ${dayWmo.icon} f-icon"></i>
          <span class="f-desc">${dayWmo.desc}</span>
        </div>
        <div class="forecast-temps">
          <span class="f-max">↑ ${day.max}°</span>
          <span class="f-min">↓ ${day.min}°</span>
        </div>
      `;
      list.appendChild(row);
    });

    // 7. Troca de tela
    document.getElementById('searchCard').classList.add('hidden');
    document.getElementById('resultCard').classList.remove('hidden');

  } catch (err) {
    showError(friendlyError(err.message));
  } finally {
    searchBtn.textContent = 'Buscar';
    searchBtn.disabled    = false;
  }
}

/**
 * Restaura a interface para o estado inicial de busca.
 *
 * @returns {void}
 */
function goHome() {
  document.getElementById('resultCard').classList.add('hidden');
  document.getElementById('searchCard').classList.remove('hidden');
  document.getElementById('cityInput').value = '';
  document.body.className = 'theme-day';
  hideError();
  document.getElementById('cityInput').focus();
}


// ... (resto do código acima)

// ══════════════════════════════════════════════════════════════════════════════
//  EVENT LISTENERS (Protegidos para não quebrar o Jest)
// ══════════════════════════════════════════════════════════════════════════════

if (typeof document !== 'undefined') {
  const cityInput = document.getElementById('cityInput');
  if (cityInput) {
    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXPORTAÇÃO (compatibilidade Node.js / testes)
// ══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    geocodeCity,
    fetchWeather,
    formatLocalTime,
    formatDayLabel,
    getThemeByCode,
    friendlyError,
   
    WMO_MAP,
    NIGHT_ICON_MAP,
    THEME_RULES,
  };
}