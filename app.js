const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;

function google_search(search) {
    var result = []
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
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
            const table = await page.$('div[id="search"]');
            const side_bar = await page.$('div[class="kp-wholepage kp-wholepage-osrp HSryR EyBRub"]')
            if (table) {
                const lists = await table.$$('div[class="g"]')
                for (const t of lists) {
                    const description = await t.$eval('cite', el => el.textContent.trim())
                    const links = await t.$eval('a', a => a.href)
                    if (description.toLocaleLowerCase().indexOf('fan') >= 0) {
                        continue
                    }
                    else if (description.toLowerCase().indexOf('wikipedia') >= 0) {
                        const wiki = { 'wiki': links }
                        result.push(wiki)
                    } else if (description.toLowerCase().indexOf('instagram') >= 0) {
                        const insta = { 'instagram': links }
                        result.push(insta)
                    } else if (description.toLowerCase().indexOf('facebook') >= 0) {
                        const facebook = { 'facebook': links }
                        result.push(facebook)
                    }
                    else if (description.toLowerCase().indexOf('twitter') >= 0) {
                        const twitter = { 'twitter': links }
                        result.push(twitter)
                    }
                }
            }
            if (side_bar) {
                profile_listing = await page.$('div[class="OOijTb P6Tjc gDQYEd"]')
                profile = await profile_listing.$$('div[class="PZPZlf dRrfkf kno-vrt-t"]')
                for (const p of profile) {
                    link = await p.$eval('a', a => a.href)
                    if (link.toLowerCase().indexOf('instagram') >= 0) {
                        const instag = { 'insta': link }
                        result.push(instag)
                    }
                    else if (link.toLocaleLowerCase().indexOf('facebook') >= 0) {
                        const fac = { 'facebook': link }
                        result.push(fac)
                    }
                    else if (link.toLocaleLowerCase().indexOf('twitter') >= 0) {
                        const tweet = { 'twitter': link }
                        result.push(tweet)
                    }
                }
            }
            await browser.close();
            return resolve(result);
        }
        catch (e) {
            return reject(e)
        }
    })
}

app.get('/', function (req, res) {
    if (Object.keys(req.query).length === 0) {
        res.send('Use search key')
    } else {
        (async () => {
            google_search(req.query.search + 'nepali actor').then(function (result) {
                res.setHeader('Content-Type', 'text/html');
                res.send(result)
            }).catch(console.error);
        })();
    }
});

app.listen(port, function () {
    console.log('App listening on port ' + port)
})
