const path = require('path');

// Set the root directory to the main project folder
const rootDir = path.join(__dirname, '..', '..');

// The 'docs' directory is no longer a separate build target in this context,
// so we will use the root directory for pathing.
const docsDir = rootDir;

// Update the optimizer path to reflect its location in the 'assets' folder
const optimizerPath = path.join(docsDir, 'assets', 'js', 'performance-optimizer.js');

module.exports = {
    rootDir,
    docsDir,
    optimizerPath,
};
