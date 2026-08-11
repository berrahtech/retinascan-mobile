module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    // react-native-worklets/plugin remplace react-native-reanimated/plugin
    // depuis Reanimated 4. Il doit rester le dernier plugin de la liste.
    plugins: ['react-native-worklets/plugin'],
  };
};
