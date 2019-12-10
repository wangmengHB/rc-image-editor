import * as React from 'react';
import Header from './header';
import ImageLayerList from './image-layer-list';
import ToolPanel from './tool-panel';
import WorkCanvas from './work-canvas';
import LayerController from '../controller/LayerController';
import classnames from 'classnames';
import styles from './index.module.less';
import { ImageEditorConfig } from '../interface';



export interface ImageEditorProps {
  className?: string;
  style?: React.CSSProperties;
  config: ImageEditorConfig;
}

export interface ImageEditorState {
  layerController: LayerController;
}


export default class ImageEditorView extends React.Component<ImageEditorProps, ImageEditorState> {

  

  constructor(props: ImageEditorProps) {
    super(props);
    const { config } = props;

    this.state = {
      layerController: new LayerController(this, config),
    }
  }



  render() {
    const { className, style } = this.props;
    const { layerController } = this.state;

    return (
      <div className={classnames([styles['image-editor'], className])} style={style}>
        <Header className={styles['header']} layerController={layerController}/>
        <div className={styles['main']}>
          <ImageLayerList 
            className={styles['image-list']}
            layerController={layerController} 
          />
          {/* <ToolPanel 
            className={styles['tool-panel']}
            layerController={layerController} 
          /> */}

          <WorkCanvas 
            className={styles['work-canvas']} 
            layerController={layerController}
          />

        </div>

      </div>
    )

  }

}

