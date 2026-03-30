// ── Simulação da Lógica da nossa API ───────────────────────
// Em um projeto avançado, importaríamos isso do api.js. 
// Aqui, isolamos a lógica puramente matemática e de requisição para o Node testar.
async function simularBuscaClima(cidade) {
  if (!cidade || cidade.trim() === '') {
    throw new Error('Entrada vazia. Digite uma cidade.');
  }

  // Simula o timeout (Erro de conexão lenta)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 segundo de limite

  try {
    const res = await fetch(`https://api.exemplo.com/weather?q=${cidade}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (res.status === 429) {
      throw new Error('Excesso de requisições. Tente mais tarde.');
    }
    
    if (!res.ok) {
      throw new Error('Falha na API');
    }

    const data = await res.json();

    // Simula mudança de formato da API (quebra de contrato)
    if (!data.results && !data.current) {
      throw new Error('Formato de resposta inválido');
    }

    if (data.results && data.results.length === 0) {
      throw new Error('Cidade não encontrada');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout de conexão');
    }
    throw error;
  }
}

// ── Início dos Testes do Jest ──────────────────────────────
describe('Testes Unitários - App de Clima', () => {
  
  // Limpa as simulações antes de cada teste para não misturar resultados
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1. Cenário de Sucesso
  it('1. Nome de cidade válido retorna dados meteorológicos', async () => {
    // Simulando uma resposta perfeita da API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ results: [{ name: 'Londres' }], current: { temperature_2m: 15 } })
    });

    const resultado = await simularBuscaClima('Londres');
    expect(resultado.results[0].name).toBe('Londres');
    expect(resultado.current.temperature_2m).toBe(15);
  });

  // 2. Erro Tratado (Cidade não existe)
  it('2. Nome de cidade inexistente lança exceção tratada', async () => {
    // Simulando API retornando array vazio (cidade não achada)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ results: [] })
    });

    await expect(simularBuscaClima('CidadeInventada123')).rejects.toThrow('Cidade não encontrada');
  });

  // 3. Erro de Validação (Input vazio)
  it('3. Entrada vazia retorna erro de validação', async () => {
    // Nem chega a chamar o fetch
    await expect(simularBuscaClima('')).rejects.toThrow('Entrada vazia');
    await expect(simularBuscaClima('   ')).rejects.toThrow('Entrada vazia');
  });

  // 4. Falha na API (Erro 500)
  it('4. Falha da API gera resposta adequada (timeout ou erro)', async () => {
    // Simulando servidor fora do ar
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(simularBuscaClima('Paris')).rejects.toThrow('Falha na API');
  });

  // 5. Rate Limit (Status 429)
  it('5. Excesso de requisições deve ser bloqueado', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429 // Status HTTP padrão para "Too Many Requests"
    });

    await expect(simularBuscaClima('Roma')).rejects.toThrow('Excesso de requisições');
  });

  // 6. Timeout (Demorou mais de 1 segundo)
  it('6. Conexão lenta deve dar timeout', async () => {
    // Simulando um fetch que entende o sinal do AbortController
    global.fetch.mockImplementationOnce((url, options) => 
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ ok: true, status: 200 }), 1100);
        
        // Se a função enviar um sinal de abortar (aos 1000ms), nós rejeitamos com o erro certo
        if (options && options.signal) {
          options.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject({ name: 'AbortError' });
          });
        }
      })
    );

    await expect(simularBuscaClima('Tóquio')).rejects.toThrow('Timeout de conexão');
  });

  // 7. Mudança na estrutura da API
  it('7. API mudou e quebrou o formato', async () => {
    // Simulando a API retornando um formato que não tem "results" nem "current"
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ dados_aleatorios: true, clima: 'sol' }) // Estrutura errada
    });

    await expect(simularBuscaClima('Berlim')).rejects.toThrow('Formato de resposta inválido');
  });

});