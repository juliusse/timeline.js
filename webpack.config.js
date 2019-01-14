const path = require('path');

module.exports = {
    mode: 'development',
    entry: './js/index.js',
    output: {
        filename: 'timeline.js',
        path: path.join(__dirname, 'bin'),
        library: 'TimelineJs',
        libraryTarget:'window'
    }
};