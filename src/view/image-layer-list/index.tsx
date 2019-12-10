import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber } from 'antd';
import { Direction, MIN_SCALE, MIN_POS_VAL, MAX_POS_VAL, ViewMode } from '../../const';
import styles from './index.module.less';
import Layer from './layer';


export interface ImageLayerListProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}



export default class ImageLayerList extends React.Component<ImageLayerListProps> {

  

  render() {
    const { className, style, layerController } = this.props;
    const list = layerController.getAllLayers();
  
    return (
      <div className={classnames([styles['image-layer-list'], className])} style={style}>
        <div className={styles['title']}>
          图层列表 
          <span className={styles['sub-title']}>(从底到顶排序)</span>
        </div>
        <div className={styles['list']}>
          {
            list.map(item => (<Layer key={item.uid} item={item} layerController={layerController} />))
          }
        </div>
      </div>
    )
  }


}

