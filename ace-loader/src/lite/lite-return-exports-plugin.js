const pluginName = 'LiteReturnExportsPlugin';

/**
 * LiteReturnExportsPlugin
 */
class LiteReturnExportsPlugin {
  /**
   * return exports from runtime
   * @param {Object} compiler API specification, all configuration information of Webpack environment.
   */
  apply(compiler) {
    compiler.hooks.compilation.tap('SourcemapFixer', (compilation) => {
      compilation.hooks.afterProcessAssets.tap('SourcemapFixer', (assets) => {
        Reflect.ownKeys(assets).forEach((key) => {
          if (key.toString().includes('.map') && assets[key] && assets[key]._value) {
            const sourceMapSources = JSON.parse(assets[key]._value).sources;
            sourceMapSources.forEach((sourceMapSource, index) => {
              sourceMapSource = sourceMapSource.replace(/\\/g, '/')
                  .replace(/webpack:\/\/\/[A-Z]:/g, function(a) {
                    return a.toLowerCase();
                  });
              sourceMapSources[index] = sourceMapSource;
            });
            const REG_SOURCES = new RegExp(/"sources":\[.*?\]/);
            assets[key]._value = assets[key]._value.toString().replace(REG_SOURCES,
                '"sources":' + JSON.stringify(sourceMapSources));
          }
        });
      },
      );
    });

    const { returnExportsFromRuntime } = compiler.webpack.RuntimeGlobals;

    compiler.hooks.compilation.tap(pluginName, () => {
      compiler.webpack.RuntimeGlobals.returnExportsFromRuntime = '__webpack_exports__';
    });

    compiler.hooks.afterCompile.tapAsync(pluginName, (_, callback) => {
      compiler.webpack.RuntimeGlobals.returnExportsFromRuntime = returnExportsFromRuntime;
      callback();
    });
  }
};

module.exports = LiteReturnExportsPlugin;

