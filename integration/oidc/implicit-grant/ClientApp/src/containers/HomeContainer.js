import React, { Component } from 'react';
import { connect } from 'react-redux';

import Home from '../components/Home';

class HomeContainer extends Component {
  constructor (props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
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
  })
)(HomeContainer);
