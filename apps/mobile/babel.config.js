module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // Reanimated 4 moved worklet transformation into react-native-worklets.
      // Must remain last.
      'react-native-worklets/plugin',
    ],
  };
};
