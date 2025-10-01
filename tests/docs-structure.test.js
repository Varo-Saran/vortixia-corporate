const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Import the updated paths
const { rootDir, optimizerPath } = require('./helpers/paths');

// Verify that the root directory and key files exist
assert.ok(fs.existsSync(rootDir) && fs.statSync(rootDir).isDirectory(), 'Project root directory is missing');
assert.ok(fs.existsSync(path.join(rootDir, 'index.html')), 'index.html is missing from the root directory');
assert.ok(fs.existsSync(optimizerPath), 'performance-optimizer.js script is missing from assets/js');

// Define the required assets within the correct structure
const requiredAssets = [
    path.join(rootDir, 'assets', 'css', 'style.css'),
    path.join(rootDir, 'assets', 'css', 'responsive.css'),
    path.join(rootDir, 'assets', 'js', 'script.js'),
    path.join(rootDir, 'assets', 'images')
];

// Check each required asset to ensure it exists
requiredAssets.forEach((assetPath) => {
    assert.ok(fs.existsSync(assetPath), `${path.basename(assetPath)} is missing`);
    const stats = fs.statSync(assetPath);
    if (path.extname(assetPath) === '') {
        assert.ok(stats.isDirectory(), `${path.basename(assetPath)} should be a directory`);
    } else {
        assert.ok(stats.isFile(), `${path.basename(assetPath)} should be a file`);
    }
});

// Verify that the throttle function can be imported from the optimizer script
const { throttle } = require(optimizerPath);
assert.strictEqual(typeof throttle, 'function', 'throttle export should be available for tests');

console.log('docs-structure.test.js passed');
