
const path = require('path');

const sourcePath = path.join(__dirname, './demo');
const destPath = path.join(__dirname, './dist');

let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './demo/index.ts',
	output: {
		filename: 'bundle.js',
		path: destPath
	},
	module: {
		loaders: [
			{
				test: /\.html/,
				loader: 'html-loader'
			}
		],
		rules: [
			{
				//html gets loaded into javascript land
				test: /\.(html|ejs)$/,
				exclude: /node_modules/,
				loader: 'html-loader',
				options: {
					root: sourcePath,
					// https://github.com/webpack-contrib/html-loader/issues/67
					// https://www.npmjs.com/package/html-minifier
					removeAttributeQuotes: false,
					keepClosingSlash: true,
					caseSensitive: true
				}
			},
			{
				//hash images for caching, skip favicons
				test: /\.(png|svg|jpg|gif|ico|pdf|woff2?|ttf|eot|js)$/,
				exclude: /(node_modules|favicons)/,
				loader: 'file-loader',
				options: {
					name: '[path][name]-[hash].[ext]',
				}
			},
			{
				//typescript
				test: /\.(ts|d\.ts)$/,
				loader: 'awesome-typescript-loader'
			}
		],
	},
	resolve: {
		extensions: [ '.ts', '.tsx', ".js", ".json"]
	},
	devServer: {
		host: '0.0.0.0',
		contentBase: './demo',
		historyApiFallback: true,
		port: 9003,
		compress: false,
		inline: true,
		hot: true,
		stats: {
			assets: true,
			children: false,
			chunks: false,
			hash: false,
			modules: false,
			publicPath: false,
			timings: true,
			version: false,
			warnings: true,
			colors: {
				green: '\u001b[32m',
			}
		},
	},
	plugins: [new HtmlWebpackPlugin({
		title: "Typr.js -> Typr.ts conversion",
		template: path.join(sourcePath, '/index.html')
	})]
};