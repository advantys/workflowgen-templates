import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Collapse,
  Container,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  Button
} from 'reactstrap';

import './NavMenu.css';
import { ActionCreators as AuthenticationActionCreators } from '../store/Authentication';
import { ActionCreators as ConfigurationActionCreators } from '../store/Configuration';

class NavMenu extends React.Component {
  constructor (props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.state = {
      isOpen: false
    };
  }

  async componentDidMount () {
    await this.props.fetchClientConfiguration();
    this.props.fetchUser();
    this.props.fetchToken();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.props.userIsLoggedIn !== nextProps.userIsLoggedIn ||
      this.state.isOpen !== nextState.isOpen;
  }

  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleLogout () {
    this.props.config.authenticationContext.logOut();
  }

  render () {
    return (
      <header>
        <Navbar className='navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3' light >
          <Container>
            <NavbarBrand href='/'>WorkflowGen Example</NavbarBrand>
            <NavbarToggler onClick={this.toggle} className='mr-2' />
            <Collapse className='d-sm-inline-flex flex-sm-row-reverse' isOpen={this.state.isOpen} navbar>
              <ul className='navbar-nav flex-grow'>
                <NavItem>
                  <NavLink className='text-dark' href='/'>Home</NavLink>
                </NavItem>
                {this.props.userIsLoggedIn && [
                  <NavItem key={0}>
                    <NavLink className='text-dark' href='/WorkflowGenProfile'>WorkflowGen Profile</NavLink>
                  </NavItem>,
                  <NavItem key={1}>
                    <Button color='danger' onClick={this.handleLogout}>Logout</Button>
                  </NavItem>
                ]}
              </ul>
            </Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }
}

export default connect(
  store => ({
    userIsLoggedIn: !!store.user,
    config: store.config
  }),
  dispatch => bindActionCreators({
    ...AuthenticationActionCreators,
    ...ConfigurationActionCreators
  }, dispatch)
)(NavMenu);
