import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { initializePlugin } from '../plugin';
import mentionReducer from '../reducers/mentionReducer';
import dataSourceStatic from '../reducers/__tests__/fixtures/dataSourceStatic';
import initializeEditor from './fixtures/initializeEditor';
import { query, resetQuery, select, finalizeSetup } from '../actions/mentionActions';
import { removeMention } from '../utils/tinyMCEUtils';
import { testExports } from '../plugin';

const {
  _performIntermediateActions,
  _isNearMention,
  _removeMentionFromEditor,
  _handleKeyPress,
  _handleEditorBackspace,
} = testExports;

describe('TinyMCE Plugin', () => {
  var store, tinymce, editor;

  const getState = () => store.getState();

  beforeEach((done) => {
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

    store = createStoreWithMiddleware(mentionReducer, {
      dataSource: dataSourceStatic,
      highlightIndex: 0,
      mentions: [],
      query: ''
    });

    tinymce = initializeEditor();
    initializePlugin(store, dataSourceStatic, '@');

    setTimeout(() => {
      editor = tinymce.activeEditor;
      done();
    }, 10);
  });

  afterEach(() => {
    store = null;
    editor = null;
  });

  // _testFunction
  it('should be tested', () => {
    expect(getState().dataSource[0]).toEqual('alex gray');
  });

  // _isNearMention
  it('should be near mentions from the editor', () => {
    const str = 'Hello there @jim and @john';
    expect(_isNearMention(str).toString()).toEqual('@john');
  });

  // _removeMentionFromEditor
  it('should remove mention from the Editor', () => {
    store.dispatch(query('eric'));
    store.dispatch(select());

    var mentionNode = document.createElement('strong');
    const node = document.createTextNode('@eric kong');
    mentionNode.appendChild(node);
    expect(_removeMentionFromEditor(mentionNode)).toEqual('eric kong');

    store.dispatch(query('tim'));
    store.dispatch(select());

    var mentionNode2 = document.createElement('p');
    const node2 = document.createTextNode('@timothy meaney');
    mentionNode2.appendChild(node2);
    expect(_removeMentionFromEditor(mentionNode2)).toEqual('timothy meaney');
  });

  // _handleEditorBackspace
  it('should handle backspace presses & reset the current query', () => {

    var mentionNode = document.createElement('strong');
    const node = document.createTextNode('@eric kong');
    mentionNode.appendChild(node);
    mentionNode.className = 'mention';
    editor.selection = mentionNode;

    editor.setContent(mentionNode.innerHTML);
    console.log(editor.getContent());

    editor.selection.getNode = function(){
      return editor.selection;
    };
    // console.log(editor.selection);
    _handleEditorBackspace({keyCode: 8});

    expect(editor.getContent()).toEqual('');
  });

  // _performIntermediateActions
  // it('should validate key-presses and checks for intermediate actions', () => {
  //   store.dispatch(query('eric'));
  //   store.dispatch(_performIntermediateActions(13, event));
  //   expect(getState().query).toEqual('eric');
  //
  // });

  // _handleKeyPress
  // it('should parse input & dispatch queries from internal key-presses', (done) => {
  //
  //
  //   done();
  // });
});
