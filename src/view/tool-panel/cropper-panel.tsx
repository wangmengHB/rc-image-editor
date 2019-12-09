import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message, Button} from 'antd';
import classnames from 'classnames';
import { CanvasEditMode } from '../../const';
const styles = require('./index.module.less');


export interface CropperPanelProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
  onToggle: Function;
}

export default class CropperPanel extends React.Component<CropperPanelProps>{

  toggle = () => {
    const { onToggle } = this.props;
    if (typeof onToggle === 'function') {
      onToggle();
    }
  }

  doCrop = () => {
    const {layerController} = this.props;
    layerController.doCropAction();
  }


  render() {
    const { layerController } = this.props;
    const { left, top, width, height } = layerController.getCropperParam();



    return (
      <div className={styles['cropper-panel']}>
        <div className={styles['tool-header']}>
          <a onClick={this.toggle}><Icon type="arrow-left"/>收起</a>
          <span className={styles['tool-title']}>裁剪</span>
        </div>
        <Button type="primary" onClick={this.doCrop}>裁剪</Button>
        <div>裁剪参数</div>
        <div className={styles['cropper-param']}>
          <div className={styles['cropper-param-label']}>
            left:
          </div>
          <InputNumber 
            className={styles['cropper-param-value']}
            value={left}
          />
          <div className={styles['cropper-param-label']}>
            top:
          </div>
          <InputNumber 
            className={styles['cropper-param-value']}
            value={top}
          />
          <div className={styles['cropper-param-label']}>
            宽:
          </div>
          <InputNumber 
            className={styles['cropper-param-value']}
            value={width}
          />
          <div className={styles['cropper-param-label']}>
            高:
          </div>
          <InputNumber 
            className={styles['cropper-param-value']}
            value={height}
          />
          <div className={styles['cropper-param-label']}>
            目标宽:
          </div>
          <InputNumber 
            className={styles['cropper-param-value']}
          />
          <div className={styles['cropper-param-label']}>
            目标高:
          </div>
          <InputNumber 
            className={styles['cropper-param-value']}
          />
          
        </div>




      </div>
    );
  }

}