import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { ActionCreators as ConfigurationActionCreators } from '../store/Configuration';
import { ActionCreators as AuthenticationActionCreators } from '../store/Authentication';
import Home from '../components/Home';

class HomeContainer extends Component {
  constructor (props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  async componentDidMount () {
    await this.props.fetchClientConfiguration();
    this.props.fetchUser();
    this.props.fetchToken();
  }

  handleLoginClick () {
    this.props.config.authenticationContext.login();
  }

  render () {
    return (
      <Home
        onLoginClick={this.handleLoginClick}
        user={this.props.user}
        token={this.props.token}
        clientConfiguration={this.props.config} />
    );
  }
}

export default connect(
  store => ({
    config: store.config,
    user: store.user,
    token: store.token
  }),
  dispatch => bindActionCreators({
    ...ConfigurationActionCreators,
    ...AuthenticationActionCreators
  }, dispatch)
)(HomeContainer);
