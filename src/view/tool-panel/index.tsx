import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message} from 'antd';
import classnames from 'classnames';
import { ViewMode } from '../../const';
import styles from './index.module.less';
import FilterPanel from './filter-panel';
import CropperPanel from './cropper-panel';


export interface ToolPanelProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}


export default class ToolPanel extends React.Component<ToolPanelProps> {

  state = {
    filterPanelVisible: false,
    cropperPanelVisible: false,
  }

  changeMode = ({key}) => {
    const { layerController } = this.props;
    const { filterPanelVisible, cropperPanelVisible } = this.state;
    layerController.setEditMode(key);
    if (key === ViewMode.Filter) {
      this.setState({filterPanelVisible: !filterPanelVisible})
    } else {
      this.setState({filterPanelVisible: false});
    }
    if (key === ViewMode.Crop) {
      this.setState({cropperPanelVisible: !cropperPanelVisible});
    } else {
      this.setState({cropperPanelVisible: false});
    }
  }

  
  render() {
    const { className, style, layerController } = this.props;
    const { filterPanelVisible, cropperPanelVisible } = this.state;
    const viewMode = layerController.viewMode;
    
    return (
      <div 
        className={classnames([styles['tool-panel'], className])} 
        style={style}
      >
        <Menu className={styles['menu']} onClick={this.changeMode}>
          <Menu.Item key={ViewMode.Pan}>
            <a 
              className={classnames({[styles['active']]: viewMode === ViewMode.Pan})}
            >
              移动
            </a>
          </Menu.Item>
          <Menu.Item key={ViewMode.Filter}>
            <a
              className={classnames({[styles['active']]: viewMode === ViewMode.Filter})}
            >
              滤镜
            </a>
          </Menu.Item>
          <Menu.Item key={ViewMode.Crop}>
            <a
              className={classnames({[styles['active']]: viewMode === ViewMode.Crop})}
            >
              裁剪
            </a>
          </Menu.Item>
          {/* <Menu.Item key={ViewMode.Pencil}>
            <a
              className={classnames({[styles['active']]: viewMode === ViewMode.Pencil})}
            >
              画笔
            </a>
          </Menu.Item> */}
        </Menu>

        {
          viewMode === ViewMode.Filter && filterPanelVisible? (
            <FilterPanel 
              layerController={layerController}
              onToggle={() => this.changeMode({key: ViewMode.Filter})}
            />
          ): null
        }

        {
          viewMode === ViewMode.Crop && cropperPanelVisible? (
            <CropperPanel 
              layerController={layerController} 
              onToggle={() => this.changeMode({key: ViewMode.Crop})}
            />
          ): null
        }

      </div>
    )

  }

}