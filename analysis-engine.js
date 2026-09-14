/*
GHOST_FX EDUCATIONAL ANALYSIS ENGINE

Purpose:
- Analyze OHLC market candles
- Calculate reference support/resistance
- Calculate trend, momentum and volatility
- Receive data from the GHOST_FX market-data connector

This engine does NOT:
- Place trades
- Connect to brokers
- Execute BUY/SELL orders
- Provide personalized financial advice

Educational market analysis only.
*/


// ============================================
// SIMPLE MOVING AVERAGE
// ============================================

function movingAverage(values, period) {

    if (!Array.isArray(values) || values.length < period) {
        return null;
    }

    const recent = values.slice(values.length - period);

    const total = recent.reduce(
        (sum, value) => sum + Number(value),
        0
    );

    return total / period;
}


// ============================================
// SUPPORT
// ============================================

function calculateSupport(candles) {

    if (!candles || candles.length === 0) {
        return null;
    }

    const lows = candles.map(candle => Number(candle.low));

    return Math.min(...lows);
}


// ============================================
// RESISTANCE
// ============================================

function calculateResistance(candles) {

    if (!candles || candles.length === 0) {
        return null;
    }

    const highs = candles.map(candle => Number(candle.high));

    return Math.max(...highs);
}


// ============================================
// SECONDARY SUPPORT
// ============================================

function calculateSupport2(candles) {

    if (!candles || candles.length < 2) {
        return null;
    }

    const sorted = candles
        .map(candle => Number(candle.low))
        .sort((a, b) => a - b);

    return sorted[Math.min(1, sorted.length - 1)];
}


// ============================================
// SECONDARY RESISTANCE
// ============================================

function calculateResistance2(candles) {

    if (!candles || candles.length < 2) {
        return null;
    }

    const sorted = candles
        .map(candle => Number(candle.high))
        .sort((a, b) => b - a);

    return sorted[Math.min(1, sorted.length - 1)];
}


// ============================================
// TREND
// ============================================

function calculateTrend(candles) {

    if (!candles || candles.length < 20) {
        return {
            score: 50,
            label: "Insufficient data — Demo"
        };
    }

    const closes = candles.map(candle => Number(candle.close));

    const shortMA = movingAverage(closes, 10);
    const longMA = movingAverage(closes, 20);

    if (shortMA === null || longMA === null) {
        return {
            score: 50,
            label: "Insufficient data — Demo"
        };
    }

    const difference = ((shortMA - longMA) / longMA) * 100;

    let score = 50;
    let label = "Neutral — Educational";

    if (difference > 0.20) {
        score = 65;
        label = "Upward conditions — Educational";
    } else if (difference < -0.20) {
        score = 35;
        label = "Downward conditions — Educational";
    } else {
        score = 50;
        label = "Neutral conditions — Educational";
    }

    return {
        score,
        label
    };
}


// ============================================
// MOMENTUM
// ============================================

function calculateMomentum(candles) {

    if (!candles || candles.length < 10) {
        return {
            score: 50,
            label: "Insufficient data — Demo"
        };
    }

    const closes = candles.map(candle => Number(candle.close));

    const current = closes[closes.length - 1];
    const previous = closes[closes.length - 10];

    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
        return {
            score: 50,
            label: "Insufficient data — Demo"
        };
    }

    const change = ((current - previous) / previous) * 100;

    let score = 50;
    let label = "Neutral momentum — Educational";

    if (change > 0.30) {
        score = 65;
        label = "Positive momentum — Educational";
    } else if (change < -0.30) {
        score = 35;
        label = "Negative momentum — Educational";
    }

    return {
        score,
        label
    };
}


// ============================================
// VOLATILITY
// ============================================

function calculateVolatility(candles) {

    if (!candles || candles.length === 0) {
        return {
            score: 50,
            label: "Insufficient data — Demo"
        };
    }

    const ranges = candles.map(candle => {

        const high = Number(candle.high);
        const low = Number(candle.low);
        const close = Number(candle.close);

        if (!Number.isFinite(high) ||
            !Number.isFinite(low) ||
            !Number.isFinite(close) ||
            close === 0) {
            return 0;
        }

        return ((high - low) / close) * 100;
    });

    const averageRange =
        ranges.reduce((sum, value) => sum + value, 0)
        / ranges.length;

    let score = Math.min(
        100,
        Math.max(0, averageRange * 100)
    );

    let label = "Moderate volatility — Educational";

    if (score < 30) {
        label = "Lower volatility — Educational";
    }

    if (score > 70) {
        label = "Higher volatility — Educational";
    }

    return {
        score: Math.round(score),
        label
    };
}


// ============================================
// COMPLETE MARKET ANALYSIS
// ============================================

function analyzeMarket(candles) {

    if (!Array.isArray(candles) || candles.length === 0) {

        return {
            status: "No market data",
            educational: true
        };
    }

    const validCandles = candles.filter(candle =>
        Number.isFinite(Number(candle.open)) &&
        Number.isFinite(Number(candle.high)) &&
        Number.isFinite(Number(candle.low)) &&
        Number.isFinite(Number(candle.close))
    );

    if (validCandles.length === 0) {

        return {
            status: "Invalid market data",
            educational: true
        };
    }

    const latest =
        validCandles[validCandles.length - 1];

    const support =
        calculateSupport(validCandles);

    const resistance =
        calculateResistance(validCandles);

    const support2 =
        calculateSupport2(validCandles);

    const resistance2 =
        calculateResistance2(validCandles);

    const trend =
        calculateTrend(validCandles);

    const momentum =
        calculateMomentum(validCandles);

    const volatility =
        calculateVolatility(validCandles);


    return {

        status: "Analysis complete",

        educational: true,

        lastPrice: Number(latest.close),

        support: support,
        support2: support2,

        resistance: resistance,
        resistance2: resistance2,

        trend: trend,

        momentum: momentum,

        volatility: volatility,

        candleCount: validCandles.length,

        disclaimer:
            "Educational market-data analysis only. " +
            "This does not constitute financial advice " +
            "and does not execute trades."
    };
}


// ============================================
// GHOST_FX GLOBAL ENGINE
// ============================================

window.GHOSTFXAnalysisEngine = {

    movingAverage,

    calculateSupport,
    calculateResistance,

    calculateSupport2,
    calculateResistance2,

    calculateTrend,
    calculateMomentum,
    calculateVolatility,

    analyzeMarket
};
