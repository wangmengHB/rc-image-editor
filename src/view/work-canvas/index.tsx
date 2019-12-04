import * as React from 'react';
import classnames from 'classnames';
import {fabric} from 'fabric';
import { CANVAS_INIT_WIDTH, CANVAS_INIT_HEIGHT } from '../../const'
const styles = require('./index.module.less');

(window as any)._fabric = fabric;
console.log(Object.keys(fabric.Image.filters));

export interface CanvasSpaceProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}

export default class CanvasSpace extends React.Component<CanvasSpaceProps> {


  componentDidMount() {
    const { layerController } = this.props;

    const node = this.refs.mainCanvas;
    const workspaceNode = this.refs.workspace;
    if (!node) {
      throw new Error('failed to get canvas element!');
    }
    const fCanvas = new fabric.Canvas(node, {preserveObjectStacking: true});
    let webglBackend = new fabric.WebglFilterBackend();
    fabric.filterBackend = fabric.initFilterBackend();
    fabric.filterBackend = webglBackend;
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.padding = 5;
    (window as any)._c = fCanvas;
    layerController.init(fCanvas, workspaceNode);
  }

  render() {

    const { className, style } = this.props;

    return (
      <div className={classnames([styles['work-canvas'], className])} style={style}>
        <div ref="workspace" className={styles['canvas-zone']}>
          <canvas ref="mainCanvas" className={styles['canvas']} />
        </div>
      </div>
    )
  }


}