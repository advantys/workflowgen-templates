import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Container } from '../components';
import { CommonStyles } from '../components/styles';
import { ActionCreators as UserActionCreators } from '../redux/user';

class AuthLoadingContainer extends Component {
  constructor (props) {
    super(props);

    this.state = {
      finishedGettingUser: false,
      error: null
    };
  }

  async componentDidMount () {
    const newState = {
      finishedGettingUser: true
    };

    try {
      await this.props.getUserFromStorage();
    } catch (error) {
      newState.error = error;
    }

    this.setState(newState);
  }

  componentDidUpdate () {
    if (this.state.finishedGettingUser && !this.state.error) {
      this.props.navigation.navigate(this.props.userIsLoggedIn ? 'App' : 'Auth');
    }
  }

  render () {
    return (
      <Container style={CommonStyles.centerContent}>
        {this.state.error &&
          <Text>{this.state.error.message}</Text>
        }
        {!this.state.error &&
          <ActivityIndicator size='large' color='#2095F3' />
        }
      </Container>
    );
  }
}

AuthLoadingContainer.navigationOptions = {
  header: null
};

export default connect(
  state => ({
    userIsLoggedIn: !!state.user
  }),
  dispatch => bindActionCreators(UserActionCreators, dispatch)
)(AuthLoadingContainer);
