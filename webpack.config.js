const path = require('path');

module.exports = {
    mode: 'development',
    entry: './js/index.js',
    output: {
        filename: 'timeline.js',
        path: path.join(__dirname, 'bin'),
        library: 'TimelineJs',
        libraryTarget:'window'
    },
    module: {
        rules: [{
            test: /\.less$/,
            use: [{
                loader: 'style-loader' // creates style nodes from JS strings
            }, {
                loader: 'css-loader' // translates CSS into CommonJS
            }, {
                loader: 'less-loader' // compiles Less to CSS
            }]
        }]
    }
};