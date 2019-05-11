import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { createBrowserHistory } from 'history';
import { ApolloProvider } from 'react-apollo';

import configureStore from './store/configureStore';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Configuration from './models/Configuration';
import { buildApolloClient } from './models/Apollo';

// Create browser history to use in the Redux store
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const history = createBrowserHistory({ basename: baseUrl });

// Get the application-wide store instance, prepopulating with state from the server where available.
const store = configureStore(history, {
  isFetching: false
});

const rootElement = document.getElementById('root');

Configuration.load().then(config => {
  const apolloClient = buildApolloClient(config.resource, config.authenticationContext.getCachedToken());

  ReactDOM.render(
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </ApolloProvider>
    </Provider>,
    rootElement
  );

  registerServiceWorker();
});
