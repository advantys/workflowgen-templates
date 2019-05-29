import React from 'react';
import {
  createDrawerNavigator
} from 'react-navigation';
import Ionicon from 'react-native-vector-icons/Ionicons';

import HomeStack from './HomeStack';
import WorkflowGenProfileStack from './WorkflowGenProfileStack';

export default createDrawerNavigator(
  {
    Home: HomeStack,
    Profile: WorkflowGenProfileStack
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        const params = {
          size: 25,
          color: focused ? '#2095F3' : 'black'
        };

        switch (routeName) {
          case 'Home':
            params.name = 'ios-home';
            break;

          case 'Profile':
            params.name = 'ios-contact';
            break;

          default:
            throw new Error('Unknown route');
        }

        return <Ionicon {...params} />;
      }
    })
  }
);
