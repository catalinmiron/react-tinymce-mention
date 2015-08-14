import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import mentionReducer from 'mention/reducers/mentionReducer';
import dataSourceStatic from './fixtures/dataSourceStatic';

import {
  moveDown,
  moveUp,
  query,
  remove,
  resetMentions,
  resetQuery,
  select,
} from 'mention/actions/mentionActions';

describe('mentionReducer', () => {
  var store;
  const getState = () => store.getState();

  beforeEach(() => {
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

    store = createStoreWithMiddleware(mentionReducer, {
      dataSource: dataSourceStatic,
      highlightIndex: 0,
      mentions: [],
      query: ''
    });
  });

  it('should update the current lookup query', () => {
    store.dispatch(query('alex'));
    expect(getState().query).toBe('alex');
    expect(getState().matchedSources).toEqual([
      'alex gray',
      'alex gutierrez',
      'alexandra spell',
    ]);

    store.dispatch(query('chris'));
    expect(getState().matchedSources).toEqual([
      'chris pappas',
      'christopher pappas',
    ]);

    store.dispatch(query(''));
    expect(getState().matchedSources).toEqual([]);

    store.dispatch(query('c'));
    store.dispatch(query('h'));
    store.dispatch(query('r'));
    expect(getState().matchedSources).toEqual([
      'chris pappas',
      'christopher pappas',
    ]);
  });

  it('should reset the lookup query', () => {
    store.dispatch(query('alex'));
    expect(getState().matchedSources).toEqual([
      'alex gray',
      'alex gutierrez',
      'alexandra spell'
    ]);

    store.dispatch(resetQuery());
    expect(getState().matchedSources).toEqual([]);
  });

  it('should select the currently highlighted item', () => {
    store.dispatch(query('k'));
    store.dispatch(moveDown());
    expect(getState().highlightIndex).toBe(1)
    store.dispatch(moveDown());
    expect(getState().highlightIndex).toBe(2)
    store.dispatch(select());
    expect(getState().selectedItem).toEqual('garrett kalleberg');
    store.dispatch(query('ka'));
    store.dispatch(moveUp());
    store.dispatch(select());
    expect(getState().selectedItem).toEqual('katy curtis');
  });

  it('should move the highlighter down', () => {
    store.dispatch(query('ka'));
    expect(getState().matchedSources).toEqual([
      'garrett kalleberg',
      'katherine curtis',
      'katy curtis'
    ]);
    // console.log(getState().highlightIndex);

    store.dispatch(moveDown());
    expect(getState().highlightIndex).toBe(1);
    store.dispatch(moveDown());
    store.dispatch(moveDown());
    expect(getState().highlightIndex).toBe(0);
    store.dispatch(moveDown());
    expect(getState().highlightIndex).toBe(1);
  });

  it('should move the highlighter up', () => {
    store.dispatch(query('ka'));
    expect(getState().matchedSources).toEqual([
      'garrett kalleberg',
      'katherine curtis',
      'katy curtis'
    ]);

    store.dispatch(moveUp());
    expect(getState().highlightIndex).toBe(2);
    store.dispatch(moveUp());
    store.dispatch(moveUp());
    expect(getState().highlightIndex).toBe(0);
    store.dispatch(moveUp());
    expect(getState().highlightIndex).toBe(2);
  });

  it('should remove the selected item if no characters match from query', function() {
    store.dispatch(query('kalleberg'));
    expect(getState().matchedSources).toEqual([
      'garrett kalleberg'
    ]);

    store.dispatch(select());
    expect(getState().selectedItem).toEqual('garrett kalleberg');
    expect(getState().mentions).toEqual([
      'garrett kalleberg'
    ]);

    store.dispatch(query('chris'));
    expect(getState().matchedSources).toEqual([
      'chris pappas',
      'christopher pappas'
    ]);

    store.dispatch(moveDown());
    store.dispatch(select());
    expect(getState().mentions).toEqual([
      'garrett kalleberg',
      'christopher pappas'
    ]);

    store.dispatch(remove('christopher pappas'));
    expect(getState().mentions).toEqual([
      'garrett kalleberg'
    ]);

    store.dispatch(remove('garrett kalleberg'));
    expect(getState().mentions).toEqual([]);
  });

  it('should reset mentions', () => {
    store.dispatch(query('chris'));
    expect(getState().matchedSources).toEqual([
      'chris pappas',
      'christopher pappas',
    ]);

    store.dispatch(resetMentions());
    expect(getState().mentions).toEqual([]);
    expect(getState().matchedSources).toEqual([]);
    expect(getState().query).toEqual('');
  })

});
