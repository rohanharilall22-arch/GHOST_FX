/*
  GHOST_FX EDUCATIONAL ANALYSIS ENGINE

  This engine calculates technical-analysis reference
  information from OHLC candle data.

  It does NOT place trades.
  It does NOT connect to a broker.
  Results are educational and should not be treated
  as financial advice.
*/


// ----------------------------------------
// SIMPLE MOVING AVERAGE
// ----------------------------------------

function movingAverage(values, period) {

  if (values.length < period) {
    return null;
  }

  const recent =
    values.slice(values.length - period);

  const total =
    recent.reduce(
      (sum, value) => sum + value,
      0
    );

  return total / period;
}


// ----------------------------------------
// SUPPORT LEVEL
// ----------------------------------------

function calculateSupport(candles) {

  if (!candles || candles.length === 0) {
    return null;
  }

  const lows =
    candles.map(candle => candle.low);

  return Math.min(...lows);
}


// ----------------------------------------
// RESISTANCE LEVEL
// ----------------------------------------

function calculateResistance(candles) {

  if (!candles || candles.length === 0) {
    return null;
  }

  const highs =
    candles.map(candle => candle.high);

  return Math.max(...highs);
}


// ----------------------------------------
// SECOND SUPPORT
// ----------------------------------------

function calculateSupport2(candles) {

  if (candles.length < 5) {
    return null;
  }

  const sorted =
    candles
      .map(candle => candle.low)
      .sort((a, b) => a - b);

  return sorted[
    Math.floor(sorted.length * 0.25)
  ];
}


// ----------------------------------------
// SECOND RESISTANCE
// ----------------------------------------

function calculateResistance2(candles) {

  if (candles.length < 5) {
    return null;
  }

  const sorted =
    candles
      .map(candle => candle.high)
      .sort((a, b) => b - a);

  return sorted[
    Math.floor(sorted.length * 0.25)
  ];
}


// ----------------------------------------
// TREND
// ----------------------------------------

function calculateTrend(candles) {

  if (candles.length < 20) {

    return {
      score: 50,
      label: "Insufficient data"
    };

  }

  const closes =
    candles.map(
      candle => candle.close
    );

  const shortMA =
    movingAverage(closes, 10);

  const longMA =
    movingAverage(closes, 20);

  if (
    shortMA === null ||
    longMA === null
  ) {

    return {
      score: 50,
      label: "Neutral"
    };

  }

  const difference =
    ((shortMA - longMA) / longMA) * 100;

  let score = 50;

  if (difference > 1) {
    score = 75;
  } else if (difference > 0.3) {
    score = 62;
  } else if (difference < -1) {
    score = 25;
  } else if (difference < -0.3) {
    score = 38;
  }

  let label =
    "Neutral";

  if (score >= 70) {
    label =
      "Stronger upward trend";
  }

  if (
    score >= 55 &&
    score < 70
  ) {
    label =
      "Mild upward trend";
  }

  if (
    score <= 30
  ) {
    label =
      "Stronger downward trend";
  }

  if (
    score > 30 &&
    score < 45
  ) {
    label =
      "Mild downward trend";
  }

  return {
    score: score,
    label: label
  };

}


// ----------------------------------------
// MOMENTUM
// ----------------------------------------

function calculateMomentum(candles) {

  if (candles.length < 10) {

    return {
      score: 50,
      label: "Insufficient data"
    };

  }

  const closes =
    candles.map(
      candle => candle.close
    );

  const current =
    closes[closes.length - 1];

  const previous =
    closes[closes.length - 10];

  const change =
    ((current - previous) / previous) * 100;

  let score =
    50 + change * 10;

  score =
    Math.max(
      0,
      Math.min(100, score)
    );

  let label =
    "Moderate";

  if (score >= 70) {
    label =
      "Strong";
  }

  if (score <= 30) {
    label =
      "Weak";
  }

  return {
    score: Math.round(score),
    label: label
  };

}


// ----------------------------------------
// VOLATILITY
// ----------------------------------------

function calculateVolatility(candles) {

  if (candles.length === 0) {

    return {
      score: 0,
      label: "No data"
    };

  }

  const ranges =
    candles.map(
      candle =>
        (
          (candle.high - candle.low)
          /
          candle.close
        ) * 100
    );

  const averageRange =
    ranges.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / ranges.length;

  let score =
    averageRange * 20;

  score =
    Math.max(
      0,
      Math.min(100, score)
    );

  let label =
    "Low";

  if (score >= 65) {
    label =
      "High";
  } else if (score >= 35) {
    label =
      "Moderate";
  }

  return {
    score: Math.round(score),
    label: label
  };

}


// ----------------------------------------
// COMPLETE ANALYSIS
// ----------------------------------------

function analyzeMarket(candles) {

  if (
    !Array.isArray(candles) ||
    candles.length === 0
  ) {

    return {
      error:
        "No candle data available."
    };

  }


  const support =
    calculateSupport(candles);

  const support2 =
    calculateSupport2(candles);

  const resistance =
    calculateResistance(candles);

  const resistance2 =
    calculateResistance2(candles);

  const trend =
    calculateTrend(candles);

  const momentum =
    calculateMomentum(candles);

  const volatility =
    calculateVolatility(candles);


  let condition =
    "Neutral conditions";


  if (
    trend.score >= 65 &&
    momentum.score >= 60
  ) {

    condition =
      "Upward conditions detected";

  } else if (
    trend.score <= 35 &&
    momentum.score <= 40
  ) {

    condition =
      "Downward conditions detected";

  }


  return {

    support: support,

    support2: support2,

    resistance: resistance,

    resistance2: resistance2,

    trend: trend,

    momentum: momentum,

    volatility: volatility,

    condition: condition,

    educationalNotice:
      "These calculations describe market conditions for educational purposes. They are not guaranteed predictions or personalized trading instructions."

  };

}
