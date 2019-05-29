import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Reducers as FetchingReducers } from './fetching';
import { Reducers as UserReducers } from './user';

export function configureStore (initialState) {
  const reducers = {
    isFetching: FetchingReducers.isFetching,
    user: UserReducers.user,
    accessToken: UserReducers.accessToken
  };
  const middlewares = [
    thunkMiddleware
  ];
  const enhancers = [];
  const rootReducer = combineReducers({
    ...reducers
  });

  return createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(...middlewares), ...enhancers)
  );
}
