import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
  const query = getQuery(event).query;

  if (!query) {
    return { message: 'Nenhum produto especificado para buscar' };
  }

  // Codificando o nome do produto na URL para evitar problemas com espaços ou caracteres especiais
  const url = `https://www.terabyteshop.com.br/busca?str=${encodeURIComponent(query)}`;

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  try {
    await page.waitForSelector('.close', { timeout: 5000 });
    await page.click('.close');
  } catch (error) {
    console.log('Modal não encontrado ou já fechado');
  }

  const data = await page.evaluate(() => {
    const products = Array.from(document.querySelectorAll(".product-item"));

    return products.map((product) => ({
      url: product.querySelector(".product-item .product-item__grid .product-item__box .product-item__image")?.getAttribute("href"),
      title: product.querySelector(".product-item__name")?.getAttribute("title"),
      price: product.querySelector(".product-item__new-price span")?.textContent,
      site: 'Terabyte'
    }));
  });

  await browser.close();
  return data;
});
