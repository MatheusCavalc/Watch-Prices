import puppeteer from 'puppeteer';

export default defineEventHandler(async () => {
    const url = 'https://www.kabum.com.br/';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(() => {
        const products = Array.from(document.querySelectorAll(".productCard"));

        return products.map((product) => ({
            url: product.querySelector(".productLink")?.getAttribute("href"),
            title: product.querySelector(".nameCard")?.textContent,
            price: product.querySelector(".priceCard")?.textContent
        }));
    });

    await browser.close();
    return data;
});
