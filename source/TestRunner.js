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

  isRunning () {
    return !!this._resolvePromise
  }

  start (completeCallback) {
    if (this.isRunning()) {
      return Promise.reject('Already running')
    }

    this._completeCallback = completeCallback
    this._durations = []
    this._framerates = []

    return new Promise((resolve, reject) => {
      this._rejectPromise = reject
      this._resolvePromise = resolve
      this._runTest()
    })
  }

  stop () {
    if (!this.isRunning()) {
      throw Error('Not running')
    }

    this._rejectPromise = null
    this._resolvePromise = null

    return this._getCompletedData()
  }

  _format (number) {
    return Math.round(number * 100) / 100
  }

  _getCompletedData () {
    const duration = calculateMean(this._durations)
    const framerate = calculateMean(this._framerates)

    console.log('TestRunner: complete')
    console.log(`• ${this._framerates.length} measurements`)
    console.log(`• mean framerate: ${this._format(framerate)} fps`)
    console.log(`• mean duration: ${this._format(duration)} seconds`)

    return {
      duration,
      framerate
    }
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
    if (!this.isRunning()) {
      return
    }

    const measurements = this._framerateMeasurer.stop()

    console.log(`TestRunner: test ${this._framerates.length}`)
    console.log(`• framerate: ${this._format(measurements.framerate)} fps`)
    console.log(`• duration: ${this._format(measurements.duration)} seconds`)

    this._durations.push(measurements.duration)
    this._framerates.push(measurements.framerate)

    const isConfident = this._getTestConfidence(this._framerates, this._minSampleSize)

    if (isConfident) {
      const data = this._getCompletedData()

      if (this._completeCallback) {
        this._completeCallback(data)
        this._completeCallback = null
      }

      this._resolvePromise(data)

      this._rejectPromise = null
      this._resolvePromise = null
    } else {
      this._runTest()
    }
  }

  _onTestError (error) {
    this._rejectPromise(error)

    this._rejectPromise = null
    this._resolvePromise = null
  }

  _runTest () {
    this._framerateMeasurer.start()

    // Assume the test case accepts a callback...
    const promise = this._testCase(this._onTestComplete)

    // ...unless it returns a Promise
    if (promise instanceof Promise) {
      promise
        .then(this._onTestComplete)
        .catch(this._onTestError)
    }
  }
}
