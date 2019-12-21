import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber, Slider } from 'antd';
import { Direction, MIN_SCALE, MIN_POS_VAL, MAX_POS_VAL, ViewMode } from '../../const';
import styles from './index.module.less';

const MIN = 0.1;
const MAX = 6;
const PERCENT = 100;


export interface ParamControlProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
  item: any;
  isActive: boolean;
}


export default class ParamControl extends React.Component<ParamControlProps> {

  changeItemParam = (value, type, item) => {
    const { layerController } = this.props;
    const num = parseFloat(value) || 0;
    item.set(type, num);
    layerController.update();
  }

  setScale = (val, item) => {
    const { layerController } = this.props;
    const num = parseFloat(val) || 1;
    item.scale(num);
    layerController.update();
  }


  render() {
    const { isActive, item, layerController } = this.props;
    const { name, width, height, left, top, } = item;
    let scale = item.get('scaleX') || 1;
    
    return (
      <div className={styles['param-control']}>
        <div className={styles['param-item']}>
          <span className={styles['label']}>x:</span>
          <InputNumber 
            className={styles['value']}
            disabled={!isActive}  
            value={Math.floor(left)}
            min={MIN_POS_VAL}
            max={MAX_POS_VAL}
            step={1}
            onChange={(val) => this.changeItemParam(val, 'left', item)} 
          />
        </div>
        <div className={styles['param-item']}>
          <span className={styles['label']}>y:</span>
          <InputNumber 
            className={styles['value']} 
            disabled={!isActive} 
            value={Math.floor(top)}    
            min={MIN_POS_VAL}
            max={MAX_POS_VAL}
            step={1}
            onChange={(val) => this.changeItemParam(val, 'top', item)} 
          />
        </div>
        {/* <div className={styles['param-item']}>
          <span className={styles['label']}>宽:</span>
          <InputNumber 
            className={styles['value']} 
            disabled={!isActive} 
            precision={1}
            value={width}
            min={MIN_POS_VAL}
            max={MAX_POS_VAL}
            step={1}
            onChange={(val) => this.changeItemParam(val, 'width', item)} 
          />
        </div>
        <div className={styles['param-item']}>
          <span className={styles['label']}>高:</span>
          <InputNumber 
            className={styles['value']} 
            disabled={!isActive}
            precision={1} 
            value={height}
            min={MIN_POS_VAL}
            max={MAX_POS_VAL}
            step={1}
            onChange={(val) => this.changeItemParam(val, 'height', item)} 
          />
        </div> */}
        
        <div className={styles['scale-ctrl']}>
          <div className={styles['label']}>缩放:</div>
          <Slider
            disabled={!isActive}
            className={styles['slider']}
            min={MIN * PERCENT}
            max={MAX * PERCENT}
            onChange={(val:any) => this.setScale(val/PERCENT, item)}
            value={scale * PERCENT}
          />
          <div className={styles['percent']}>{`${parseInt(scale * PERCENT as any)} %`}</div>

        </div>




      </div>
    )

  }

}

