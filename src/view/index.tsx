import 'antd/dist/antd.less';
import * as React from 'react';
import Header from './header';
import ImageLayerList from './image-layer-list';
import ToolPanel from './tool-panel';
import WorkCanvas from './work-canvas';
import LayerController from '../controller/LayerController';
import classnames from 'classnames';
const styles = require('./index.module.less');



export interface ImageEditorProps{
  className?: string;
  style?: React.CSSProperties;
}





export default class ImageEditorView extends React.Component<ImageEditorProps> {

  state = {
    layerController: new LayerController(this),
  }


  render() {
    const { className, style } = this.props;
    const { layerController } = this.state;


    return (
      <div className={classnames([styles['image-editor'], className])} style={style}>
        <Header layerController={layerController}/>
        <div className={styles['main']}>
          <ImageLayerList 
            className={styles['image-list']}
            layerController={layerController} 
          />
          <ToolPanel 
            className={styles['tool-panel']}
            layerController={layerController} 
          />

          <WorkCanvas 
            className={styles['work-canvas']} 
            layerController={layerController}
          />

        </div>

      </div>
    )

  }

}

