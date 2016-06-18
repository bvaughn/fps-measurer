export function calculateMean (samples) {
  const total = samples.reduce(
    function (total, x) {
      total += x
      return total
    }, 0)

  return total / samples.length
}

// See http://en.wikipedia.org/wiki/Simple_linear_regression
export function calculateRegressionSlope (xValues, yValues) {
  const xMean = calculateMean(xValues)
  const yMean = calculateMean(yValues)

  let dividendSum = 0
  let divisorSum = 0

  for (let i = 0; i < xValues.length; i++) {
    dividendSum += (xValues[i] - xMean) * (yValues[i] - yMean)
    divisorSum += Math.pow(xValues[i] - xMean, 2)
  }

  return dividendSum / divisorSum
}
