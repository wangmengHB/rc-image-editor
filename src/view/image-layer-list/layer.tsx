import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber, Tooltip } from 'antd';
import { Direction, MIN_SCALE, MIN_POS_VAL, MAX_POS_VAL, ViewMode } from '../../const';
import styles from './index.module.less';
import ActionControl from './action-control';
import ParamControl from './param-control';

export interface LayerProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
  item: any;
}


export default class Layer extends React.Component<LayerProps>{


  

  setActive = (item, e) => {
    const { layerController } = this.props;
    const viewMode = layerController.viewMode;
    e.preventDefault();
    e.stopPropagation();

    if (viewMode === ViewMode.Normal) {
      layerController.setActiveObject(item);
    }
    
  }

  

  render() {
    const { layerController, item } = this.props;
    const ele = item.getElement();   
    const { name } = item;
    
    const isActive = item === layerController.getActiveObject(); 
    return (
      <div 
        className={classnames({[styles['item']]: true, [styles['active']]: isActive})} 
      >
        <div className={styles['preview']}>
          <div
            onClick={(e) => this.setActive(item, e)} 
            className={classnames({[styles['thunb-container']]: true, })}
            ref={(node: HTMLElement | null) => {
              if (node) {
                node.innerHTML = '';
                node.appendChild(ele)
              }
            }}
          />
          <div className={styles['info']}>
            { name? (
                <div>
                  <span>名称:</span>
                  <span>{name}</span>
                </div>
              ): null
            }            
          </div>   
        </div>
        <ActionControl isActive={isActive} item={item} layerController={layerController} />
        <ParamControl isActive={isActive} item={item} layerController={layerController}/>
        
        
      </div>
    );
  }
  

}