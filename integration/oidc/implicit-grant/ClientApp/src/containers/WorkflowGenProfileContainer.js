import React, { Component } from 'react';

import WorkflowGenProfileComponent from '../components/WorkflowGenProfileComponent';
import { GraphQLContext, GQLFactory } from '../models/GraphQL';

class WorkflowGenProfileContainer extends Component {
  constructor (props) {
    super(props);

    this.state = {
      error: null,
      user: {
        userName: null
      }
    };
  }

  async componentDidUpdate (prevProps, prevState) {
    const {
      state: {
        user: { userName },
        error
      },
      context: graphqlClient
    } = this;

    if (graphqlClient && !error && (!userName || userName !== prevState.user.userName)) {
      try {
        var data = await graphqlClient.request(GQLFactory.viewerProfile);
      } catch (error) {
        this.setState({ error });
        return;
      }

      this.setState({
        user: data.viewer
      });
    }
  }

  render () {
    const { user, error } = this.state;

    return <WorkflowGenProfileComponent
      error={error}
      user={user.userName ? user : undefined} />;
  }
}

WorkflowGenProfileContainer.contextType = GraphQLContext;

export default WorkflowGenProfileContainer;
