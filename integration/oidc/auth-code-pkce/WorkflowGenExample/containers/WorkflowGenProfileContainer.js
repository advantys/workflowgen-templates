import React, { Component } from 'react';

import { ProtectedContainer } from '.';
import { WorkflowGenProfileComponent } from '../components';

class WorkflowGenProfileContainer extends Component {
  render () {
    return (
      <ProtectedContainer>
        <WorkflowGenProfileComponent />
      </ProtectedContainer>
    );
  }
}

WorkflowGenProfileContainer.navigationOptions = {
  title: 'WorkflowGen Profile',
  drawerLabel: 'WorkflowGen Profile'
};

export default WorkflowGenProfileContainer;
