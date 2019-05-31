import React from 'react';
import {
  createStackNavigator
} from 'react-navigation';
import { Platform, Button, View } from 'react-native';

import {
  WorkflowGenProfileContainer
} from '../containers';

export default createStackNavigator(
  {
    ProfileHome: WorkflowGenProfileContainer
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: '#2095F3'
      },
      headerTintColor: 'white',
      headerLeft: Platform.select({
        ios: undefined,
        android: <View style={{ flex: 1, paddingLeft: 10 }}>
          <Button title='menu' onPress={() => navigation.toggleDrawer()} />
        </View>
      })
    })
  }
);
