import React, { Component } from 'react';
import { connect } from 'react-redux';

import { HomeComponent as Home } from '../components';
import { ProtectedContainer } from '.';

class HomeContainer extends Component {
  render () {
    return (
      <ProtectedContainer>
        <Home user={this.props.user} />
      </ProtectedContainer>
    );
  }
}

HomeContainer.navigationOptions = {
  title: 'Home',
  drawerLabel: 'Home'
};

export default connect(
  state => ({
    user: state.user
  })
)(HomeContainer);
