const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// lucide-react-native ships ESM icon modules as .mjs
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

const reanimatedEntry = path.resolve(
  __dirname,
  'node_modules/react-native-reanimated/lib/module/index.js',
);

const workletsEntry = path.resolve(
  __dirname,
  'node_modules/react-native-worklets/lib/module/index.js',
);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-reanimated') {
    return { type: 'sourceFile', filePath: reanimatedEntry };
  }
  if (moduleName === 'react-native-worklets') {
    return { type: 'sourceFile', filePath: workletsEntry };
  }
  if (platform === 'web' && moduleName === '@lottiefiles/dotlottie-react') {
    return { type: 'sourceFile', filePath: path.resolve(__dirname, 'shims/dotlottie-react.js') };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
