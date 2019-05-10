import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Button,
  Table
} from 'reactstrap';

class Home extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    const configHasChanged = Object.entries(nextProps.clientConfiguration)
      .reduce((acc, [key, value]) => {
        if (
          !(key in this.props.clientConfiguration) ||
          this.props.clientConfiguration[key] !== value
        ) {
          acc = true;
        }

        return acc;
      }, false);

    return nextProps.user.isLoggedIn !== this.props.user.isLoggedIn ||
      configHasChanged ||
      this.props.token !== nextProps.token;
  }

  render () {
    let userClaims = (
      <div>
        <p>You don't seem to be logged in.</p>
        <Button color='primary' onClick={this.props.onLoginClick}>Log in</Button>
      </div>
    );

    if (this.props.user.isLoggedIn) {
      const body = Object.entries(this.props.user).map(([key, value]) => {
        switch (typeof value) {
          case 'object':
            const stringified = JSON.stringify(value, null, 4)
              .replace(/(?:\r\n|\r|\n)/g, '<br />');
            const html = `<code>${stringified}</code>`;

            return (
              <tr key={key}>
                <td className='text-center'>{key}</td>
                <td style={{ whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: html }} />
              </tr>
            );

          case 'boolean':
            return (
              <tr key={key}>
                <td className='text-center'>{key}</td>
                <td>{value.toString()}</td>
              </tr>
            );

          default:
            return (
              <tr key={key}>
                <td className='text-center'>{key}</td>
                <td>{value}</td>
              </tr>
            );
        }
      });

      userClaims = (
        <div>
          <h3 className='display-6 text-center'>User Claims</h3>
          <Table bordered>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {body}
            </tbody>
          </Table>
        </div>
      );
    }

    return (
      <Container>
        {!this.props.user.isLoggedIn &&
          <Row>
            <Col>
              <h1 className='display-3'>Single Page Application Example</h1>
            </Col>
          </Row>
        }
        {this.props.user.isLoggedIn &&
          <Row>
            <Col className='text-center'>
              <h2 className='display-4'>
                Hello {this.props.user.profile.given_name} {this.props.user.profile.family_name}!
              </h2>
            </Col>
          </Row>
        }
        <Row>
          <Col>
            {userClaims}
          </Col>
        </Row>
        {this.props.token &&
          <Row>
            <Col>
              <Table borderless>
                <tr>
                  <td>Token</td>
                  <td style={{ maxWidth: '500px' }} className='text-break word-break'>{this.props.token}</td>
                </tr>
              </Table>
            </Col>
          </Row>
        }
        <Row>
          <Col className='text-center'>
            <h3 className='display-6'>Client Configuration</h3>
            <Table bordered>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.props.clientConfiguration).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td className='text-left'>{value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    );
  }
}

Home.propTypes = {
  user: PropTypes.object,
  clientConfiguration: PropTypes.object,
  onLoginClick: PropTypes.func,
  token: PropTypes.string
};

Home.defaultTypes = {
  user: { isLoggedIn: false },
  clientConfiguration: {},
  onLoginClick: () => {}
};

export default Home;
