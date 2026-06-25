module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "lucide-react": "./src/shims/lucide-react.ts",
            "sonner": "./src/shims/sonner.ts",
            "react-router-dom": "./src/shims/react-router-dom.ts",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
