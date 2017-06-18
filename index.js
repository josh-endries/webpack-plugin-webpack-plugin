class WebpackPluginWebpackPlugin {
	constructor(options) {
		if (typeof options === 'object' && options !== null) {
			this.options = Object.assign(Object.assign({}, WebpackPluginWebpackPlugin.DefaultOptions), options);
		} else {
			this.options = WebpackPluginWebpackPlugin.DefaultOptions;
		}
	}

	apply(compiler) {
		if (typeof this.options['initialize'] === 'function') {
			this.options.initialize(compiler);
		}

		const compilerOptions = this.options.compiler;
		for (const compilerOptionName of Object.keys(compilerOptions)) {
			const compilerOptionValue = compilerOptions[compilerOptionName];

			if (compilerOptionName === 'compilation' && typeof compilerOptionValue === 'object' && compilerOptionValue !== null) {
				const compilationOptions = compilerOptionValue;

				compiler.plugin(compilerOptionName, (compilation) => {
					for (const compilationOptionName of Object.keys(compilationOptions)) {
						const compilationOptionValue = compilationOptions[compilationOptionName];

						if (typeof compilationOptionValue === 'function') {
							compilation.plugin(compilationOptionName, compilationOptionValue);
						}
					}
				});
			} else {
				if (typeof compilerOptionValue === 'function') {
					compiler.plugin(compilerOptionName, compilerOptionValue);
				}
			}
		}
	}
}

Object.defineProperty(WebpackPluginWebpackPlugin, 'DefaultOptions', {
	value: {
		compiler: {}
	},
	writable: false
});

module.exports = WebpackPluginWebpackPlugin;
