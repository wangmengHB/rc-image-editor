import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber } from 'antd';
import { Direction, MIN_SCALE, MIN_POS_VAL, MAX_POS_VAL } from '../../const';

const styles = require('./index.module.less');


export interface ImageLayerListProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}



export default class ImageLayerList extends React.Component<ImageLayerListProps> {

  move = (item, direction) => {
    if (direction === Direction.Up) {
      item.sendBackwards();
    } else if (direction === Direction.Down) {
      item.bringForward();
    }
    this.forceUpdate();
  }

  delete = (item) => {
    const { layerController } = this.props;
    layerController.delete(item);
    this.forceUpdate();
  }

  setActive = (item) => {
    const { layerController } = this.props;
    layerController.setActiveObject(item);
  }

  changeItemParam = (value, type, item) => {
    const { layerController } = this.props;
    const num = parseFloat(value) || 0;
    item.set(type, num);
    layerController.update();
  }

  renderItem = (item) => {
    const { layerController } = this.props;
    const ele = item.getElement();   
    const { name, width, height, left, top, } = item;
    let scaleX = item.get('scaleX');
    let scaleY = item.get('scaleY');
    scaleX = scaleX <= MIN_SCALE? 0: scaleX;
    scaleY = scaleY <= MIN_SCALE? 0: scaleY; 

    
    const isActive = item === layerController.getActiveObject(); 
    return (
      <div className={classnames({[styles['item']]: true, [styles['active']]: isActive})} key={`thunb-${item.name}`}>
        <div className={styles['name']}>
          <span>名称:</span>
          {name}   
        </div>
        <div className={styles['action']}>
          
          <Button 
            className={styles['actionBtn']}
            disabled={!isActive} 
            onClick={() => this.move(item, Direction.Up)}
          >
            <Icon type="caret-up" theme="filled"/>
          </Button>
          <Button 
            className={styles['actionBtn']}
            disabled={!isActive}  
            onClick={() => this.move(item, Direction.Down)}
          >
            <Icon type="caret-down" theme="filled"/>
          </Button>
          <Button 
            className={styles['actionBtn']} 
            disabled={!isActive} 
            onClick={() => this.delete(item)}
          >
            <Icon type="delete" theme="filled"/>
          </Button>
        </div>
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
        <div 
          className={classnames({[styles['thunb-container']]: true, })}
          onClick={() => this.setActive(item)}
          ref={(node) => {
            if (node) {
              node.innerHTML = null;
              (node as HTMLElement).appendChild(ele)
            }
          }}
        />
      </div>
    );
  }

  render() {
    const { className, style, layerController } = this.props;

    const list = layerController.getAllLayers();

    console.log('rendered');
    
    return (
      <div className={classnames([styles['image-layer-list'], className])} style={style}>
        <div className={styles['title']}>图层列表</div>
        <div className={styles['list']}>
          {
            list.map(this.renderItem)
          }
        </div>
      </div>
    )
  }


}

