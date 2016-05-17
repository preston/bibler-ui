var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: {
		'main': './src/main.ts',
		'vendor': './src/vendor.ts'
	},
	output: {
		path: "./src/app/scripts",
		filename: "bundle.js"
	},
	plugins: [
    	new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
  	],
	resolve: {
		extensions: ['', '.ts', '.js']
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			},
		],
		noParse: [path.join(__dirname, 'node_modules', 'angular2', 'bundles', 'bower_components')]
	},
	devServer: {
		historyApiFallback: true
	}
};