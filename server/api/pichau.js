import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
  // Pegando o parâmetro da query da URL
  const query = getQuery(event).query;

  if (!query) {
    return { message: 'Nenhum produto especificado para buscar' };
  }

  // Codificando o nome do produto na URL para evitar problemas com espaços ou caracteres especiais
  const url = `https://www.pichau.com.br/search?q=${encodeURIComponent(query)}`;

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector('.MuiGrid-container .MuiGrid-item', { timeout: 30000 });

  const data = await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);

    const products = Array.from(document.querySelectorAll(".MuiGrid-container .MuiGrid-item"));

    return products.map((product) => ({
      url: product.querySelector(".MuiGrid-item a")?.getAttribute("href"),
      title: product.querySelector(".MuiTypography-h6")?.textContent,
      price: product.querySelector(".MuiCardContent-root div div div div")?.textContent,
      realPrice: product.querySelector('.MuiCardContent-root > div > div > div > div:nth-child(3)')?.textContent,
      site: 'Pichau'
    }));
  });

  await browser.close();

  const cleanedData = data
    .filter(product => product.url && product.title && product.price) // Verifica se os campos essenciais estão presentes
    .filter((value, index, self) => index === self.findIndex((t) => t.url === value.url)); // Remove duplicados

  return cleanedData
  return data;
});
