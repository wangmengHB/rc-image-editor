import * as React from 'react';
import { Button, Icon } from 'antd';
import 'antd/dist/antd.less';

const styles = require('./index.module.less');



export default class Header extends React.Component {



  render() {
    return (
      <div className={styles.header}>
        <Button type="primary">加载本地图片</Button>

      </div>
    )
  }

}
