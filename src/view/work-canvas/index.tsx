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
    const workspaceNode = this.refs.workspace;
    if (!workspaceNode) {
      throw new Error('failed to get canvas element!');
    }
    console.log(layerController.fCanvas);
    (workspaceNode as any).appendChild(layerController.fCanvas.wrapperEl);
    layerController.registerContainer(workspaceNode);
  }

  render() {

    const { className, style } = this.props;

    return (
      <div className={classnames([styles['work-canvas'], className])} style={style}>
        <div ref="workspace" className={styles['canvas-zone']}></div>
      </div>
    )
  }


}