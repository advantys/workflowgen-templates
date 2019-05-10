import React from 'react';
import { Route } from 'react-router';

import Layout from './components/Layout';
import HomeContainer from './containers/HomeContainer';

export default () => (
  <Layout>
    <Route exact path='/' component={HomeContainer} />
  </Layout>
);
