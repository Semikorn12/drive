// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web (only used for the browser preview) needs .wasm files.
config.resolver.assetExts.push('wasm');

module.exports = config;
