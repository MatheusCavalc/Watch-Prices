import puppeteer from 'puppeteer';

export default defineEventHandler(async (event) => {
    // Pegando o parâmetro da query da URL
    const query = getQuery(event).query;

    if (!query) {
        return { message: 'Nenhum produto especificado para buscar' };
    }

    // URLs dos sites
    const kabumUrl = `https://www.kabum.com.br/busca/${encodeURIComponent(query)}`;
    const terabyteUrl = `https://www.terabyteshop.com.br/busca?str=${encodeURIComponent(query)}`;
    const pichauUrl = `https://www.pichau.com.br/search?q=${encodeURIComponent(query)}`;

    // Lançando o Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
        defaultViewport: null,
    });

    // Função para fazer scraping do Kabum
    const scrapeKabum = async () => {
        const page = await browser.newPage();
        await page.goto(kabumUrl);

        const data = await page.evaluate(() => {
            const products = Array.from(document.querySelectorAll(".productCard"));

            return products.map((product) => ({
                url: 'https://www.kabum.com.br/' + product.querySelector(".productLink")?.getAttribute("href"),
                title: product.querySelector(".nameCard")?.textContent,
                image: product.querySelector(".imageCard")?.getAttribute("src"),
                price: product.querySelector(".priceCard")?.textContent,
                site: 'Kabum',
            }));
        });

        await page.close();
        return data;
    };

    // Função para fazer scraping do Terabyte
    const scrapeTerabyte = async () => {
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        );
        await page.goto(terabyteUrl, { waitUntil: 'domcontentloaded' });

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

        await page.close();
        return data;
    };

    // Função para fazer scraping do Pichau
    const scrapePichau = async () => {
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        );
        await page.goto(pichauUrl, { waitUntil: 'domcontentloaded' });

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
                image: product.querySelector('.lazyload-wrapper div img')?.getAttribute("src"),
                price: product.querySelector(".MuiCardContent-root div div div div")?.textContent.trim(),
                realPrice: product.querySelector('.MuiCardContent-root > div > div > div > div:nth-child(3)')?.textContent.trim(),
                site: 'Pichau',
            }));
        });

        await page.close();
        return data;
    };

    // Realizando scraping nos três sites
    const kabumData = await scrapeKabum();
    const terabyteData = await scrapeTerabyte();
    const pichauData = await scrapePichau();

    // Unindo os dados dos três sites
    const allData = [...kabumData, ...terabyteData, ...pichauData];

    // Fechando o navegador
    await browser.close();

    // Limpando e removendo produtos duplicados
    const cleanedData = allData
        .filter(product => product.url && product.title && product.price) // Verifica se os campos essenciais estão presentes
        .filter((value, index, self) => index === self.findIndex((t) => t.url === value.url)); // Remove duplicados

    // Retornando os dados combinados
    return cleanedData;
});
