import React, { Component } from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withAdalLogin } from 'react-adal';

import { ActionCreators as ConfigurationActionCreators } from './store/Configuration';
import Layout from './components/Layout';
import HomeContainer from './containers/HomeContainer';
import WorkflowGenProfile from './containers/WorkflowGenProfileContainer';

class App extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return this.props.config.resource !== nextProps.config.resource;
  }

  componentDidMount () {
    this.props.fetchClientConfiguration();
  }

  render () {
    const { config } = this.props;
    const withAdalLoginApi = withAdalLogin(config.authenticationContext, config.resource);
    const ProtectedWorkflowGenProfile = withAdalLoginApi(
      WorkflowGenProfile,
      () => <p>loading...</p>,
      error => <p>{error.message}</p>
    );

    return (
      <Layout>
        <Route exact path='/' component={HomeContainer} />
        <Route exact path='/WorkflowGenProfile' component={ProtectedWorkflowGenProfile} />
      </Layout>
    );
  }
}

export default connect(
  store => ({
    config: store.config
  }),
  dispatch => bindActionCreators(ConfigurationActionCreators, dispatch)
)(App);
