import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation';

import {
  AuthContainer,
  AuthLoadingContainer,
  AuthCallbackContainer
} from '../containers';
import HomeNavigator from './homenavigation';

export function createNavigation () {
  const defaultNavigationOptions = {
    headerStyle: {
      backgroundColor: '#2095F3'
    },
    headerTintColor: 'white'
  };
  const AuthStackNavigator = createStackNavigator({
    Home: {
      screen: AuthContainer
    }
  }, {
    initialRouteName: 'Home',
    defaultNavigationOptions
  });
  const AuthLoadingStackNavigator = createStackNavigator({
    Home: {
      screen: AuthLoadingContainer
    }
  }, {
    initialRouteName: 'Home',
    defaultNavigationOptions
  });
  const CallbackStackNavigator = createStackNavigator({
    Home: {
      screen: AuthCallbackContainer
    }
  }, {
    initialRouteName: 'Home',
    defaultNavigationOptions
  });

  return createAppContainer(createSwitchNavigator({
    Main: AuthLoadingStackNavigator,
    Auth: AuthStackNavigator,
    App: HomeNavigator,
    AuthCallback: CallbackStackNavigator
  }, {
    initialRouteName: 'Main'
  }));
}
