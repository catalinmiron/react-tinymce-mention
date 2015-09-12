import React from 'react';
import Editor from './components/Editor';
import Mention from '../Mention';

React.render(
  <div>
    <Editor />
    <Mention
      showDebugger={true}
      delimiter={'@'}
      dataSource={axios.get('/examples/shared/api/complex.json')}
      transformFn={dataSource => {
        return dataSource.data.map(result => {
          const { fullName } = result;
          return {
            searchKey: fullName,
            displayLabel: fullName
          };
        });
      }}
    />
  </div>
, document.getElementById('root'));