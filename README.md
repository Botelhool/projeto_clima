# 🌤️ Previsão do tempo

Uma aplicação web elegante, responsiva e de alta performance para consulta de condições climáticas em tempo real. Este projeto utiliza geocodificação para localizar cidades globalmente e consome dados meteorológicos precisos através de APIs modernas.

---

## 🚀 Demonstração

O projeto foi construído com a metodologia **Mobile-First**, garantindo uma experiência impecável desde smartphones antigos até monitores Desktop de alta resolução.

### ✨ Principais Funcionalidades
* **Busca Inteligente:** Localiza cidades em qualquer lugar do mundo com suporte a nomes em português.
* **Geocodificação Dinâmica:** Converte nomes de cidades em coordenadas geográficas precisas (Latitude/Longitude).
* **Interface Reativa:** Transições suaves entre a tela de busca e a exibição dos resultados.
* **Design Fluido:** Uso estratégico de `clamp()` no CSS para tipografia e espaçamentos adaptáveis.
* **Tratamento de Erros:** Feedback visual imediato para campos vazios ou cidades não encontradas.

---

## 🛠️ Tecnologias e Conceitos

Para este projeto, priorizei o uso de tecnologias nativas (Vanilla) para demonstrar domínio sobre os fundamentos do desenvolvimento web:

* **HTML5:** Estrutura semântica e acessível.
* **CSS3 Moderno:**
    * **Layout:** Flexbox para alinhamento e centralização.
    * **Responsividade:** Media Queries e unidades relativas para suporte multi-dispositivo.
    * **Estilização:** Gradientes lineares e sombras suaves para um visual clean.
    * **UX:** Animações de entrada (`@keyframes`) e feedback tátil em botões.
* **JavaScript (ES6+):**
    * Manipulação assíncrona com `Async/Await`.
    * Consumo de APIs REST utilizando `Fetch`.
    * Gerenciamento de estado da interface (mostrar/esconder elementos).
* **APIs Externas (Open-Source):**
    * [Open-Meteo Geocoding](https://open-meteo.com/): Para busca e validação de cidades.
    * [Open-Meteo Weather](https://open-meteo.com/): Para dados de temperatura em tempo real.

---

## 📦 Como rodar o projeto

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/weather-forecast-modern.git](https://github.com/seu-usuario/weather-forecast-modern.git)
    ```
2.  **Acesse a pasta:**
    ```bash
    cd weather-forecast-modern
    ```
3.  **Execute o arquivo:**
    Basta abrir o `index.html` em qualquer navegador moderno.

---

## 🎨 Guia de Estilo (Design System)

A paleta de cores foi escolhida para transmitir uma sensação de frescor e clareza:

| Elemento | Valor / Hex |
| :--- | :--- |
| **Fundo Primário** | `#7dd3ea` para `#c8edf7` (Gradiente) |
| **Cor de Destaque** | `#4a90d9` (Botões e Interações) |
| **Texto Principal** | `#2c4a6e` (Azul Profundo para melhor leitura) |
| **Cards** | Branco puro com 18% de opacidade na sombra |

---

## 📝 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para clonar, estudar e contribuir!

---
**Desenvolvido por Leonardo** 🚀  
*Estudante de Análise e Desenvolvimento de Sistemas*
