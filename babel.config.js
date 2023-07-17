module.exports = function (api) {
  api.cache(true);

  return {
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@assets": "./assets",
            "@components": "./components",
            "@constants": "./constants",
            "@hooks": "./hooks",
            "@screens": "./screens",
            "@store": "./store",
            "@theme": "./theme",
            "@types": "./types",
            "@utils": "./utils",
          },
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};
