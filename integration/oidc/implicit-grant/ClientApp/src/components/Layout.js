import React, { Component } from 'react';
import { Container } from 'reactstrap';

import NavMenu from './NavMenu';

export default class extends Component {
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
