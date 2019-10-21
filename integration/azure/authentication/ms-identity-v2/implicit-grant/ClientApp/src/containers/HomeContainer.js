import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Home from '../components/Home';
import { ActionCreators as AuthenticationActionCreators } from '../store/Authentication';

class HomeContainer extends Component {
  constructor (props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  componentDidMount () {
    this.props.fetchSession();
  }

  handleLoginClick () {
    this.props.login();
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
  dispatch => bindActionCreators(AuthenticationActionCreators, dispatch)
)(HomeContainer);
