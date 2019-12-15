import * as React from 'react';
import { Button, Modal, Slider, InputNumber, Divider, Checkbox, message } from 'antd';
import { 
  MAX_CANVAS_PIXEL_SIZE, MAX_POS_VAL, MIN_POS_VAL,
  MIN_CANVAS_PIXEL_SIZE, 
  ViewMode,
} from '../../const';
import styles from './index.module.less';
import classnames from 'classnames';



export interface ImageDocxListProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}


export default class ImageDocxList extends React.Component<ImageDocxListProps>{




  render() {
    const { layerController, className, style } = this.props;

    return (
      <div className={classnames([styles['doc-list'], className])} style={style}>

      </div>
    )
  }

}