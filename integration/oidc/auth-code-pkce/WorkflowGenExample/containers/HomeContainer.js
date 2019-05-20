import React, { Component } from 'react';
import { connect } from 'react-redux';

import { HomeComponent as Home } from '../components';

class HomeContainer extends Component {
  render () {
    return <Home user={this.props.user} />;
  }
}

HomeContainer.navigationOptions = {
  title: 'Home'
};

export default connect(
  state => ({
    user: state.user
  })
)(HomeContainer);
