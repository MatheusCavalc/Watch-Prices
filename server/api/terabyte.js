import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
  const query = getQuery(event).query;

  if (!query) {
    return { message: 'Nenhum produto especificado para buscar' };
  }

  const url = `https://www.terabyteshop.com.br/busca?str=${encodeURIComponent(query)}`;

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

  try {
    await page.waitForSelector('.close', { timeout: 5000 });
    await page.click('.close');
  } catch {
    console.log('Modal não encontrado ou já fechado');
  }

  const data = await page.evaluate(() => {
    const products = Array.from(document.querySelectorAll('.product-item'));

    return products.map((product) => ({
      url: product.querySelector('.product-item__image')?.getAttribute('href'),
      title: product.querySelector('.product-item__name')?.getAttribute('title'),
      image: product.querySelector('.image-thumbnail')?.getAttribute('src'),
      price: product.querySelector('.product-item__new-price span')?.textContent,
      site: 'Terabyte',
    }));
  });

  await browser.close();
  return data;
});
