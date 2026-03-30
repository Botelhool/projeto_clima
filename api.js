/**
 * @fileoverview Módulo principal de consumo de APIs climáticas.
 *
 * Responsável por:
 * - Geocodificar nomes de cidades em coordenadas geográficas
 * - Consultar condições climáticas em tempo real via Open-Meteo
 * - Renderizar os resultados na interface
 * - Gerenciar temas visuais (dia, noite, chuva, tempestade etc.)
 *
 * @author      Leonardo
 * @version     2.0.0
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
 * @see {@link https://open-meteo.com/en/docs#weathervariables} Tabela de códigos WMO
 *
 * @example
 * const entry = WMO_MAP[0];
 * // → { desc: 'Céu limpo', icon: 'wi-day-sunny' }
 */
const WMO_MAP = {
  0:  { desc: 'Céu limpo',                    icon: 'wi-day-sunny'       },
  1:  { desc: 'Predom. limpo',                icon: 'wi-day-cloudy'      },
  2:  { desc: 'Parcialmente nublado',         icon: 'wi-day-cloudy'      },
  3:  { desc: 'Nublado',                      icon: 'wi-cloudy'          },
  45: { desc: 'Neblina',                      icon: 'wi-fog'             },
  48: { desc: 'Neblina com geada',            icon: 'wi-fog'             },
  51: { desc: 'Chuvisco leve',               icon: 'wi-sprinkle'        },
  53: { desc: 'Chuvisco moderado',           icon: 'wi-sprinkle'        },
  55: { desc: 'Chuvisco intenso',            icon: 'wi-sprinkle'        },
  61: { desc: 'Chuva leve',                  icon: 'wi-rain'            },
  63: { desc: 'Chuva moderada',              icon: 'wi-rain'            },
  65: { desc: 'Chuva intensa',               icon: 'wi-rain'            },
  71: { desc: 'Neve leve',                   icon: 'wi-snow'            },
  73: { desc: 'Neve moderada',               icon: 'wi-snow'            },
  75: { desc: 'Neve intensa',                icon: 'wi-snow'            },
  77: { desc: 'Grãos de neve',               icon: 'wi-snow-wind'       },
  80: { desc: 'Pancadas de chuva',           icon: 'wi-showers'         },
  81: { desc: 'Pancadas moderadas',          icon: 'wi-showers'         },
  82: { desc: 'Pancadas violentas',          icon: 'wi-storm-showers'   },
  85: { desc: 'Pancadas de neve leve',       icon: 'wi-snow'            },
  86: { desc: 'Pancadas de neve intensa',    icon: 'wi-snow'            },
  95: { desc: 'Tempestade',                  icon: 'wi-thunderstorm'    },
  96: { desc: 'Tempestade com granizo',      icon: 'wi-hail'            },
  99: { desc: 'Tempestade com granizo forte',icon: 'wi-hail'            },
};

/**
 * Mapeamento de ícones diurnos para seus equivalentes noturnos.
 * Utilizado quando `is_day === 0` retornado pela API.
 *
 * @constant
 * @type {Object.<string, string>}
 *
 * @example
 * const nightIcon = NIGHT_ICON_MAP['wi-day-sunny'];
 * // → 'wi-night-clear'
 */
const NIGHT_ICON_MAP = {
  'wi-day-sunny':  'wi-night-clear',
  'wi-day-cloudy': 'wi-night-alt-cloudy',
};

/**
 * Mapeamento de temas CSS por faixa de código WMO.
 * Cada tema corresponde a um gradiente de fundo definido no `style.css`.
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
 * A função percorre {@link THEME_RULES} para encontrar o tema adequado ao
 * código meteorológico. Se o período for noturno, retorna `'theme-night'`
 * independentemente do código, exceto para neve (mantém `'theme-snow'`).
 *
 * @param   {number}  code  - Código WMO retornado pela API Open-Meteo.
 * @param   {boolean} isDay - `true` se for período diurno; `false` se noturno.
 * @returns {string}          Classe CSS do tema (ex.: `'theme-rain'`).
 *
 * @example
 * getThemeByCode(63, true);  // → 'theme-rain'
 * getThemeByCode(0,  false); // → 'theme-night'
 * getThemeByCode(73, false); // → 'theme-snow'
 */
function getThemeByCode(code, isDay) {
  const rule  = THEME_RULES.find(r => code >= r.min && code <= r.max);
  const theme = rule ? rule.theme : 'theme-day';

  // Noite: mantém neve; nos demais, aplica tema noturno
  if (!isDay) return theme === 'theme-snow' ? 'theme-snow' : 'theme-night';
  return theme;
}

/**
 * Formata a data e hora atual no fuso horário da cidade consultada,
 * utilizando a API nativa `Intl.DateTimeFormat`.
 *
 * @param   {string} timezone - Identificador IANA do fuso (ex.: `'America/Sao_Paulo'`).
 * @returns {string}            String formatada em pt-BR com
 *                              dia da semana, data completa e horário.
 *
 * @example
 * formatLocalTime('America/Sao_Paulo');
 * // → 'Segunda-feira, 30 de março de 2025 · 14:32'
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
  // Capitaliza a primeira letra e insere separador · antes do horário
  return raw.replace(/^(.)/, c => c.toUpperCase())
            .replace(/\s(\d{2}:\d{2})$/, ' · $1');
}

/**
 * Exibe uma mensagem de erro na caixa de erro do formulário.
 *
 * @param   {string} msg - Texto da mensagem a ser exibida.
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
 * @typedef  {Object} GeoResult
 * @property {number} latitude  - Latitude da cidade encontrada.
 * @property {number} longitude - Longitude da cidade encontrada.
 * @property {string} name      - Nome da cidade em português (quando disponível).
 * @property {string} country   - Nome do país.
 * @property {string} timezone  - Fuso horário IANA da cidade (ex.: `'America/Sao_Paulo'`).
 */

/**
 * Geocodifica o nome de uma cidade em coordenadas geográficas e metadados
 * utilizando a API de Geocodificação do Open-Meteo.
 *
 * @async
 * @param   {string}            city - Nome da cidade a ser buscada.
 * @returns {Promise<GeoResult>}       Objeto com coordenadas e informações da cidade.
 *
 * @throws {Error} `'NOT_FOUND'`  — Nenhum resultado retornado para a cidade.
 * @throws {Error} `'API_ERROR'`  — Resposta HTTP com status de erro.
 * @throws {Error} `'NETWORK'`    — Falha de rede (sem conexão).
 *
 * @example
 * const geo = await geocodeCity('Florianópolis');
 * console.log(geo.latitude, geo.longitude);
 * // → -27.5954, -48.548
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
 * @typedef  {Object} WeatherResult
 * @property {number}  temp  - Temperatura atual arredondada (°C).
 * @property {number}  code  - Código WMO da condição climática.
 * @property {boolean} isDay - `true` se for período diurno no local consultado.
 */

/**
 * Consulta as condições climáticas atuais para as coordenadas informadas
 * utilizando a API de Previsão do Tempo do Open-Meteo.
 *
 * @async
 * @param   {number}               latitude  - Latitude da localização.
 * @param   {number}               longitude - Longitude da localização.
 * @param   {string}               timezone  - Fuso horário IANA para cálculo correto de `is_day`.
 * @returns {Promise<WeatherResult>}           Objeto com temperatura, código WMO e período do dia.
 *
 * @throws {Error} `'API_ERROR'`  — Resposta HTTP com status de erro ou dados ausentes.
 * @throws {Error} `'NETWORK'`    — Falha de rede (sem conexão).
 *
 * @example
 * const weather = await fetchWeather(-23.5505, -46.6333, 'America/Sao_Paulo');
 * console.log(weather.temp, weather.isDay);
 * // → 21, true
 */
async function fetchWeather(latitude, longitude, timezone) {
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${latitude}&longitude=${longitude}`
    + `&current_weather=true`
    + `&timezone=${encodeURIComponent(timezone)}`;

  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('NETWORK');
  }

  if (!res.ok) throw new Error('API_ERROR');

  const data = await res.json();
  if (!data.current_weather) throw new Error('API_ERROR');

  const { temperature, weathercode, is_day } = data.current_weather;
  return {
    temp:  Math.round(temperature),
    code:  weathercode,
    isDay: is_day === 1,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTROLADORES DE INTERFACE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Retorna uma mensagem de erro amigável em português com base no código
 * interno do erro lançado pelas funções de API.
 *
 * @param   {string} code - Código interno do erro (`'NOT_FOUND'`, `'NETWORK'`, `'API_ERROR'`).
 * @returns {string}        Mensagem legível para exibição ao usuário.
 *
 * @example
 * friendlyError('NETWORK');
 * // → 'Sem conexão com a internet. Verifique sua rede.'
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
 * Manipulador do evento de busca. Orquestra todo o fluxo da aplicação:
 * validação do input → geocodificação → consulta climática → renderização.
 *
 * Atualiza o DOM com temperatura, ícone, descrição, cidade, data/hora local
 * e aplica o tema visual correspondente às condições climáticas.
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * // Chamado pelo atributo onclick do botão ou pelo evento keydown (Enter)
 * await handleSearch();
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

    // 2. Dados climáticos
    const { temp, code, isDay } = await fetchWeather(latitude, longitude, timezone);

    // 3. Tema visual
    document.body.className = getThemeByCode(code, isDay);

    // 4. Data e hora no fuso da cidade
    document.getElementById('dateTime').textContent = formatLocalTime(timezone);

    // 5. Ícone (com troca dia/noite)
    const wmo       = WMO_MAP[code] ?? { desc: 'Desconhecido', icon: 'wi-na' };
    let   iconClass = wmo.icon;
    if (!isDay && NIGHT_ICON_MAP[iconClass]) iconClass = NIGHT_ICON_MAP[iconClass];

    // 6. Atualiza DOM
    document.getElementById('tempValue').textContent  = temp;
    document.getElementById('cityName').textContent   = `${name}, ${country}`;
    document.getElementById('weatherDesc').textContent = wmo.desc;
    document.getElementById('weatherIcon').className  = `wi weather-icon ${iconClass}`;

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
 * Oculta o card de resultado, exibe o card de busca,
 * limpa o campo de input, remove erros e reaplica o tema diurno padrão.
 *
 * @returns {void}
 *
 * @example
 * // Chamado pelo atributo onclick do botão "home"
 * goHome();
 */
function goHome() {
  document.getElementById('resultCard').classList.add('hidden');
  document.getElementById('searchCard').classList.remove('hidden');
  document.getElementById('cityInput').value = '';
  document.body.className = 'theme-day';
  hideError();
  document.getElementById('cityInput').focus();
}

// ══════════════════════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Permite acionar a busca pressionando Enter no campo de texto,
 * evitando a necessidade de clicar no botão.
 *
 * @listens KeyboardEvent#keydown
 */
document.getElementById('cityInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// ══════════════════════════════════════════════════════════════════════════════
//  EXPORTAÇÃO (compatibilidade com ambientes Node.js / testes)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Exporta funções internas para uso em testes unitários com Node.js/Jest.
 * O bloco só é executado quando o módulo é detectado (ambiente não-browser).
 *
 * @module api
 */
if (typeof module !== 'undefined') {
  module.exports = {
    geocodeCity,
    fetchWeather,
    formatLocalTime,
    getThemeByCode,
    friendlyError,
    WMO_MAP,
    NIGHT_ICON_MAP,
    THEME_RULES,
  };
} 
