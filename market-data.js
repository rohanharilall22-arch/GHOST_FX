// GHOST_FX MARKET DATA CONNECTOR
// Educational market-data connection only.
// No broker connection or trade execution.

const API_BASE_URL =
    "https://ghost-goblsyo1k-rohanharilall22-arch.vercel.app";

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
    const providerInterval = ALLOWED_INTERVALS[interval];

    if (!providerSymbol) {
        throw new Error("Unsupported market symbol.");
    }

    if (!providerInterval) {
        throw new Error("Unsupported timeframe.");
    }

    const url =
        `${API_BASE_URL}/api/market-data` +
        `?symbol=${encodeURIComponent(providerSymbol)}` +
        `&interval=${encodeURIComponent(providerInterval)}`;

    try {
        const response = await fetch(url);

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "Market-data server returned an invalid response."
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.error || "Market-data server unavailable."
            );
        }

        return normalizeCandles(data.candles);

    } catch (error) {
        console.error("GHOST_FX market-data error:", error);
        throw error;
    }
}

window.GHOSTFXMarketData = {
    getMarketData,
    normalizeCandles,
    MARKET_SYMBOLS,
    ALLOWED_INTERVALS
};
