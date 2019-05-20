import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation';

import {
  AuthContainer,
  HomeContainer,
  AuthLoadingContainer,
  AuthCallbackContainer
} from './containers';

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
  const AppStackNavigator = createStackNavigator({
    Home: {
      screen: HomeContainer
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
    App: AppStackNavigator,
    AuthCallback: CallbackStackNavigator
  }, {
    initialRouteName: 'Main'
  }));
}
