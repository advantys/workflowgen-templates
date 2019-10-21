import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import CallbackComponent from '../components/Callback';
import { ActionCreators as AuthenticationActionCreators } from '../store/Authentication';

class CallbackContainer extends Component {
  constructor (props) {
    super(props);

    this.state = {
      error: null,
      redirect: false
    };
  }

  async componentDidMount () {
    try {
      await this.props.handleCallback();
    } catch (error) {
      this.setState({ error });
      return;
    }

    this.props.push('/');
  }

  render () {
    return <CallbackComponent error={this.state.error} />;
  }
}

export default connect(
  null,
  dispatch => bindActionCreators({
    ...AuthenticationActionCreators,
    push
  }, dispatch)
)(CallbackContainer);
