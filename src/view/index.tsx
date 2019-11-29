import 'antd/dist/antd.less';
import * as React from 'react';
import Header from './header';
import ImageLayerList from './image-layer-list';
import ToolPanel from './tool-panel';
import WorkCanvas from './work-canvas';

const styles = require('./index.module.less');





export default class ImageEditorView extends React.Component {



  render() {

    return (
      <div className={styles['image-editor']}>
        <Header/>
        <div className={styles['main']}>
          <ImageLayerList className={styles['image-list']} />
          <ToolPanel className={styles['tool-panel']} />

          <WorkCanvas className={styles['work-canvas']} />


        </div>

      </div>
    )

  }

}

