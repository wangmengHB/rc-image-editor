import * as React from 'react';
import { Button } from 'antd';
import classnames from 'classnames';
const styles = require('./index.module.less');


export interface ToolPanelProps{
  className?: string;
  style?: React.CSSProperties;
}


export default class ToolPanel extends React.Component<ToolPanelProps> {


  render() {
    const { className, style } = this.props;

    return (
      <div className={classnames([styles['tool-panel'], className])} style={style}>
        <Button>裁剪</Button>

      </div>
    )

  }

}