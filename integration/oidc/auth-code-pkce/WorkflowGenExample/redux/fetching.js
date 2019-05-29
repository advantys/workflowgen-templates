export const ActionTypes = Object.freeze({
  BEGIN_FETCH: 'BEGIN_FETCH',
  END_FETCH: 'END_FETCH'
});

export const Reducers = Object.freeze({
  isFetching (state = false, action) {
    switch (action.type) {
      case ActionTypes.BEGIN_FETCH:
        return true;

      case ActionTypes.END_FETCH:
        return false;

      default:
        return state;
    }
  }
});
