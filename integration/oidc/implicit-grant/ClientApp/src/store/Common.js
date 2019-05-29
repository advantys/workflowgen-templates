/**
 * Common actions.
 */
export const ActionTypes = {
  FETCH_ACTION: 'FETCH_ACTION',
  FETCH_ACTION_RETURN: 'FETCH_ACTION_RETURN'
};

function reducer (state = false, action) {
  switch (action.type) {
    case ActionTypes.FETCH_ACTION:
      return true;

    case ActionTypes.FETCH_ACTION_RETURN:
      return false;

    default:
      return state;
  }
}

export const Reducers = {
  isFetching: reducer
};
