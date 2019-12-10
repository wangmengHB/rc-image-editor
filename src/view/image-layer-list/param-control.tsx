import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber, Tooltip } from 'antd';
import { Direction, MIN_SCALE, MIN_POS_VAL, MAX_POS_VAL, ViewMode } from '../../const';
import styles from './index.module.less';


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



  render() {
    const { isActive, item, layerController } = this.props;
    const { name, width, height, left, top, } = item;
    let scaleX = item.get('scaleX');
    let scaleY = item.get('scaleY');
    scaleX = scaleX <= MIN_SCALE? 0: scaleX;
    scaleY = scaleY <= MIN_SCALE? 0: scaleY;     


    return (
      <div className={styles['param-control']}>
        <div className={styles['param-item']}>
          <span className={styles['label']}>x:</span>
          <InputNumber 
            className={styles['value']}
            disabled={!isActive}
            precision={1}  
            value={left}
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
            value={top}
            precision={1}
            min={MIN_POS_VAL}
            max={MAX_POS_VAL}
            step={1}
            onChange={(val) => this.changeItemParam(val, 'top', item)} 
          />
        </div>
        <div className={styles['param-item']}>
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
        </div>
        <div className={styles['param-item']}>
          <span className={styles['label']}>缩放x:</span>
          <InputNumber 
            className={styles['value']} 
            disabled={!isActive} 
            value={scaleX}
            min={0.1}
            max={10}
            step={0.1}
            onChange={(val) => this.changeItemParam(val, 'scaleX', item)} 
          />
        </div>
        <div className={styles['param-item']}>
          <span className={styles['label']}>缩放y:</span>
          <InputNumber 
            className={styles['value']} 
            disabled={!isActive}
            value={scaleY}
            min={0.1}
            step={0.1}
            max={10}
            onChange={(val) => this.changeItemParam(val, 'scaleY', item)} 
          />     
        </div>
      </div>
    )

  }

}

