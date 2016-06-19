import test from 'ava'
import { TestRunner } from './TestRunner'

function createSpy ({
  resolve = true,
  value = 1
} = {}) {
  const spy = async function spy () {
    spy.called = true
    spy.callCount++

    if (resolve) {
      return value
    } else {
      throw Error('Error')
    }
  }

  spy.called = false
  spy.callCount = 0

  return spy
}

test('TestRunner should run the provided test case', async (t) => {
  t.plan(2)
  const testCaseCallback = createSpy()
  const testRunner = new TestRunner(testCaseCallback)
  t.falsy(testCaseCallback.called, 'Test case should not be called before TestRunner has been started')
  await testRunner.start()
  t.truthy(testCaseCallback.called, 'Test case should be called once TestRunner has been started')
})

test('TestRunner should reject the Promise returned by start() if the test case fails', async (t) => {
  t.plan(1)
  const testRunner = new TestRunner(createSpy({ resolve: false }))
  t.throws(testRunner.start)
})

test('TestRunner should resolve the Promise returned by start() once the test cases complete', async (t) => {
  t.plan(1)
  const testCaseCallback = createSpy({
    value: 1
  })
  const testRunner = new TestRunner(testCaseCallback)
  const value = await testRunner.start()
  t.truthy(value)
})

test('TestRunner should return a rejected Promise if it is already running', async (t) => {
  t.plan(1)
  const testCaseCallback = createSpy()
  const testRunner = new TestRunner(testCaseCallback)
  t.throws(testRunner.start)
})

test('TestRunner should invoke the callback supplied to start() once the test cases complete', async (t) => {
  t.plan(2)
  const completedCallback = createSpy()
  const testCaseCallback = createSpy()
  const testRunner = new TestRunner(testCaseCallback)
  t.falsy(completedCallback.called)
  await testRunner.start(completedCallback)
  t.truthy(completedCallback.called)
})

test('TestRunner should honor :maxSampleSize option', async (t) => {
  t.plan(2)
  const testCaseCallback = createSpy()
  const testRunner = new TestRunner(testCaseCallback, { maxSampleSize: 3 })
  t.truthy(testCaseCallback.callCount === 0)
  await testRunner.start()
  t.truthy(testCaseCallback.callCount === 3)
})

test('TestRunner should honor :minSampleSize option', async (t) => {
  t.plan(2)
  const testCaseCallback = createSpy()
  const testRunner = new TestRunner(testCaseCallback, { maxSampleSize: 5 })
  t.truthy(testCaseCallback.callCount === 0)
  console.log('starting ...')
  await testRunner.start()
  console.log('completed:', testCaseCallback)
  console.log('testCaseCallback.callCount:', testCaseCallback.callCount)
  t.truthy(testCaseCallback.callCount === 5)
})
