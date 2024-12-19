import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
    // Pegando o parâmetro da query da URL
    const query = getQuery(event).query;

    if (!query) {
        return { message: 'Nenhum produto especificado para buscar' };
    }

    // Codificando o nome do produto na URL para evitar problemas com espaços ou caracteres especiais
    const url = `https://www.kabum.com.br/busca/${encodeURIComponent(query)}`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(() => {
        const products = Array.from(document.querySelectorAll(".productCard"));

        return products.map((product) => ({
            url: product.querySelector(".productLink")?.getAttribute("href"),
            title: product.querySelector(".nameCard")?.textContent,
            price: product.querySelector(".priceCard")?.textContent,
            site: 'Kabum'
        }));
    });

    await browser.close();
    return data;
});
