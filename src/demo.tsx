import 'antd/dist/antd.less';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

import ImageEditorView from './view';



const root = document.createElement('div');
document.body.appendChild(root);



const config = {
  forceCrop: false,

}





ReactDOM.render(
  <ImageEditorView style={{ height: 700}} config={config}/>,
  root
)