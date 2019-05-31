import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container
} from 'reactstrap';

class CallbackComponent extends Component {
  shouldComponentUpdate (newProps) {
    return newProps.error !== this.props.error;
  }

  render () {
    const { error = null } = this.props;

    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        {!error &&
          <p>Loading...</p>
        }
        {error &&
          <div>
            <h2 className='display-4'>An error occured</h2>
            <span style={{ fontWeight: 'bold' }}>Message</span>: {error.message}
          </div>
        }
      </Container>
    );
  }
}

CallbackComponent.propTypes = {
  error: PropTypes.instanceOf(Error)
};

export default CallbackComponent;
