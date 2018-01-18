// import {normalize} from "./helpers";

const request = require('request');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const helpers = require('./helpers');

let lastCoins = null;

const tbl = {
    coinName: 2,
    price: 3,
    change: 4,
    volume: 5,
    marketcap: 6,
    ROI: 7,
    nodes: 8,
    required: 9,
    worth: 10,

};

let callback = (coin) => {
    console.log(`https://masternodes.online added a new coin\n\nName: ${coin.coinName}\nPrice: ${coin.price}\nROI: ${coin.ROI}\nNodes: ${coin.nodes}\nRequired: ${coin.required}\nWorth: ${coin.worth}`)

};

function saveListArray(obj){
    let arr;
    // if is first run
    if(lastCoins === null){
        arr = [];
    } else {
        arr = lastCoins;
    }
    for(let coin in obj){
        if(!arr.includes(coin)){
            arr.push(coin);
        }
    }
    lastCoins = arr;
}

function run() {
    console.log('Checking masternodes.online for new coins');
    request('https://masternodes.online/', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            try{
                const $ = cheerio.load(html);
                cheerioTableparser($);
                let data = $("#masternodes_table").parsetable(true, false, true);
                let mnCoins = {};
                for (let i = 1; i < data[0].length; i++) {
                    mnCoins[helpers.normalize(data[tbl.coinName][i])] = { // normalized coin name as key
                        coinName:data[tbl.coinName][i],
                        price:data[tbl.price][i],
                        change:data[tbl.change][i],
                        volume:data[tbl.volume][i],
                        marketcap:data[tbl.marketcap][i],
                        ROI:data[tbl.ROI][i],
                        nodes:data[tbl.nodes][i],
                        required:data[tbl.required][i],
                        worth:data[tbl.worth][i],
                    }
                }
                if(lastCoins === null){
                    saveListArray(mnCoins);
                }

                // test add a coin here to trigger
                // mnCoins[helpers.normalize('Test Coin (TEST)')] =  {
                //     coinName: 'Test Coin (TEST)',
                //     price: '$0.3844',
                //     change: '-2.48 %',
                //     volume: '$109,803',
                //     marketcap: '$6,052,374',
                //     ROI: '44.70%',
                //     nodes: '103',
                //     required: '50,000',
                //     worth: '$19,218'
                // };

                // look for changes
                let newCoins = [];
                for(let coin in mnCoins){
                    if(!lastCoins.includes(coin)){
                        newCoins.push(mnCoins[coin]);
                    }
                }
                let isSmallAdd = newCoins.length < 20;
                if(isSmallAdd){
                    for(let i = 0; i < newCoins.length; i++){
                        callback(newCoins[i]);
                    }
                }

                // save coin list
                saveListArray(mnCoins);
            }catch(e) {
                console.log('ERROR: masternodes.online', e);
            }
        }
    });
}

const start = () =>{
    setInterval(()=>{
        run();
    },60000 * 5);
    // delay the start slightly
    setTimeout(function(){
        run();
    }, 5000);
};

const newCoinCallback = (cb) =>{
    callback = cb;
};

module.exports.start = start;
module.exports.newCoinCallback = newCoinCallback;

// main call
if (require.main === module) {
    newCoinCallback((coin) =>{
        console.log(`Holy shit! https://masternodes.online added a new coin\n\nName: ${coin.coinName}\nPrice: ${coin.price}\nROI: ${coin.ROI}\nNodes: ${coin.nodes}\nRequired: ${coin.required}\nWorth: ${coin.worth}`)
    });
    setInterval(()=>{
        run();
    },10000);
    run();
}