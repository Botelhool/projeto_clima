# 🌤️ Weather Forecast Modern

Uma aplicação web de alta performance para consulta climática global, focada em experiência do usuário (UX) e robustez técnica. O projeto utiliza **JavaScript ES6+** puro e integra-se à **API Open-Meteo** para fornecer dados precisos em tempo real e previsão para 5 dias.

Este projeto foi desenvolvido como parte do ciclo de conclusão do curso de **Análise e Desenvolvimento de Sistemas (ADS)**, aplicando conceitos de Clean Code, Testes Automatizados (TDD) e Design Responsivo.

---

## 🚀 Funcionalidades Principais

* **Busca Global Inteligente**: Localiza cidades em qualquer lugar do mundo com suporte nativo a nomes em português.
* **Previsão Estendida**: Exibição detalhada das condições atuais e dos próximos 5 dias (máximas, mínimas e descrições).
* **Temas Adaptativos**: A interface altera automaticamente seu esquema de cores (CSS) com base no clima e no período do dia (dia/noite) da cidade consultada.
* **Geocodificação em Tempo Real**: Conversão dinâmica de nomes de cidades em coordenadas geográficas e fusos horários IANA.
* **Hora Local Sincronizada**: Exibe a data e hora exata da localidade buscada, independente do fuso horário do usuário.

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi construído seguindo princípios de **Separação de Preocupações (SoC)**:

* **Frontend**: HTML5 Semântico e CSS3 (Flexbox/Grid) com metodologia **Mobile-First**.
* **Lógica de Negócio**: JavaScript Assíncrono (`async/await`) e consumo de APIs REST.
* **Ícones**: Integração com a biblioteca *Weather Icons* para representação visual precisa.
* **Qualidade**: Código 100% documentado via **JSDoc** e protegido contra erros de ambiente (DOM Guard) para execução em Node.js.

---

## 🎨 Guia de Temas Visuais

A aplicação gerencia estados visuais dinâmicos através de classes aplicadas ao `body`, alterando gradientes e cores conforme o código WMO retornado:

| Tema CSS | Condição Atmosférica | Código WMO |
| :--- | :--- | :--- |
| `theme-day` | Céu limpo / Poucas nuvens | 0, 1 |
| `theme-night` | Qualquer condição (Período Noturno) | Baseado em `isDay: false` |
| `theme-rain` | Chuva, chuvisco ou pancadas | 51 a 82 |
| `theme-storm` | Tempestades e granizo | 95 a 99 |
| `theme-cloudy` | Nublado ou neblina | 2, 3, 45, 48 |
| `theme-snow` | Neve ou grãos de neve | 71 a 77, 85, 86 |

---

## 🧪 Qualidade de Código e Testes

O projeto utiliza o framework **Jest** para garantir que a lógica de integração com a API seja resiliente a falhas.

### Cenários de Teste Cobertos:
1.  **Sucesso na Busca**: Valida se o nome da cidade retorna as coordenadas e clima corretos.
2.  **Cidade Não Encontrada**: Tratamento do erro `NOT_FOUND`.
3.  **Falha de Conexão**: Simulação de erros de rede (`NETWORK`) e tempo de resposta (Timeout).
4.  **Erros de API**: Tratamento de respostas 500 ou excesso de requisições (429).
5.  **Interface**: Validação da lógica de tradução de erros para o usuário.

---

## 📦 Instalação e Execução

### Pré-requisitos
* Node.js instalado (recomendado para rodar os testes).
* Um navegador moderno (Chrome, Firefox, Edge).

### Passo a Passo
1.  **Clone o repositório**:
    ```bash
    git clone [https://github.com/seu-usuario/weather-forecast-modern.git](https://github.com/seu-usuario/weather-forecast-modern.git)
    ```
2.  **Instale as dependências de teste**:
    ```bash
    npm install
    ```
3.  **Execute os testes unitários**:
    ```bash
    npm test
    ```
4.  **Rodar a aplicação**:
    Basta abrir o arquivo `index.html` no navegador ou usar a extensão **Live Server** no VS Code.

---

## 📝 Autor

Desnvolvido por Leonardo Botelho

---