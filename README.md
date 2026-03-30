# 🌤️ Weather Forecast Modern

Uma aplicação web elegante, responsiva e de alta performance para consulta de condições climáticas em tempo real. Desenvolvida com **HTML5**, **CSS3** e **JavaScript puro (ES6+)**, sem dependências de frameworks externos.

---

## 🚀 Demonstração

O projeto foi construído com a metodologia **Mobile-First**, garantindo uma experiência impecável desde smartphones antigos até monitores Desktop de alta resolução.

---

## ✨ Funcionalidades

| Recurso | Descrição |
| :--- | :--- |
| 🔍 **Busca inteligente** | Localiza cidades em qualquer lugar do mundo com suporte a nomes em português |
| 📍 **Geocodificação dinâmica** | Converte nomes de cidades em coordenadas geográficas via Open-Meteo |
| 🌡️ **Temperatura em tempo real** | Exibe a temperatura atual em °C com base nos dados meteorológicos |
| 🌥️ **Descrição do clima** | Traduz códigos WMO em descrições amigáveis (ex.: "Chuva moderada") |
| 🌙 **Ícones adaptativos** | Usa a biblioteca Weather Icons com troca automática entre ícones diurnos e noturnos |
| 🎨 **Tema dinâmico** | Fundo muda de cor conforme o clima e o horário da cidade consultada |
| 🕐 **Hora local** | Exibe a data e hora no fuso horário real da cidade buscada |
| ⚠️ **Tratamento de erros** | Mensagens amigáveis para cidade inválida, falha de rede e API indisponível |
| 📱 **Design responsivo** | Breakpoints para celulares antigos, modernos, tablets e desktops |

---

## 🛠️ Tecnologias

- **HTML5** — Estrutura semântica e acessível
- **CSS3** — Flexbox, Media Queries, `clamp()`, transições e gradientes
- **JavaScript ES6+** — `async/await`, `fetch`, `Intl.DateTimeFormat`, módulos
- **[Open-Meteo Geocoding API](https://open-meteo.com/)** — Geocodificação gratuita e sem chave
- **[Open-Meteo Weather API](https://open-meteo.com/)** — Dados climáticos em tempo real
- **[Weather Icons](https://erikflowers.github.io/weather-icons/)** — Biblioteca de ícones meteorológicos

---

## 📦 Como rodar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/weather-forecast-modern.git
   cd weather-forecast-modern
   ```

2. **Abra o projeto:**
   ```bash
   # Opção 1 — direto no navegador
   open index.html

   # Opção 2 — servidor local com Node.js
   npx serve .

   # Opção 3 — extensão Live Server no VS Code
   # Clique com botão direito em index.html → "Open with Live Server"
   ```

> ⚠️ Nenhuma chave de API é necessária. A Open-Meteo é gratuita e de código aberto.

---

## 📁 Estrutura do projeto

```
weather-forecast-modern/
├── index.html   # Estrutura HTML e cards de busca/resultado
├── style.css    # Estilos, temas visuais e responsividade
├── api.js       # Lógica de negócio, consumo de APIs e controle da UI
└── README.md    # Documentação do projeto
```

---

## 📖 Documentação do código (JSDoc)

Todo o arquivo `api.js` é documentado com o padrão **JSDoc**, permitindo geração automática de documentação e integração com editores como VS Code (IntelliSense).

### Principais símbolos documentados

| Símbolo | Tipo | Descrição |
| :--- | :--- | :--- |
| `WMO_MAP` | `Object.<number, WmoEntry>` | Mapeamento de códigos WMO para descrição e ícone |
| `NIGHT_ICON_MAP` | `Object.<string, string>` | Conversão de ícones diurnos para noturnos |
| `THEME_RULES` | `Array` | Regras de tema CSS por faixa de código WMO |
| `geocodeCity(city)` | `async function` | Geocodifica nome de cidade → lat/lon/timezone |
| `fetchWeather(lat, lon, tz)` | `async function` | Busca temperatura e código WMO atual |
| `getThemeByCode(code, isDay)` | `function` | Resolve classe CSS de tema pelo clima e período |
| `formatLocalTime(timezone)` | `function` | Formata data e hora no fuso da cidade |
| `friendlyError(code)` | `function` | Converte código de erro em mensagem amigável |
| `handleSearch()` | `async function` | Orquestra o fluxo completo de busca e renderização |
| `goHome()` | `function` | Restaura a interface para o estado inicial |

### Tipos customizados (`@typedef`)

```js
/**
 * @typedef {Object} GeoResult
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} name
 * @property {string} country
 * @property {string} timezone
 */

/**
 * @typedef {Object} WeatherResult
 * @property {number}  temp
 * @property {number}  code
 * @property {boolean} isDay
 */
```

### Gerar documentação HTML com JSDoc

```bash
# Instala o JSDoc globalmente
npm install -g jsdoc

# Gera a documentação em /docs
jsdoc api.js -d docs
```

---

## 🎨 Guia de Temas Visuais

O fundo da aplicação muda automaticamente conforme o clima e o horário:

| Tema CSS | Condição | Gradiente |
| :--- | :--- | :--- |
| `theme-day` | Céu limpo — dia | Azul claro `#7dd3ea → #c8edf7` |
| `theme-night` | Qualquer clima — noite | Azul escuro `#0d1b3e → #0f2447` |
| `theme-cloudy` | Nublado / neblina | Cinza `#708090 → #475569` |
| `theme-rain` | Chuva / chuvisco | Azul-cinza `#3a4b5c → #263238` |
| `theme-storm` | Tempestade / granizo | Chumbo `#1f1c2c → #000000` |
| `theme-snow` | Neve | Branco `#e2e8f0 → #cbd5e1` |

---

## 🎨 Design System

| Elemento | Valor |
| :--- | :--- |
| **Destaque / Botões** | `#4a90d9` |
| **Texto principal** | `#2c4a6e` |
| **Fundo do card (dia)** | `#ffffff` |
| **Fundo do card (noite)** | `rgba(28, 46, 80, 0.95)` |
| **Erro** | Borda `#e87070`, fundo `#fde8e8` |

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Sinta-se à vontade para clonar, estudar e contribuir!

---

**Desenvolvido por Leonardo** 🚀  
*Estudante de Análise e Desenvolvimento de Sistemas*
