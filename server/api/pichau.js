import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
  const query = getQuery(event).query;

  if (!query) {
    return { message: 'Nenhum produto especificado para buscar' };
  }

  const url = `https://www.pichau.com.br/search?q=${encodeURIComponent(query)}`;

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

  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.MuiGrid-container .MuiGrid-item', { timeout: 30000 });

  // Rolagem para carregar todo o conteúdo
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  const data = await page.evaluate(() => {
    const products = Array.from(document.querySelectorAll(".MuiGrid-container .MuiGrid-item"));

    return products.map((product) => ({
      url: product.querySelector(".MuiGrid-item a")?.getAttribute("href"),
      title: product.querySelector(".MuiTypography-h6")?.textContent.trim(),
      price: product.querySelector(".MuiCardContent-root div div div div")?.textContent.trim(),
      realPrice: product.querySelector('.MuiCardContent-root > div > div > div > div:nth-child(3)')?.textContent.trim(),
      site: 'Pichau',
    }));
  });

  await browser.close();

  const cleanedData = data
    .filter(product => product.url && product.title && product.price) // Verifica se os campos essenciais estão presentes
    .filter((value, index, self) => index === self.findIndex((t) => t.url === value.url)); // Remove duplicados

  return cleanedData;
});
