// GHOST_FX MARKET DATA CONNECTOR
// Educational market-data connection only.
// No broker connection or trade execution.

const API_BASE_URL =
    "https://ghost-dmold76gv-rohanharilall22-arch.vercel.app";

const MARKET_SYMBOLS = {
    "XAU/USD": "XAUUSD",
    "EUR/USD": "EURUSD",
    "GBP/USD": "GBPUSD",
    "USD/JPY": "USDJPY"
};

const ALLOWED_INTERVALS = {
    "15m": "15m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d"
};

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

    if (!ALLOWED_INTERVALS[interval]) {
        throw new Error("Unsupported timeframe.");
    }

    const url =
        `${API_BASE_URL}/api/market-data` +
        `?symbol=${encodeURIComponent(providerSymbol)}` +
        `&interval=${encodeURIComponent(interval)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Market data request failed (${response.status}).`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data.candles)) {
        throw new Error("No market candle data was returned.");
    }

    return normalizeCandles(data.candles);
}

window.GHOSTFXMarketData = {
    getMarketData,
    normalizeCandles,
    MARKET_SYMBOLS,
    ALLOWED_INTERVALS
};
