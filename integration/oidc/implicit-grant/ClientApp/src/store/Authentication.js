export const ActionTypes = {
  RECEIVE_USER_TYPE: 'RECEIVE_USER_TYPE',
  RECEIVE_TOKEN_TYPE: 'RECEIVE_TOKEN_TYPE'
};

export const ActionCreators = {
  fetchUser: () => (dispatch, getState) => {
    const { config: { authenticationContext = { getCachedUser: () => ({ isLoggedIn: false }) } } } = getState();

    dispatch({ type: ActionTypes.RECEIVE_USER_TYPE, user: authenticationContext.getCachedUser() });
  },
  fetchToken: () => (dispatch, getState) => {
    const { config: {
      authenticationContext = { getCachedToken: () => null },
      clientId
    } } = getState();

    dispatch({
      type: ActionTypes.RECEIVE_TOKEN_TYPE,
      token: authenticationContext.getCachedToken(clientId)
    });
  }
};

function userReducer (state = { isLoggedIn: false }, action) {
  switch (action.type) {
    case ActionTypes.RECEIVE_USER_TYPE:
      if (!action.user) {
        return { isLoggedIn: false };
      }

      return { ...action.user, isLoggedIn: true };

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
