const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        timeline: './js/index.js',
        exampleApp: './js/exampleApp.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'bin')
    },
    devServer: {
        contentBase: path.join(__dirname, 'bin'),
        compress: true,
        port: 9000
    }
};