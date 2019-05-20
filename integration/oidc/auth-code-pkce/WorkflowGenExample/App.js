import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, Linking } from 'react-native';
import { NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

import { configureStore } from './redux/store';
import { createNavigation } from './navigation';

const store = configureStore(/* initialState: */ {});
const Navigation = createNavigation();

export default class extends Component {
  constructor (props) {
    super(props);

    this.handleOpenURL = this.handleOpenURL.bind(this);
  }

  async handleOpenURL (event) {
    const [base] = event.url.split('?');

    if (base.endsWith('callback') || base.endsWith('callback/')) {
      await AsyncStorage.setItem('url', event.url);
      this.navigator.dispatch(NavigationActions.navigate({ routeName: 'AuthCallback' }));
    }
  }

  componentDidMount () {
    Linking.addEventListener('url', this.handleOpenURL);
  }

  componentWillUnmount () {
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  render () {
    return (
      <Provider store={store}>
        <StatusBar backgroundColor='#153C92' barStyle='light-content' />
        <Navigation ref={nav => { this.navigator = nav; }} />
      </Provider>
    );
  }
}
