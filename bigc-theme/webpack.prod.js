const { merge } = require('webpack-merge'),
    commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
    devtool: false,
    mode: 'production',
    optimization: {
        emitOnErrors: false,
    },
});
