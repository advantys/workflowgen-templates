import React, { Component } from 'react';
import {
  Text,
  Button
} from 'react-native';
import PropTypes from 'prop-types';

import { Container } from '.';
import { CommonStyles } from './styles';

class AuthComponent extends Component {
  render () {
    return (
      <Container style={CommonStyles.centerContent}>
        <Text>Native Application Example</Text>
        <Text>You don't seem to be connected.</Text>
        <Button title='Log In' onPress={this.props.onLoginButtonPress} />
      </Container>
    );
  }
}

AuthComponent.propTypes = {
  onLoginButtonPress: PropTypes.func
};

AuthComponent.defaultTypes = {
  onLoginButtonPress: () => {}
};

export default AuthComponent;
