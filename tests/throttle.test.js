const assert = require('assert');
const { optimizerPath } = require('./helpers/paths');
const { throttle } = require(optimizerPath);

// Helper function to introduce a delay in an async function
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Immediately-invoked async function to run the tests
(async () => {
    // Test case 1: Ensure the function is called only once after the delay
    const calls = [];
    const throttled = throttle((value) => {
        calls.push(value);
    }, 50);

    throttled(1); // Should be called
    throttled(2); // Should be ignored
    await wait(30);
    throttled(3); // Should be ignored
    await wait(70); // Wait period elapses
    throttled(4); // Should be called
    await wait(30);

    assert.deepStrictEqual(calls, [1, 4], 'throttle should invoke the callback only after the wait period elapses');

    // Test case 2: Ensure 'this' context is preserved
    const context = { total: 0 };
    const increment = throttle(function (amount) {
        this.total += amount;
    }, 50);

    // Use .call() to set the context for the throttled function
    increment.call(context, 5);
    await wait(70);
    increment.call(context, 3);
    await wait(30);

    assert.strictEqual(context.total, 8, 'throttle should preserve the original call context');

    console.log('throttle.test.js passed');
})().catch((error) => {
    console.error('Throttle test failed:', error);
    process.exit(1);
});
