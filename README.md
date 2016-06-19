# fps-measurer

Tiny testing utility for gathering FPS statistics

Performance testing certain types of things (eg FPS while a user is scrolling) can be tricky.
Manual tests yield highly variable results which in turn makes A/B comparisons unreliable.
This utility allows you to create simple, async test cases that can be run until a confidence interval is reached (aka a reliable FPS measurement has been taken).

### Installation
Using Npm:
```
npm install --save-dev fps-measurer
```
UMD build:
```html
<script src="https://npmcdn.com/fps-measurer/dist/umd/fps-measurer.js"></script>
```
### Usage
Here is a basic example of how you can structure your tests:

```js
import { TestRunner } from './TestRunner'

function yourTestCase (callback) {
  // Your test case goes here...
  // When it's done, invoke callback()
  // You can also return a Promise instead if you prefer that syntax
}

const testRunner = new TestRunner(yourTestCase)

// Will run until an acceptable confidence interval has been established.
// You can pass this function a callback (to be called on complete)
// Or you can await its returned Promise for completion
const data = await testRunner.start()
data.duration // mean duration across all runs
data.framerate // mean framerate across all runs
```

### TestRunner API

##### `constructor(testCase: Function, { maxSampleSize: number, minSampleSize: number })`
The only required arugment for instantiating a `TestRunner` is a test case.
Your test case can accept a callback _or_ it can return a Promise to indicate completion.
Optionally you may pass a configuration object to override the default min and max sample size (min = 5, max = 10 by default).

##### `isRunning(): boolean`
Tests are currently running.

##### `start(completeCallback: ?Function): Promise`
Start tests.
You can pass a callback (to be executed on completion, and passed a `data` object) or youc an listen for the returned Promise.
Calling this method when tests are already running will return a rejected Promise.

##### `stop`
Stops a running test.
This method will error if tests are not running.
