import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber } from 'antd';
import { Direction, MIN_SCALE } from '../../const';

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
    
    const {name, width, height, left, top, } = item;
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
        <div className={styles['param']}>
          <span className={styles['label']}>x:</span>
          <Input 
            className={styles['value']}
            disabled={!isActive}  
            value={left}
            onChange={(e) => this.changeItemParam(e.target.value, 'left', item)} 
          />
          <span className={styles['label']}>y:</span>
          <Input 
            className={styles['value']} 
            disabled={!isActive} 
            value={top}
            onChange={(e) => this.changeItemParam(e.target.value, 'top', item)} 
          />
        </div>
        <div className={styles['param']}>
          <span className={styles['label']}>宽:</span>
          <Input 
            className={styles['value']} 
            disabled={!isActive} 
            value={width}
            onChange={(e) => this.changeItemParam(e.target.value, 'width', item)} 
          />
          <span className={styles['label']}>高:</span>
          <Input 
            className={styles['value']} 
            disabled={!isActive} 
            value={height}
            onChange={(e) => this.changeItemParam(e.target.value, 'height', item)} 
          />
        </div>
        <div className={styles['param']}>
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
              for (let i = node.children.length - 1; i >= 0; i--) {
                const child = node.children[i];
                node.removeChild(child);
              }
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

