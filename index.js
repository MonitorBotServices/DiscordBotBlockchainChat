const Discord = require('discord.js');
const config = require('./config.json');
const request = require('request-json');
const numeral = require('numeral');
const coinMarketCap = request.createClient(' https://api.coinmarketcap.com/');
let coinPrices = [];

let discordClient;

const cryptopia = require('./modules/cryptopia');


process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });

/**
 * Coin Prices
 */

setInterval(() => {
    updateCoinPrices();
}, 60000);

updateCoinPrices();
cryptopia.start();

function updateCoinPrices() {
    coinMarketCap.get('/v1/ticker/?limit=0', function (err, res, body) {
        coinPrices = body;
    });
    /*
    [ { id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    rank: '1',
    price_usd: '15531.5',
    price_btc: '1.0',
    '24h_volume_usd': '17078200000.0',
    market_cap_usd: '260605368225',
    available_supply: '16779150.0',
    total_supply: '16779150.0',
    max_supply: '21000000.0',
    percent_change_1h: '0.56',
    percent_change_24h: '14.75',
    percent_change_7d: '-5.53',
    last_updated: '1514965760' },
  { id: 'ripple',....
     */
}


function getPriceText(symbol) {
    let success = false;
    for (let i = 0; i < coinPrices.length; i++) {
        if (
            coinPrices[i].id.toLowerCase() === symbol.toLowerCase() ||
            coinPrices[i].name.toLowerCase() === symbol.toLowerCase() ||
            coinPrices[i].symbol.toLowerCase() === symbol.toLowerCase()
        ) {
            success = true;
            return `\n${coinPrices[i].name} (${coinPrices[i].symbol})\nUSD = $${numeral(coinPrices[i].price_usd).format('0,0.00')}\nBTC = ${numeral(coinPrices[i].price_btc).format('0.00000000')}\n1hr = ${coinPrices[i].percent_change_1h}%\n24hr = ${coinPrices[i].percent_change_24h}%\n7d = ${coinPrices[i].percent_change_7d}%`

        }
    }
    if (!success) {
        return 'I could not find the price for that ticker or coin. I get my prices from CoinMarketCap. Check there to see if your coin is listed.'
    }
}

/**
 * Bot
 */

reconnect();
function reconnect(){
    discordClient  = new Discord.Client()
    discordClient.on('ready', () => {
        console.log('I am ready!');
        discordClient.user.setPresence({ game: { name: 'BlockchainChat.io', type: 0 } });

        // set cryptopia callback
        cryptopia.newCoinCallback((coin) => {
            // discordClient.channels.get('398014885197250561').send(`${coin} is now on Cryptopia`); // bot-test
            discordClient.channels.get('397944017020649473').send(`${coin} is now on Cryptopia`); // trading
           console.log(`${coin} is now on Cryptopia`);
        });
    });

    discordClient.on('message', message => {
        // query ticker with ?
        if (message.content.startsWith("?")) {
            const ticker = message.content.slice(1);
            message.reply(getPriceText(ticker));

        }

        // replace binance links
        if(message.content.includes('binance.com/?ref=') && message.author.username !== 'BlockchainBot'){
            //replace referral with mine, fuck those guys
            let edited = message.content.replace(/binance\.com\/\?ref=\d*/g, "binance.com/?ref=13619255");
            message.delete()
                .then(msg => console.log(`Deleted message from ${msg.author} for referral link`))
                .catch(console.error);

            message.reply(`No referral links!! Next time, you get the ban hammer.\n\nOffending message:\n${edited}`);
        }
    });

    discordClient.on('error', err =>{
        console.log('ERR: ', err);
        console.log("Reconnecting to Discord in 5 seconds");
        setTimeout(()=>{
            discordClient.logOut((err) => {
                console.log(err);
                reconnect();
            });
        },5000);
    });

    discordClient.on('disconnect', disconnect =>{
        console.log('DISCONNECT: ', disconnect);
        console.log("Reconnecting to Discord in 5 seconds");
        setTimeout(()=>{
            discordClient.logOut((err) => {
                console.log(err);
                reconnect();
            });
        },5000);
    });

    discordClient.login(config.token);

}


/*
Message {
  channel:
   TextChannel {
     type: 'text',
     id: '398014885197250561',
     name: 'bot-test',
     position: 8,
     permissionOverwrites:
      Collection {
        '397936074657234944' => [Object],
        '397939638683041794' => [Object] },
     topic: null,
     nsfw: false,
     lastMessageID: '398015825346297858',
     guild:
      Guild {
        members: [Object],
        channels: [Object],
        roles: [Object],
        presences: [Object],
        available: true,
        id: '397936074657234944',
        name: 'Blockchain Chat',
        icon: 'ff66954d328a4466c0c6f771c7c66117',
        splash: null,
        region: 'us-south',
        memberCount: 4,
        large: false,
        features: [],
        applicationID: null,
        afkTimeout: 300,
        afkChannelID: null,
        systemChannelID: '397936074657234947',
        embedEnabled: undefined,
        verificationLevel: 2,
        explicitContentFilter: 0,
        joinedTimestamp: 1514963750456,
        ownerID: '210800518883311618',
        _rawVoiceStates: Collection {},
        emojis: Collection {} },
     messages: Collection { '398015825346297858' => [Circular] },
     _typing: Map { '210800518883311618' => [Object] },
     lastMessage: [Circular] },
  id: '398015825346297858',
  type: 'DEFAULT',
  content: 'test',
  author:
   User {
     id: '210800518883311618',
     username: 'jaret',
     discriminator: '7196',
     avatar: 'be73b23831ded9ce84321dfa7e3084fd',
     bot: false,
     lastMessageID: '398015825346297858',
     lastMessage: [Circular] },
  member:
   GuildMember {
     guild:
      Guild {
        members: [Object],
        channels: [Object],
        roles: [Object],
        presences: [Object],
        available: true,
        id: '397936074657234944',
        name: 'Blockchain Chat',
        icon: 'ff66954d328a4466c0c6f771c7c66117',
        splash: null,
        region: 'us-south',
        memberCount: 4,
        large: false,
        features: [],
        applicationID: null,
        afkTimeout: 300,
        afkChannelID: null,
        systemChannelID: '397936074657234947',
        embedEnabled: undefined,
        verificationLevel: 2,
        explicitContentFilter: 0,
        joinedTimestamp: 1514963750456,
        ownerID: '210800518883311618',
        _rawVoiceStates: Collection {},
        emojis: Collection {} },
     user:
      User {
        id: '210800518883311618',
        username: 'jaret',
        discriminator: '7196',
        avatar: 'be73b23831ded9ce84321dfa7e3084fd',
        bot: false,
        lastMessageID: '398015825346297858',
        lastMessage: [Circular] },
     _roles: [ '397939638683041794', '397944938064773132' ],
     serverDeaf: false,
     serverMute: false,
     selfMute: undefined,
     selfDeaf: undefined,
     voiceSessionID: undefined,
     voiceChannelID: undefined,
     speaking: false,
     nickname: null,
     joinedTimestamp: 1514945753571,
     lastMessageID: '398015825346297858',
     lastMessage: [Circular] },
  pinned: false,
  tts: false,
  nonce: '398015825358880768',
  system: false,
  embeds: [],
  attachments: Collection {},
  createdTimestamp: 1514964767539,
  editedTimestamp: null,
  reactions: Collection {},
  mentions:
   MessageMentions {
     everyone: false,
     users: Collection {},
     roles: Collection {},
     _content: 'test',
     _client:
      Client {
        domain: null,
        _events: [Object],
        _eventsCount: 4,
        _maxListeners: 10,
        options: [Object],
        rest: [Object],
        dataManager: [Object],
        manager: [Object],
        ws: [Object],
        resolver: [Object],
        actions: [Object],
        voice: [Object],
        shard: null,
        users: [Object],
        guilds: [Object],
        channels: [Object],
        presences: Collection {},
        user: [Object],
        readyAt: 2018-01-03T07:31:28.829Z,
        broadcasts: [],
        pings: [Array],
        _timeouts: [Object],
        _intervals: [Object] },
     _guild:
      Guild {
        members: [Object],
        channels: [Object],
        roles: [Object],
        presences: [Object],
        available: true,
        id: '397936074657234944',
        name: 'Blockchain Chat',
        icon: 'ff66954d328a4466c0c6f771c7c66117',
        splash: null,
        region: 'us-south',
        memberCount: 4,
        large: false,
        features: [],
        applicationID: null,
        afkTimeout: 300,
        afkChannelID: null,
        systemChannelID: '397936074657234947',
        embedEnabled: undefined,
        verificationLevel: 2,
        explicitContentFilter: 0,
        joinedTimestamp: 1514963750456,
        ownerID: '210800518883311618',
        _rawVoiceStates: Collection {},
        emojis: Collection {} },
     _members: null,
     _channels: null },
  webhookID: null,
  hit: null,
  _edits: [] }
 */