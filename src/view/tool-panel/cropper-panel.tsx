import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message} from 'antd';
import classnames from 'classnames';
import { CanvasEditMode } from '../../const';
const styles = require('./index.module.less');


export interface CropperPanelProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}

export default class CropperPanel extends React.Component<CropperPanelProps>{


  render() {

    return (
      <div className={styles['cropper-panel']}>
        裁剪配置项
      </div>
    );
  }

}