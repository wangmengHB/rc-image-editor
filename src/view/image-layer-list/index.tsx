import * as React from 'react';
import classnames from 'classnames';

const styles = require('./index.module.less');


export interface ImageLayerListProps{
  className?: string;
  style?: React.CSSProperties;
}



export default class ImageLayerList extends React.Component<ImageLayerListProps> {


  render() {
    const { className, style } = this.props;

    return (
      <div className={classnames([styles['image-layer-list'], className])} style={style}>
        <div className={styles['title']}>图层列表</div>
        <div>123</div>


      </div>
    )
  }


}

