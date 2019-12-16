import 'babel-polyfill';
import 'antd/dist/antd.less';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

import ImageEditor from './view';
import { IMAGE_DOCX_LIST } from './mock/data';


const root = document.createElement('div');
document.body.appendChild(root);



const config = {
  forceCrop: true,
  allowAddLocalImage: false,

}




ReactDOM.render(
  <ImageEditor
    style={{ height: 700}} 
    config={config}
    idocxList={IMAGE_DOCX_LIST || []}
  />,
  root
)