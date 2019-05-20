/* global var fetch */ // eslint-disable-line
import AsyncStorage from '@react-native-community/async-storage';
import { NativeModules } from 'react-native';

import { ActionTypes as FetchingActionTypes } from './fetching';
import Configuration from '../models/Configuration';
import { getMetadata, getKey } from '../models/openidhelpers';
import Url from '../models/Url';

const { JWT, CodeGenerator, WebBrowser } = NativeModules;

export const ActionTypes = {
  RECIEVE_USER: 'RECIEVE_USER'
};

const entriesToQueryString = (acc, [key, value]) => {
  const combined = `${key}=${encodeURIComponent(value)}`;
  acc += acc ? `&${combined}` : combined;
  return acc;
};

export const ActionCreators = {
  login: () => async (dispatch, getState) => {
    await ActionCreators.getUserFromStorage()(dispatch);
    const reduxState = getState();

    if (reduxState.user) {
      return;
    }

    const config = Configuration.load();
    const metadata = await getMetadata(config);
    const state = await CodeGenerator.generateUUID();
    const nonce = await CodeGenerator.generateUUID();
    const codeVerifier = await CodeGenerator.generateCodeVerifier();
    const codeChallenge = await CodeGenerator.generateCodeChallenge(codeVerifier);

    await AsyncStorage.multiSet([
      ['state', state],
      ['nonce', nonce],
      ['codeVerifier', codeVerifier]
    ]);

    const authorizationUrl = new Url({
      baseUrl: metadata.authorization_endpoint,
      query: {
        resource: config.audience,
        client_id: config.clientId,
        scope: 'opend profile email offline_access',
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        redirect_uri: 'workflowgenexample://callback',
        state,
        nonce
      }
    });

    WebBrowser.show({ url: authorizationUrl.toString() });
  },
  loginCallback: url => async dispatch => {
    WebBrowser.dismiss();
    /* eslint-disable no-unused-vars */
    const [
      [_, originalState],
      [__, nonce],
      [___, codeVerifier]
    ] = await AsyncStorage.multiGet(['state', 'nonce', 'codeVerifier']);
    /* eslint-enable */
    const parsedUrl = Url.parse(url);
    const {
      code, state, error
    } = parsedUrl.query;
    const errorDescription = parsedUrl.query.error_description;

    if (error) {
      throw new Error(errorDescription);
    }

    if (originalState !== state) {
      throw new Error(
        `Original state is not the same as the one recieved: Original=${originalState}, Recieved=${state}`
      );
    }

    const config = Configuration.load();
    const metadata = await getMetadata(config);
    const res = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: Object.entries({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: 'workflowgenexample://callback'
      }).reduce(entriesToQueryString, '')
    });
    const json = await res.json();

    if (json.error) {
      throw new Error(json.error_description);
    }

    if (json.token_type !== 'Bearer') {
      throw new Error(`Recieved wrong token type "${json.token_type}". Supposed to be "Bearer".`);
    }

    const [ idTokenHeader, idTokenPayload, idTokenSignature ] = json.id_token.split('.');
    const [ decodedIdTokenHeader, claims ] = await JWT.decode({
      header: idTokenHeader,
      payload: idTokenPayload
    });
    let idTokenIsValid = false;

    if (decodedIdTokenHeader.alg !== 'none') {
      const key = await getKey(decodedIdTokenHeader.kid, metadata.jwks_uri);
      idTokenIsValid = await JWT.verify({
        header: idTokenHeader,
        payload: idTokenPayload,
        signature: idTokenSignature,
        publicKey: key.publicKey.split('\n')
      });
    } else {
      idTokenIsValid = true;
    }

    if (!idTokenIsValid) {
      throw new Error('Token verification failed.');
    }

    if (claims.nonce && claims.nonce !== nonce) {
      throw new Error(
        `Nonce value found in id token is not the same as the original: Original=${nonce}, Recieved=${claims.nonce}`
      );
    }

    if (claims.at_hash) {
      // TODO: validate at_hash value against access token
    }

    // TODO: store refresh token in Keychain iOS and SecureStore Android
    AsyncStorage.multiSet([
      ['idToken', json.id_token],
      ['accessToken', json.access_token],
      ['refreshToken', json.refresh_token]
    ]);
    AsyncStorage.multiRemove([ 'state', 'nonce', 'codeVerifier' ]);
    dispatch({ type: FetchingActionTypes.END_FETCH });
    dispatch({ type: ActionTypes.RECIEVE_USER, user: claims });
  },
  logout: () => async dispatch => {
    dispatch({ type: ActionTypes.RECIEVE_USER, user: null });
  },
  refreshTokens: refreshToken => async (dispatch, getState) => {
    dispatch({ type: FetchingActionTypes.BEGIN_FETCH });

    const config = Configuration.load();
    const metadata = await getMetadata(config);
    const res = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: Object.entries({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId
      }).reduce(entriesToQueryString, '')
    });
    const json = await res.json();
    const storageItems = [
      [ 'accessToken', json.access_token ]
    ];
    let userClaims;

    if (json.error) {
      throw new Error(json.error_description);
    }

    if (json.token_type !== 'Bearer') {
      throw new Error('Wrong token type provided after refresh.');
    }

    if (json.id_token) {
      const currentClaims = getState().user;
      const [ header, payload ] = json.id_token.split('.');
      /* eslint-disable no-unused-vars */
      const [ _, claims ] = await JWT.decode({ header, payload });
      /* eslint-disable enable */

      if (
        claims.iss !== currentClaims.iss ||
        claims.sub !== currentClaims.sub ||
        claims.aud !== currentClaims.aud ||
        claims.azp !== currentClaims.azp
      ) {
        throw new Error('New id token following a refresh is not valid.');
      }

      userClaims = claims;
      storageItems.push([ 'idToken', json.id_token ]);
    }

    if (json.refresh_token) {
      storageItems.push([ 'refreshToken', json.refresh_token ]);
    }

    await AsyncStorage.multiSet(storageItems);
    dispatch({ type: FetchingActionTypes.END_FETCH });
    dispatch({ type: ActionTypes.RECIEVE_USER, user: userClaims });
  },
  getUserFromStorage: () => async dispatch => {
    dispatch({ type: FetchingActionTypes.BEGIN_FETCH });

    /* eslint-disable no-unused-vars */
    const [
      [_, idToken],
      [__, accessToken],
      [___, refreshToken]
    ] = await AsyncStorage.multiGet(/* keys */ ['idToken', 'accessToken', 'refreshToken']);
    /* eslint-enable */

    if (!idToken || !accessToken) {
      dispatch({ type: FetchingActionTypes.END_FETCH });
      return;
    }

    const [ header, payload ] = idToken.split('.');
    /* eslint-disable no-unused-vars */
    const [ ____, claims ] = await JWT.decode({ header, payload });
    /* eslint-enable */
    const now = Date.now();

    dispatch({ type: FetchingActionTypes.END_FETCH });

    // Check the expiration of the token
    if (now > (claims.exp * 1000)) {
      try {
        await ActionCreators.refreshTokens(refreshToken)(dispatch);
      } catch (err) {
        await AsyncStorage.multiRemove([ 'idToken', 'accessToken', 'refreshToken' ]);
        dispatch({
          type: ActionTypes.RECIEVE_USER,
          user: null
        });
      }
      return;
    }

    dispatch({
      type: ActionTypes.RECIEVE_USER,
      user: claims
    });
  }
};

function userReducer (state = null, action) {
  switch (action.type) {
    case ActionTypes.RECIEVE_USER:
      return action.user;

    default:
      return state;
  }
}

export const Reducers = {
  user: userReducer
};
