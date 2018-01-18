
const request = require('request-json');
const cryptopia = request.createClient(' https://www.cryptopia.co.nz/');
const helpers = require('./helpers');

let lastCoins = null;

let callback = (coin) => {
    console.log('Cryptopia added a new coin - ' + coin);
};


function addCoins(newCoins){
    let arr;
    // if is first run
    if(lastCoins === null){
        arr = [];
    } else {
        arr = lastCoins;
    }
    for(let i =0; i < newCoins.length; i++){
        if(!arr.includes(helpers.normalize(newCoins[i]))){
            arr.push(helpers.normalize(newCoins[i]));
        }
    }
    lastCoins = arr;
}
function run(){
    console.log('Checking Cryptopia for new coins');
    cryptopia.get('api/GetCurrencies', function(err, res, body) {
        try{
            let coins = [];
            for(let key in body.Data){
                coins.push(`${body.Data[key].Name} (${body.Data[key].Symbol})`);
            }

            // first run
            if(lastCoins === null){
                addCoins(coins);
            }

            // test add coin
            // coins.push('Tiger (TGR)');

            // check differences
            let newCoins = [];
            for(let i in coins){
                //this is a new coin
                if(!lastCoins.includes(helpers.normalize(coins[i]))){
                    newCoins.push(coins[i]);
                    // console.log('Cryptopia added a new coin - ' + coins[i]);
                }
            }

            // only make callback if newcoins is not a huge number
            let isSmallAdd = newCoins.length < 20;
            if(isSmallAdd){
                for(let i = 0; i < newCoins.length; i++){
                    callback(newCoins[i]);
                }
            }

            addCoins(coins)
        } catch(e) {
            // console.log(e)
        }

    });
}
const start = () =>{
    setInterval(()=>{
        run();
    },60000 * 5);
    run();
};

const newCoinCallback = (cb) =>{
    callback = cb;
};

module.exports.start = start;
module.exports.newCoinCallback = newCoinCallback;

// main call
if (require.main === module) {
    newCoinCallback((coin) =>{
        console.log('Holy shit, Cryptopia added '+ coin);
    });
    setInterval(()=>{
        run();
    },10000);
    run();
}