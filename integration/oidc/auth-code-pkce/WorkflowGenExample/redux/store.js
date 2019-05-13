import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Reducers as FetchingReducers } from './fetching';

export function configureStore (initialState) {
  const reducers = {
    isFetching: FetchingReducers.isFetching
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
