import 'antd/dist/antd.less';
import * as React from 'react';
import Header from './header';
import ImageLayerList from './image-layer-list';
import ToolPanel from './tool-panel';
import WorkCanvas from './work-canvas';


import LayerController from '../controller/LayerController';



const styles = require('./index.module.less');





export default class ImageEditorView extends React.Component {

  state = {
    layerController: new LayerController(),

  }


  render() {
    const { layerController } = this.state;


    return (
      <div className={styles['image-editor']}>
        <Header layerController={layerController}/>
        <div className={styles['main']}>
          <ImageLayerList className={styles['image-list']} />
          <ToolPanel className={styles['tool-panel']} />

          <WorkCanvas 
            className={styles['work-canvas']} 
            layerController={layerController}
          />


        </div>

      </div>
    )

  }

}

