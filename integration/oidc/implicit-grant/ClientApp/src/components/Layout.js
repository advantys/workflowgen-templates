import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withApollo } from 'react-apollo';

import { ActionCreators as AuthenticationActionCreators } from '../store/Authentication';
import { ActionCreators as ConfigurationActionCreators } from '../store/Configuration';
import { buildLinks } from '../models/Apollo';
import NavMenu from './NavMenu';

class Layout extends Component {
  async componentDidMount () {
    await this.props.fetchClientConfiguration();
    this.props.fetchUser();
    this.props.fetchToken();
  }

  componentDidUpdate () {
    this.props.client.link = buildLinks(this.props.graphqlEndpoint, this.props.token);
  }

  render () {
    return (
      <div>
        <NavMenu />
        <Container>
          {this.props.children}
        </Container>
      </div>
    );
  }
}

export default compose(
  withApollo,
  connect(
    store => ({
      token: store.token,
      graphqlEndpoint: store.config.resource
    }),
    dispatch => bindActionCreators({
      ...AuthenticationActionCreators, ...ConfigurationActionCreators
    }, dispatch)
  )
)(Layout);
