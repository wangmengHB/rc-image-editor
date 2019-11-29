import * as React from 'react';
import { Button } from 'antd';
const styles = require('./index.module.less');


export default class ToolPanel extends React.Component {


  render() {

    return (
      <div className={styles['tool-panel']}>
        <Button> 裁剪</Button>

      </div>
    )

  }

}