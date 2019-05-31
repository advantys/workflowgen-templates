import React, { Component } from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ActionCreators as ConfigurationActionCreators } from './store/Configuration';
import { ActionCreators as AuthenticationActionCreators } from './store/Authentication';
import Layout from './components/Layout';
import HomeContainer from './containers/HomeContainer';
import WorkflowGenProfile from './containers/WorkflowGenProfileContainer';
import CallbackContainer from './containers/CallbackContainer';
import { GraphQLContext, buildGraphQLClient } from './models/GraphQL';

class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      client: null
    };
  }

  async componentDidMount () {
    await this.props.fetchClientConfiguration();
    await this.props.fetchSession();
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      token,
      user,
      config: { resource: graphqlEndpoint }
    } = this.props;

    if (user && token && graphqlEndpoint && (prevProps.token !== token || !prevState.client)) {
      this.setState({
        client: buildGraphQLClient(graphqlEndpoint, token)
      });
    }
  }

  render () {
    let content = (
      <Layout>
        <Route exact path='/' component={HomeContainer} />
        <Route exact path='/callback' component={CallbackContainer} />
        <Route exact path='/WorkflowGenProfile' component={WorkflowGenProfile} />
      </Layout>
    );

    if (this.state.client) {
      content = (
        <GraphQLContext.Provider value={this.state.client}>
          <Layout>
            <Route exact path='/' component={HomeContainer} />
            <Route exact path='/callback' component={CallbackContainer} />
            <Route exact path='/WorkflowGenProfile' component={WorkflowGenProfile} />
          </Layout>
        </GraphQLContext.Provider>
      );
    }

    return content;
  }
}

export default connect(
  store => ({
    user: store.user,
    token: store.token,
    config: store.config
  }),
  dispatch => bindActionCreators({
    ...ConfigurationActionCreators,
    ...AuthenticationActionCreators
  }, dispatch)
)(App);
