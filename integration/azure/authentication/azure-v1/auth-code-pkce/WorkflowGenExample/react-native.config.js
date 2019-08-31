// react-native.config.js
module.exports = {
  dependencies: {
    '@react-native-community/async-storage': {
      platforms: {
        android: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-gesture-handler': {
      platforms: {
        android: null
      }
    },
    'react-native-keychain': {
      platforms: {
        android: null
      }
    },
    'react-native-vector-icons': {
      platforms: {
        android: null
      }
    }
  }
};
