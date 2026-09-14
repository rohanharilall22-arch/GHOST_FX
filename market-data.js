// GHOST_FX Market Data Connector
// Educational market-data connection only.
// No trade execution or broker connection.

const MARKET_SYMBOLS = {
    "XAU/USD": "XAUUSD",
    "EUR/USD": "EURUSD",
    "GBP/USD": "GBPUSD",
    "USD/JPY": "USDJPY"
};

/*
  This function is designed to receive OHLC candle data
  from a secure backend/data provider.

  IMPORTANT:
  Never put a private API key inside this GitHub frontend.
*/

function normalizeCandles(rawCandles) {
    if (!Array.isArray(rawCandles)) {
        return [];
    }

    return rawCandles
        .map(candle => ({
            time: Number(candle.time),
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close)
        }))
        .filter(candle =>
            Number.isFinite(candle.time) &&
            Number.isFinite(candle.open) &&
            Number.isFinite(candle.high) &&
            Number.isFinite(candle.low) &&
            Number.isFinite(candle.close)
        );
}

async function getMarketData(symbol, interval = "1h") {
    const providerSymbol = MARKET_SYMBOLS[symbol];

    if (!providerSymbol) {
        throw new Error("Unsupported market symbol.");
    }

    /*
      The dashboard will eventually call your secure backend here.

      Example:
      /api/market-data?symbol=XAUUSD&interval=1h

      The API key stays on the backend.
    */

    const url =
        `/api/market-data?symbol=${encodeURIComponent(providerSymbol)}` +
        `&interval=${encodeURIComponent(interval)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Market-data server unavailable.");
    }

    const data = await response.json();

    return normalizeCandles(data.candles);
}


// Make the connector available to dashboard.html
window.GHOSTFXMarketData = {
    getMarketData,
    normalizeCandles,
    MARKET_SYMBOLS
};
