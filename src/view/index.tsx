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
import { numbers, arrays, generateUuid, asyncs, objects, decorators } from 'util-kit';
import IdocxJSONList from '../model/idocx-json-list';



export interface ImageEditorProps {
  className?: string;
  style?: React.CSSProperties;
  config: ImageEditorConfig;
  idocxList: any[];
}

export interface ImageEditorState {
  layerController: LayerController;
  idocxList: IdocxJSONList;
}


export default class ImageEditorView extends React.Component<ImageEditorProps, ImageEditorState> {

  

  constructor(props: ImageEditorProps) {
    super(props);
    const { config, idocxList } = props;
    this.state = {
      layerController: new LayerController(this, config),
      idocxList: new IdocxJSONList(idocxList),
    }
  }



  render() {
    const { className, style} = this.props;
    const { layerController, idocxList } = this.state;

    return (
      <Spin spinning={layerController.loading} tip="处理中...">
        <div className={classnames([styles['image-editor'], className])} style={style}>
          <Header className={styles['header']} layerController={layerController}/>
          <div className={styles['main']}>
            <ImageLayerList 
              className={styles['image-list']}
              layerController={layerController} 
            />
            <ImageDocxList 
              className={styles['doc-list']}
              layerController={layerController}
              idocxList={idocxList}
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

