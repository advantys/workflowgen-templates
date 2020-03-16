import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Table
} from 'reactstrap';

class WorkflowGenProfile extends Component {
  render () {
    const {
      error = null,
      user = {}
    } = this.props;

    if (error) {
      return (
        <Container>
          <h1 className='display-4'>An error occured</h1>
          <p><b>Message</b>: {error.message}</p>
        </Container>
      );
    }

    return (
      <Container>
        <Table bordered>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(user).map(([key, value], index) => (
              <tr key={index}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }
}

WorkflowGenProfile.propTypes = {
  error: PropTypes.instanceOf(Error),
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string.isRequired,
    defaultLanguage: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired
  })
};

export default WorkflowGenProfile;
