import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Text,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import { ActionCreators as UserActionCreators } from '../redux/user';
import { Container } from '../components';
import { CommonStyles } from '../components/styles';

class AuthCallbackContainer extends Component {
  constructor (props) {
    super(props);

    this.state = {
      error: null
    };
  }

  async componentDidMount () {
    const url = await AsyncStorage.getItem('url');

    AsyncStorage.removeItem('url');

    try {
      await this.props.loginCallback(url);
    } catch (error) {
      this.setState({ error });
    }
  }

  componentDidUpdate () {
    if (this.props.userIsLoggedIn) {
      this.props.navigation.navigate('App');
    }
  }

  render () {
    let text = <Text>{this.props.isFetching ? 'Logging you in...' : 'Entering...'}</Text>;

    if (this.state.error) {
      text = <Text>{this.state.error.message}</Text>;
    }

    return (
      <Container style={CommonStyles.centerContent}>
        {text}
        {!this.state.error && this.props.isFetching &&
          <ActivityIndicator size='large' color='#2095F3' />
        }
      </Container>
    );
  }
}

AuthCallbackContainer.navigationOptions = {
  header: null
};

export default connect(
  state => ({
    isFetching: state.isFetching,
    userIsLoggedIn: !!state.user
  }),
  dispatch => bindActionCreators(UserActionCreators, dispatch)
)(AuthCallbackContainer);
