import 'antd/dist/antd.less';
import * as React from 'react';
import Header from './header';

const styles = require('./index.module.less');





export default class ImageEditorView extends React.Component {



  render() {

    return (
      <div className={styles['image-editor']}>
        <Header/>
      </div>
    )

  }

}

