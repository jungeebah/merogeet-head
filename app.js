const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;

function google_search(search){
    var result = ''
    return new Promise(async (resolve, reject) => {
        try{
            const browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36')
            await page.goto('https://www.google.com');
            await page.waitForSelector("input")
            const searchBar = await page.$('input');
            searchBar.type(search);
            await page.waitFor(1000);
            searchBar.press('Enter');
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
                    }else if (description.toLowerCase().indexOf('performing arts') >= 0){
                        result = links;
                        break;
                    }
                }
            }
            await browser.close();
            return resolve(result);
        }
        catch(e){
            return reject(e)
        }
    })
}

app.get('/', function(req, res) {
    if (Object.keys(req.query).length === 0){
        res.send('Use search key')
    }else{
        (async() =>{
            google_search(req.query.search + " facebook page").then(function(result){
                res.setHeader('Content-Type', 'text/html');
                res.send(result)
            }).catch(console.error);
        })();
    }
});

app.listen(port, function() {
    console.log('App listening on port ' + port)
})
