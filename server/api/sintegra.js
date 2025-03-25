import puppeteer from 'puppeteer';

// api/sintegra.js ou o arquivo de seu handler
export default defineEventHandler(async (event) => {
  const results = [];
  let browser = null;  // Definido fora do bloco try para garantir que o browser seja acessível em todo o escopo
  try {
    const query = getQuery(event).query;

    
    
    

    
    const empresas = [
      { nome: "Empresa A", cnpj: "01029098000334" },
      { nome: "Empresa B", cnpj: "03802460000202" },
      { nome: "Empresa C", cnpj: "07054322000162" },
    ];




    


    // Inicia o navegador fora do loop para não abrir e fechar o browser repetidamente
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
      ],
      defaultViewport: null,
    });

    // Para cada empresa, realiza a consulta
    for (const empresa of empresas) {
      const url = `https://consultapublica.sefaz.ce.gov.br/sintegra/consultar?tipdocumento=2&numcnpjcgf=${encodeURIComponent(empresa.cnpj)}`;

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      );

      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Captura o conteúdo desejado
      const tdContent = await page.$eval(
        '#card-tables .body table#enderecosintegara:nth-of-type(3) thead tr:nth-of-type(4) td',
        (element) => {
          return element.innerText;
        }
      );

      results.push({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        tdContent,
      });

      await page.close(); // Fecha a página após a consulta
    }

    // Retorna os resultados
    if (results.length === 0) {
      return { error: 'Nenhuma informação foi encontrada para os CNPJs informados.' };
    }

    return { results }; // Retorna os resultados

  } catch (error) {
    console.error('Erro no backend:', error);

    // Captura detalhes do erro, incluindo a mensagem e o stack trace
    return {
      error: 'Ocorreu um erro ao realizar a consulta. Tente novamente mais tarde.',
      erro: error.message,  // Inclui a mensagem do erro
      stack: error.stack,   // Opcional: Retorna o stack trace para depuração
    };

  } finally {
    // Certifique-se de que o browser seja fechado se ele foi inicializado
    if (browser) {
      await browser.close(); // Fecha o navegador, independente de erro
    }
  }
});
