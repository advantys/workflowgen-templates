import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { AuthComponent as Auth } from '../components';
import { ActionCreators as UserActionCreators } from '../redux/user';

class AuthContainer extends Component {
  constructor (props) {
    super(props);

    this.handleOnLoginButtonPress = this.handleOnLoginButtonPress.bind(this);
  }

  handleOnLoginButtonPress () {
    this.props.login();
  }

  render () {
    return <Auth onLoginButtonPress={this.handleOnLoginButtonPress} />;
  }
}

AuthContainer.navigationOptions = {
  header: null
};

export default connect(
  null,
  dispatch => bindActionCreators(UserActionCreators, dispatch)
)(AuthContainer);
