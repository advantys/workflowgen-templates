import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container
} from 'reactstrap';
import { Query } from 'react-apollo';

import { GQLFactory } from '../models/Apollo';

class WorkflowGenProfileContainer extends Component {
  render () {
    return (
      <Container>
        <Query query={GQLFactory.query.getViewerProfile()}>
          {({ loading, error, data }) => {
            if (loading) {
              return <p>Loading...</p>;
            }

            if (error) {
              return <p>{error.message}</p>;
            }

            return (
              <p>{data.viewer.firstName}</p>
            );
          }}
        </Query>
      </Container>
    );
  }
}

export default connect(
  store => ({
    user: store.user
  })
)(WorkflowGenProfileContainer);
