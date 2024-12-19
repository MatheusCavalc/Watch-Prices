const puppeter = require('puppeteer')

const url = 'https://www.kabum.com.br/'

async function main() {
    const browser = await puppeter.launch({
        headless: false,
    })

    const page = await browser.newPage();
    await page.goto(url)

    await page.evaluate(() => {
        const products = Array.from(document.querySelectorAll(".productCard"))

        console.log(products)

        const data = products.map((product) => ({
            url: product.querySelector(".productLink")?.getAttribute("href"),
            title: product.querySelector(".nameCard")?.textContent
        }))

        return data
    })

    await browser.close()
}

module.exports = { main };