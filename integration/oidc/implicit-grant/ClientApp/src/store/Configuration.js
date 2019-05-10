/**
 * Configuration related redux actions and reducers.
 */
import * as Common from './Common';
import Configuration from '../models/Configuration';

const RECEIVE_CLIENT_CONFIGURATION_TYPE = 'RECEIVE_CLIENT_CONFIGURATION';

export const ActionCreators = {
  fetchClientConfiguration: () => async dispatch => {
    dispatch({ type: Common.ActionTypes.FETCH_ACTION });

    const config = await Configuration.load();

    dispatch({ type: Common.ActionTypes.FETCH_ACTION_RETURN });
    dispatch({ type: RECEIVE_CLIENT_CONFIGURATION_TYPE, config });
  }
};

function reducer (state = {}, action) {
  switch (action.type) {
    case RECEIVE_CLIENT_CONFIGURATION_TYPE:
      return action.config;

    default:
      return state;
  }
}

export const Reducers = {
  config: reducer
};
