import uuidV4 from 'uuid/v4';
import jwtDecode from 'jwt-decode';

import Configuration from '../models/Configuration';

export const ActionTypes = {
  RECEIVE_USER_TYPE: 'RECEIVE_USER_TYPE',
  RECEIVE_TOKEN_TYPE: 'RECEIVE_TOKEN_TYPE'
};

export const ActionCreators = {
  fetchSession: () => dispatch => {
    const idToken = window.localStorage.getItem('idToken');
    const accessToken = window.localStorage.getItem('accessToken');

    if (!idToken || !accessToken) {
      return;
    }

    const decodedIdToken = jwtDecode(idToken);

    // Token is expired
    if (Date.now() > decodedIdToken.exp * 1000) {
      // TODO: Silent refresh using iframe and prompt=none
      window.localStorage.setItem('idToken', '');
      window.localStorage.setItem('accessToken', '');
      ActionCreators.login()();
      return;
    }

    dispatch({
      type: ActionTypes.RECEIVE_TOKEN_TYPE,
      token: accessToken
    });
    dispatch({
      type: ActionTypes.RECEIVE_USER_TYPE,
      user: decodedIdToken
    });
  },
  login: (silent = false) => async dispatch => {
    const config = await Configuration.load();
    const metadata = await config.getMetadata();
    const state = uuidV4();
    const nonce = uuidV4();
    const query = Object.entries({
      response_type: 'id_token token',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: 'openid profile email',
      resource: config.resource,
      state,
      nonce
    })
      .reduce((acc, [key, value]) => {
        if (!acc) {
          acc = `${key}=${encodeURIComponent(value)}`;
        } else {
          acc += `&${key}=${encodeURIComponent(value)}`;
        }

        return acc;
      }, '');
    const requestUrl = `${metadata.authorization_endpoint}?${query}`;

    window.localStorage.setItem('alreadyHandled', 'false');
    window.localStorage.setItem('state', state);
    window.localStorage.setItem('nonce', nonce);
    window.location = requestUrl;
  },
  handleCallback: () => async dispatch => {
    const alreadyHandled = window.localStorage.getItem('alreadyHandled') === 'true';

    if (alreadyHandled) {
      return;
    }

    const state = window.localStorage.getItem('state');
    const nonce = window.localStorage.getItem('nonce');
    const hash = window.location.hash
      .slice(1)
      .split('&')
      .map(val => val.split('='))
      .reduce((acc, [key, value]) => {
        acc[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        return acc;
      }, {});

    window.localStorage.setItem('alreadyHandled', 'true');

    if (hash.error) {
      throw new Error(hash.error_description || hash.error);
    }

    if (hash.token_type !== 'Bearer') {
      throw new Error('Wrong token type returned.');
    }

    if (hash.state !== state) {
      throw new Error('Invalid state returned.');
    }

    const idToken = jwtDecode(hash.id_token);

    if (idToken.nonce && idToken.nonce !== nonce) {
      throw new Error('Invalid nonce in id token.');
    }

    const res = await (await window.fetch('api/Crypto/VerifyToken', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ token: hash.id_token })
    })).json();

    if (!res.result) {
      throw new Error('Id token verification failed.');
    }

    if (idToken.at_hash) {
      const resAtHash = await (await window.fetch('api/Crypto/VerifyAtHash', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          access_token: hash.access_token,
          at_hash: idToken.at_hash
        })
      })).json();

      if (resAtHash.error) {
        throw new Error(resAtHash.error_description || resAtHash.error);
      }

      if (!resAtHash.result) {
        throw new Error('Id token at_hash verification failed.');
      }
    }

    window.localStorage.setItem('state', '');
    window.localStorage.setItem('nonce', '');
    window.localStorage.setItem('idToken', hash.id_token);
    window.localStorage.setItem('accessToken', hash.access_token);
    dispatch({
      type: ActionTypes.RECEIVE_USER_TYPE,
      user: idToken
    });
    dispatch({
      type: ActionTypes.RECEIVE_TOKEN_TYPE,
      token: hash.access_token
    });
  },
  logout: () => async dispatch => {
  }
};

function userReducer (state = null, action) {
  switch (action.type) {
    case ActionTypes.RECEIVE_USER_TYPE:
      return action.user;

    default:
      return state;
  }
}

function tokenReducer (state = null, action) {
  switch (action.type) {
    case ActionTypes.RECEIVE_TOKEN_TYPE:
      return action.token;

    default:
      return state;
  }
}

export const Reducers = {
  user: userReducer,
  token: tokenReducer
};
