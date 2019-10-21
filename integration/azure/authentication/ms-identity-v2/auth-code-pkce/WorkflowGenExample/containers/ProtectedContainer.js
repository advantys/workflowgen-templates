import React, { Component } from 'react';
import { ApolloProvider, compose } from 'react-apollo';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withNavigation } from 'react-navigation';

import { createApollo } from '../models/apollo';
import { ActionCreators as UserActionCreators } from '../redux/user';
import Configuration from '../models/Configuration';

class ProtectedContainer extends Component {
  constructor (props) {
    super(props);

    this.state = {
      config: Configuration.load()
    };
  }

  async componentDidMount () {
    await this.props.getUserFromStorage();
  }

  componentDidUpdate () {
    if (!this.props.userIsLoggedIn) {
      this.props.navigation.navigate('Main');
    }
  }

  render () {
    let provider = null;

    if (this.props.accessToken) {
      const client = createApollo(this.state.config, this.props.accessToken);
      provider = (
        <ApolloProvider client={client}>
          {this.props.children}
        </ApolloProvider>
      );
    }

    return provider || this.props.children;
  }
}

export default compose(
  connect(
    state => ({
      userIsLoggedIn: !!state.user,
      accessToken: state.accessToken
    }),
    dispatch => bindActionCreators(UserActionCreators, dispatch)
  ),
  withNavigation
)(ProtectedContainer);
