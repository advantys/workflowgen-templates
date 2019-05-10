import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container
} from 'reactstrap';

class WorkflowGenProfileContainer extends Component {
  render () {
    return (
      <Container>
        <p>Protected</p>
      </Container>
    );
  }
}

export default connect(
  store => ({
    user: store.user
  })
)(WorkflowGenProfileContainer);
