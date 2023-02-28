# AlienFi API

The AlienFi API is a set of endpoints used by market aggregators (e.g. coinmarketcap.com) to surface AlienFi liquidity
and volume information. All information is fetched from the underlying subgraphs.

The API is designed around the [CoinMarketCap document](https://docs.google.com/document/d/1S4urpzUnO2t7DmS_1dc4EL4tgnnbTObPYXvDeBnukCg) and [CoinGecko document](https://docs.google.com/document/d/1v27QFoQq1SKT3Priq3aqPgB70Xd_PnDzbOCiuoCyixw/edit#).

AlienFi DEX subgraph playground: https://api.thegraph.com/subgraphs/name/alienfi/alien-exchange1

# AlienFi Endpoints

All AlienFi pairs consist of two different tokens. ETH is not a native currency in AlienFi, and is represented
only by WETH in the pairs.

The canonical WETH address used by the AlienFi interface is `0x82af49447d8a07e3bd95bd0d56f35241523fbab1`.

## [`/summary`](https://alien-info-api.vercel.app/api/v2/summary)

Returns data for the top ~1000 AlienFi pairs, sorted by reserves.
Results are edge cached for 15 minutes.

### Request

`GET https://alien-info-api.vercel.app/api/v2/summary`

### Response

```json5
{
  "0x..._0x...": {                  // the asset ids of the BEP20 tokens (i.e. token addresses), joined by an underscore
    "last_price": "1.234",          // denominated in token0/token1
    "base_volume": "123.456",       // last 24h volume denominated in token0
    "quote_volume": "1234.56",       // last 24h volume denominated in token1
    "pair_liquidity": "1234.56",     // Pair liquidity in USD
    trading_pairs:"token0Symbol_token1Symbol"
  },
  // ...
}
```

## [`/totalliquidity`](https://alien-info-api.vercel.app/api/v2/totalliquidity)

Returns the total liquidity in USD value on AlienFi.
Results are edge cached for 24 hours.

### Request

`GET https://alien-info-api.vercel.app/api/v2/totalliquidity`

### Response

```json5
{
  data: {
    totalLiquidityUSD: '...' // Total liquidity in USD
  }
}
```

## [`/stats`](https://alien-info-api.vercel.app/api/v2/totalliquidity)

Returns the statistics value on AlienFi.
Results are edge cached for 24 hours.

### Request

`GET https://alien-info-api.vercel.app/api/v2/stats`

### Response

```json5
{
  data: {
    totalLiquidityUSD: '8978873.630992191924082507836841046',
    totalVolumeUSD: '168455544.4636947032547389604771717',
    totalVolumeETH: '390074.1061147667642290158462536124',
    untrackedVolumeUSD: '1192888416.538407463765017781932275',
    totalLiquidityETH: '32025.75027367803725084151221779494',
    totalPairs: 121,
  }
}
```

## [`/assets`](https://alien-info-api.vercel.app/api/v2/assets)

Returns the tokens in the top ~1000 pairs on AlienFi, sorted by reserves.
Results are edge cached for 24 hours.

### Request

`GET https://alien-info-api.vercel.app/api/v2/assets`

### Response

```json5
{
  // ...,
  '0x...': {
    name: '...', // not necesssarily included for BEP20 tokens
    symbol: '...', // not necesssarily included for BEP20 tokens
    id: '0x...', // the address of the BEP20 token
    maker_fee: '0', // always 0
    taker_fee: '0.002', // always 0.002 i.e. .2%
    price_eth:"...",
    price_usd:"...",
  }
  // ...
}
```

## `/assets/:token_address`
Returns the single token asset

### Request

`GET https://alien-info-api.vercel.app/api/v2/assets/:token_address`

### Response

```json5
{
  "updated_at": "....",
  // ...,
  'data': {
    name: '...', // not necesssarily included for BEP20 tokens
    symbol: '...', // not necesssarily included for BEP20 tokens
    id: '0x...', // the address of the BEP20 token
    maker_fee: '0', // always 0
    taker_fee: '0.002' // always 0.002 i.e. .2%
    price_usd:"...",
    price_eth:"...",
  }
  // ...
}
```
## [`/tickers`](https://alien-info-api.vercel.app/api/v2/tickers)

Returns data for the top ~1000 AlienFi pairs, sorted by reserves.
Results are edge cached for 1 minute.

### Request

`GET https://alien-info-api.vercel.app/api/v2/tickers`

### Response

```json5
{
  '0x..._0x...': {
    // the asset ids of ETH and BEP20 tokens, joined by an underscore
    base_name: '...', // token0 name
    base_symbol: '...', // token0 symbol
    base_id: '0x...', // token0 address
    quote_name: '...', // token1 name
    quote_symbol: '...', // token1 symbol
    quote_id: '0x...', // token1 address
    last_price: '1.234', // the mid price as token1/token0
    base_volume: '123.456', // denominated in token0
    quote_volume: '1234.56' // denominated in token1
  }
  // ...
}
```

## `/orderbook/:pair`

Returns simulated orderbook data for the given AlienFi pair.
Since AlienFi has a continuous orderbook, fixed amounts in an interval are chosen for bids and asks,
and prices are derived from the AlienFi formula (accounting for both slippage and fees paid to LPs).
Results are edge cached for 15 minutes.

### Request

`GET https://alien-info-api.vercel.app/api/v2/orderbook/:pair`

### URL Parameters

- `pair`: The asset ids of two BEP20 tokens, joined by an underscore, e.g. `0x..._0x...`. The first token address is considered the base in the response.

### Response

```json5
{
  timestamp: 1234567, // UNIX timestamp of the response
  bids: [
    ['12', '1.2'], // denominated in base token, quote token/base token
    ['12', '1.1'] // denominated in base token, quote token/base token
    // ...
  ],
  asks: [
    ['12', '1.3'], // denominated in base token, quote token/base token
    ['12', '1.4'] // denominated in base token, quote token/base token
    // ...
  ]
}
```

## `/trades/:pair`

Returns all swaps in the last 24 hours for the given AlienFi pair.
Results are edge cached for 15 minutes.

The pair address is the address of the two tokens in either order.
The first address is considered the base in the response.

Note because AlienFi supports flash swaps and borrowing of both tokens in a pair, you may wish to exclude these
trade types (types `"???"` and `"borrow-both"`).

### URL Parameters

- `pair`: The asset ids of two BEP20 tokens, joined by an underscore, e.g. `0x..._0x...`. The first token address is considered the base in the response.

### Request

`GET https://alien-info-api.vercel.app/api/v2/trades/:pair`

### Response

```json5
[
  {
    trade_id: '...',
    price: '1.234', // denominated in quote token/base token
    base_volume: '123.456', // denominated in base token
    quote_volume: '1234.56', // denominated in quote token
    trade_timestamp: 1234567, // UNIX timestamp
    type: 'buy' // "buy"/"sell"/"borrow-both"/"???"
  }
  // ...
]
```
