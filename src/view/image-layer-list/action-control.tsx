import * as React from 'react';
import classnames from 'classnames';
import { Icon, Button, Input, InputNumber, Tooltip, Popover, Popconfirm } from 'antd';
import { Direction, MIN_SCALE, MIN_POS_VAL, MAX_POS_VAL, ViewMode } from '../../const';
import styles from './index.module.less';
import FilterPanel from './filter-panel';


export interface ActionControlProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
  item: any;
  isActive: boolean;
}


export default class ActionControl extends React.Component<ActionControlProps> {

  state = {
    filterPanelVisible: false,
  }

  toggleFilter = () => {
    const { filterPanelVisible } = this.state;
    this.setState({ filterPanelVisible: !filterPanelVisible});
  }


  move = (direction) => {
    const { layerController, item } = this.props;
    if (direction === Direction.Up) {
      item.sendBackwards();
    } else if (direction === Direction.Down) {
      item.bringForward();
    }
    layerController.update();
  }

  delete = () => {
    const { layerController, item } = this.props;
    layerController.delete(item);
    layerController.update();
  }


  render() {
    const { isActive, layerController, item } = this.props;
    const { filterPanelVisible } = this.state;
    const allLayers = layerController.getAllLayers();
    const index = allLayers.findIndex(sub => sub === item);

    const upBtnDisabled = !isActive || index === 0;
    const downBtnDisabled = !isActive || index === allLayers.length - 1;




    return (
      <div className={styles['action']}>
        <Tooltip title="向底层移动">
          <Button 
            className={styles['actionBtn']}
            disabled={upBtnDisabled} 
            onClick={() => this.move(Direction.Up)}
          >
            <Icon type="caret-up" theme="filled"/>
          </Button>
        </Tooltip>
        <Tooltip title="向顶层移动">
          <Button
            className={styles['actionBtn']}
            disabled={downBtnDisabled}  
            onClick={() => this.move(Direction.Down)}
          >
            <Icon type="caret-down" theme="filled"/>
          </Button>  
        </Tooltip>

        <Popover
          content={<FilterPanel layerController={layerController} item={item} />}
          title="滤镜"
          trigger="click"
          visible={filterPanelVisible}
          onVisibleChange={(val) => isActive && this.setState({filterPanelVisible: val})}
        >
          <Tooltip title="滤镜">
            <Button 
              className={styles['actionBtn']}
              disabled={!isActive}
              onClick={this.toggleFilter}
            >
              <Icon type="control" theme="filled" />
            </Button>
          </Tooltip>
        </Popover>

        <Tooltip title="图层画笔功能正在开发中。。。">
          <Button 
            className={styles['actionBtn']}
            // disabled={!isActive} 
            disabled
          >
            <Icon type="edit" theme="filled" />
          </Button>
        </Tooltip>

        <Popconfirm
          title="删除行为不可恢复，是否要删除该图层?"
          onConfirm={this.delete}
          okText="删除"
          cancelText="取消"
          disabled={!isActive}
        >
          <Tooltip title="删除">
            <Button
              className={styles['actionBtn']} 
              disabled={!isActive}
            >
              <Icon type="delete" theme="filled"/>
            </Button>
          </Tooltip>
        </Popconfirm>
             
      </div>
    )

  }


}