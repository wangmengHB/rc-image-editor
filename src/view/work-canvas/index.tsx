import * as React from 'react';
import classnames from 'classnames';
import {fabric} from 'fabric';




const styles = require('./index.module.less');

export interface CanvasSpaceProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}

export default class CanvasSpace extends React.Component<CanvasSpaceProps> {


  componentDidMount() {
    const { layerController } = this.props;

    const node = this.refs.mainCanvas;
    if (!node) {
      throw new Error('failed to get canvas element!');
    }
    const fCanvas = new fabric.Canvas(node, {preserveObjectStacking: true});

    layerController.init(fCanvas);
  }

  render() {

    const { className, style } = this.props;

    return (
      <div className={classnames([styles['work-canvas'], className])} style={style}>
        <div className={styles['canvas-container']}>
          <canvas ref="mainCanvas" className={styles['canvas']} />
        </div>
      </div>
    )
  }


}