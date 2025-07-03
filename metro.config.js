const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 👇 This disables the problematic export resolution
config.resolver.unstable_enablePackageExports = false;

// 👇 Optional: helps in some setups
config.resolver.sourceExts.push('cjs');

module.exports = config;