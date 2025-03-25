import puppeteer from 'puppeteer';

// api/sintegra.js ou o arquivo de seu handler
export default defineEventHandler(async (event) => {
  const query = getQuery(event).query;

  const url = `https://consultapublica.sefaz.ce.gov.br/sintegra/consultar?tipdocumento=2&numcnpjcgf=${encodeURIComponent(query)}`

  //return { url };

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const tdContent = await page.$eval(
    '#card-tables .body table#enderecosintegara:nth-of-type(3) thead tr:nth-of-type(4) td',
    (element) => {
      return element.innerText;
    })

  return { tdContent }; // Retorna a query em formato JSON.
});


[
  { nome: "Empresa A", cnpj: "12345678000190" },
  { nome: "Empresa B", cnpj: "98765432000112" },
  { nome: "Empresa C", cnpj: "11223344000155" }
];