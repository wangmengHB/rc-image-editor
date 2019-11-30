import * as React from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import { Direction } from '../../const';

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


  renderItem = (item) => {
    const base64 = item.getElement().src;
    const name = item.name;  
    return (
      <div className={styles['item']} key={`thunb-${item.name}`}>
        <div className={styles['name']}>
          {name}
          <a onClick={() => this.move(item, Direction.Up)}><Icon type="up" /></a>
          <a onClick={() => this.move(item, Direction.Down)}><Icon type="down" /></a>
          <a onClick={() => this.delete(item)}><Icon type="delete" /></a>
        </div>
        <img className={styles['thunbnail']} src={base64}/>
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

