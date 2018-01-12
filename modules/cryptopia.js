
const request = require('request-json');
const cryptopia = request.createClient(' https://www.cryptopia.co.nz/');

let lastCoins = null;

let callback = (coin) => {
    console.log('Cryptopia added a new coin - ' + coin);
};

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
                lastCoins = coins;
            }

            // check differences
            for(let i in coins){
                //this is a new coin
                if(!lastCoins.includes(coins[i])){
                    callback(coins[i]);
                    // console.log('Cryptopia added a new coin - ' + coins[i]);
                }
            }

            lastCoins = coins;
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
    },60000 * 5);
    run();
}