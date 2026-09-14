// GHOST_FX MARKET DATA BACKEND
// Educational market-data service only.
// No broker connection or trade execution.

const ALLOWED_SYMBOLS = {
    XAUUSD: "XAU/USD",
    EURUSD: "EUR/USD",
    GBPUSD: "GBP/USD",
    USDJPY: "USD/JPY"
};

const ALLOWED_INTERVALS = {
    "15m": "15min",
    "1h": "1h",
    "4h": "4h",
    "1d": "1day"
};

export default async function handler(req, res) {

    // Allow the GHOST_FX GitHub Pages frontend
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://rohanharilall22-arch.github.io"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const symbol = String(req.query.symbol || "XAUUSD");
    const interval = String(req.query.interval || "1h");

    const providerSymbol = ALLOWED_SYMBOLS[symbol];
    const providerInterval = ALLOWED_INTERVALS[interval];

    if (!providerSymbol || !providerInterval) {
        return res.status(400).json({
            error: "Unsupported market or interval."
        });
    }

    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "Market-data API key is not configured on the server."
        });
    }

    const url = new URL(
        "https://api.twelvedata.com/time_series"
    );

    url.searchParams.set(
        "symbol",
        providerSymbol
    );

    url.searchParams.set(
        "interval",
        providerInterval
    );

    url.searchParams.set(
        "outputsize",
        "100"
    );

    try {

        const response = await fetch(url, {
            headers: {
                "Authorization": `apikey ${apiKey}`
            }
        });

        const data = await response.json();

        if (!response.ok || data.status === "error") {
            return res.status(
                response.status || 502
            ).json({
                error: "Market-data provider returned an error."
            });
        }

        const candles = Array.isArray(data.values)
            ? data.values
                .map(candle => ({
                    time: Math.floor(
                        new Date(candle.datetime).getTime() / 1000
                    ),
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
                )
                .reverse()
            : [];

        return res.status(200).json({
            symbol: providerSymbol,
            interval: providerInterval,
            candles,
            educational: true,
            message:
                "Market data for educational analysis only."
        });

    } catch (error) {

        return res.status(500).json({
            error: "Unable to retrieve market data."
        });
    }
}
