import { FramerateMeasurer } from './FramerateMeasurer'
import { calculateMean, calculateRegressionSlope } from './Statistics'

/** Runs an async test and measures its framerate until a confidence interval is achieved */
export class TestRunner {
  constructor (testCase, options = {}) {
    const {
      maxSampleSize = 10,
      minSampleSize = 5
    } = options

    this._testCase = testCase
    this._maxSampleSize = maxSampleSize
    this._minSampleSize = minSampleSize

    this._framerateMeasurer = new FramerateMeasurer()

    this._onTestComplete = this._onTestComplete.bind(this)
  }

  start () {
    this.isRunning = true
    this._durations = []
    this._framerates = []

    this._runTest()
  }

  stop () {
    this.isRunning = false

    const duration = calculateMean(this._durations)
    const framerate = calculateMean(this._framerates)

    console.group('TestRunner: complete')
    console.log(`${this._framerates.length} measurements`)
    console.log(`mean framerate: ${this._format(framerate)} fps`)
    console.log(`mean duration: ${this._format(duration)} seconds`)
    console.groupEnd()

    return {
      duration,
      framerate
    }
  }

  _format (number) {
    return Math.round(number * 100) / 100
  }

  _getTestConfidence () {
    const sampleCount = this._framerates.length

    if (sampleCount >= this._maxSampleSize) {
      return true
    } else if (sampleCount >= this._minSampleSize) {
      const indices = this._framerates.map(
        function (framerate, index) {
          return index
        }
      )

      return calculateRegressionSlope(indices, this._framerates) >= 0
    } else {
      return false
    }
  }

  _onTestComplete () {
    if (!this.isRunning) {
      return
    }

    const measurements = this._framerateMeasurer.stop()

    console.group(`TestRunner: test ${this._framerates.length}`)
    console.log(`framerate: ${this._format(measurements.framerate)} fps`)
    console.log(`duration: ${this._format(measurements.duration)} seconds`)
    console.groupEnd()

    this._durations.push(measurements.duration)
    this._framerates.push(measurements.framerate)

    const isConfident = this._getTestConfidence(this._framerates, this._minSampleSize)

    if (isConfident) {
      this.stop()
    } else {
      this._runTest()
    }
  }

  _runTest () {
    this._framerateMeasurer.start()
    this._testCase(this._onTestComplete)
  }
}
