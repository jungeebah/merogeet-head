const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;
const URL = 'https://www.google.com'


app.get('/', function(req, res) {
    (async() =>{
        try{
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36')
        await page.goto(URL);
        await page.waitForSelector("input")
        const searchBar = await page.$('input');
        searchBar.type(req.query.search);
        await page.waitFor(1000);
        searchBar.press('Enter');

        var result = ''
        await page.waitForSelector('h3');
        const table = await page.$('div[class="srg"]');
        if (table){
            const lists = await table.$$('div[class="g"]')
            for (const t of lists){
                const description = await t.$eval('cite', el => el.textContent.trim())
                const links = await t.$eval('a', a => a.href)
                if (description.toLowerCase().indexOf('official') >= 0){
                    result = links;
                    break;
                }else if (description.toLowerCase().indexOf('public figure') >= 0){
                    result = links;
                    break;
                }
            }
        }
        await page.screenshot().then(function(buffer) {
            res.setHeader('Content-Type', 'text/html');
            res.send(result)
        });
        
        await browser.close();
        }
        catch(e){

        } 
    })();
});

app.listen(port, function() {
    console.log('App listening on port ' + port)
})
