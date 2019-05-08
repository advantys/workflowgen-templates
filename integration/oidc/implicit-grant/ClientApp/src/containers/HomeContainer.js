import React, { Component } from 'react';
import { connect } from 'react-redux';

import Home from '../components/Home';

class HomeContainer extends Component {
  render () {
    return (
      <Home />
    );
  }
}

export default connect()(HomeContainer);
