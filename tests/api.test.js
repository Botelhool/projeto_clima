// Importa o módulo que você desenvolveu. O require permite acessar 
// as funções exportadas no final do seu api.js.
const api = require('../api');

describe('Testes de Integração/Unidade - API de Clima', () => {

  // Executado antes de cada 'it'. Garante que um teste não 
  // influencie o resultado do próximo.
  beforeEach(() => {
    global.fetch = jest.fn();
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeCity()', () => {
    it('Deve retornar coordenadas quando a cidade existe', async () => {

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ latitude: -22.9, longitude: -43.1, name: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo' }]
        })
      });

      const resultado = await api.geocodeCity('Rio de Janeiro');
      expect(resultado.latitude).toBe(-22.9);
      expect(resultado.name).toBe('Rio de Janeiro');
    });

    it('Deve lançar erro NOT_FOUND para cidade inexistente', async () => {

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });


      await expect(api.geocodeCity('CidadeQueNaoExiste')).rejects.toThrow('NOT_FOUND');
    });

    it('Deve lançar erro NETWORK em falha de conexão', async () => {

      global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
      await expect(api.geocodeCity('Paris')).rejects.toThrow('NETWORK');
    });
  });

  describe('fetchWeather()', () => {
    it('Deve processar corretamente os dados atuais e a previsão de 5 dias', async () => {
      // Mock de uma resposta completa da Open-Meteo (tempo atual + arrays de previsão).
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current_weather: { temperature: 25, weathercode: 0, is_day: 1 },
          daily: {
            time: ['2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04'],
            weather_code: [0, 1, 2, 3, 45],
            temperature_2m_max: [30, 28, 27, 26, 25],
            temperature_2m_min: [20, 19, 18, 17, 16]
          }
        })
      });

      const dados = await api.fetchWeather(-22.9, -43.1, 'America/Sao_Paulo');
      expect(dados.temp).toBe(25);
      expect(dados.daily).toHaveLength(5);
      expect(dados.daily[0].weekday).toBe('Hoje');
    });

    it('Deve lançar API_ERROR quando o status do servidor for 500', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });
      await expect(api.fetchWeather(0, 0, 'UTC')).rejects.toThrow('API_ERROR');
    });
  });

  describe('Utilidades de Interface', () => {
    it('friendlyError deve traduzir códigos para mensagens amigáveis', () => {
      expect(api.friendlyError('NOT_FOUND')).toContain('Cidade não encontrada');
      expect(api.friendlyError('CODIGO_INVALIDO')).toBe('Ocorreu um erro inesperado. Tente novamente.');
    });

    it('getThemeByCode deve retornar o tema correto para chuva e noite', () => {
      expect(api.getThemeByCode(61, true)).toBe('theme-rain');
      expect(api.getThemeByCode(0, false)).toBe('theme-night');
    });
  });
});