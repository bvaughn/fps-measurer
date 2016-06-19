import raf from 'raf'

/** Measures framerate for the time between start() and stop() calls */
export class FramerateMeasurer {
  constructor () {
    this._frames = 0

    this._loop = this._loop.bind(this)
  }

  start () {
    this._beginTime = this._getTime()
    this._frames = 0
    this._animationFrameId = raf(this._loop)
  }

  stop () {
    const endTime = this._getTime()

    if (this._animationFrameId) {
      raf.cancel(this._animationFrameId)
    }

    const duration = (endTime - this._beginTime) / 1000
    const framerate = (this._frames * 1000) / (endTime - this._beginTime)

    return {
      duration,
      framerate,
      frames: this._frames
    }
  }

  _getTime () {
    if (typeof performance !== 'undefined') {
      return performance.now()
    } else {
      return Date.now()
    }
  }

  _loop () {
    this._frames++
    this._animationFrameId = raf(this._loop)
  }
}
