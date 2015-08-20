import React, { PropTypes } from 'react';
import invariant from 'invariant';
import { Provider } from 'react-redux';
import { initializePlugin } from './plugin';
import initializeRedux from './utils/initializeRedux';
import normalizeDataSource from './utils/normalizeDataSource';
import { finalizeSetup } from './actions/mentionActions';
import mentionReducer from './reducers/mentionReducer';
import TinyMCEDelegate from './components/TinyMCEDelegate';
import SuggestionRenderer from './components/SuggestionRenderer';
import MentionsDebugger from './components/MentionsDebugger';

const store = initializeRedux({
  mention: mentionReducer
});

export default class Mention {

  static propTypes = {
    dataSource: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func,
      PropTypes.object
    ]).isRequired,
    customRenderer: React.PropTypes.func,
    delimiter: PropTypes.string,
    onAdd: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    transformFn: PropTypes.func
  }

  componentDidMount() {
    const { dataSource, delimiter } = this.props;

    initializePlugin(store, dataSource, delimiter, ::this._transformAndDispatch);
  }

  _transformResponse(resolvedDataSource) {
    const { transformFn } = this.props;
    const isFunc = typeof transformFn === 'function';

    invariant(isFunc || typeof transformFn === 'undefined',
      'Error initializing plugin: `transformFn` must be a function.'
    );

    const transformedDataSource = isFunc
      ? transformFn(resolvedDataSource)
      : resolvedDataSource;

    return normalizeDataSource(transformedDataSource);
  }

  _transformAndDispatch({ editor, resolvedDataSource }) {
    const { dataSource } = this._transformResponse(resolvedDataSource);
    store.dispatch(finalizeSetup(editor, dataSource));
  }

  render() {
    const { customRenderer, onAdd, onRemove } = this.props;

    const showDebugger = false;

    return (
      <Provider store={store}>{() =>
        <div>
          <SuggestionRenderer
            customRenderer={customRenderer}
          />
          <TinyMCEDelegate
            onAdd={onAdd}
            onRemove={onRemove}
          />
          { showDebugger &&
            <MentionsDebugger /> }
        </div>
      }</Provider>
    );
  }
}
