# fps-measurer

Tiny testing utility for gathering FPS statistics

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
