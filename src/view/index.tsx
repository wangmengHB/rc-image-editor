import * as React from 'react';
import { Spin } from 'antd';
import Header from './header';
import ImageLayerList from './image-layer-list';
import WorkCanvas from './work-canvas';
import ImageDocxList from './image-docx-list';
import LayerController from '../controller/layer-controller';
import classnames from 'classnames';
import styles from './index.module.less';
import { ImageEditorConfig } from '../interface';
import IdocxJSONList from '../model/idocx-json-list';



export interface ImageEditorProps {
  className?: string;
  style?: React.CSSProperties;
  config: ImageEditorConfig;
  idocxList: any[];
  // fix the cross-origin image issue
  urlToBase64?: Function;
  // reduce the size of output url
  base64ToUrl?: Function;
}

export interface ImageEditorState {
  layerController: LayerController;
}


export default class ImageEditorView extends React.Component<ImageEditorProps, ImageEditorState> {

  constructor(props: ImageEditorProps) {
    super(props);
    const { config, idocxList, urlToBase64,  base64ToUrl} = props;
    const util = {
      urlToBase64,
      base64ToUrl,
    };
    const layerController = new LayerController(this, config, util);
    const imageDocxList = new IdocxJSONList(idocxList || []);
    layerController.idocxList = imageDocxList;
    this.state = {
      layerController,
    }
  }

  componentDidMount() {
    const { layerController } = this.state;
    const { idocxList } = layerController;
    if (idocxList && idocxList.list.length > 0 && !layerController.imageDocx) {
      layerController.loadIdocx(idocxList.list[0]);
    }
  }

  render() {
    const { className, style} = this.props;
    const { layerController } = this.state;
    
    return (
      <Spin spinning={layerController.loading} tip="处理中...">
        <div className={classnames([styles['image-editor'], className])} style={style}>
          <Header 
            className={styles['header']} 
            layerController={layerController}
          />
          <div className={styles['main']}>
            <ImageLayerList 
              className={styles['image-list']}
              layerController={layerController} 
            />
            <ImageDocxList 
              className={styles['doc-list']}
              layerController={layerController}
            />

            <WorkCanvas 
              className={styles['work-canvas']} 
              layerController={layerController}
            />

          </div>

        </div>
      </Spin>
    )

  }

}

