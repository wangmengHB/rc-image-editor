import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message} from 'antd';
import classnames from 'classnames';
import { CanvasEditMode } from '../../const';
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
    if (key === CanvasEditMode.Filter) {
      this.setState({filterPanelVisible: !filterPanelVisible})
    } else {
      this.setState({filterPanelVisible: false});
    }
    if (key === CanvasEditMode.Crop) {
      this.setState({cropperPanelVisible: !cropperPanelVisible});
    } else {
      this.setState({cropperPanelVisible: false});
    }
  }

  
  render() {
    const { className, style, layerController } = this.props;
    const { filterPanelVisible, cropperPanelVisible } = this.state;
    const editMode = layerController.editMode;
    
    return (
      <div 
        className={classnames([styles['tool-panel'], className])} 
        style={style}
      >
        <Menu className={styles['menu']} onClick={this.changeMode}>
          <Menu.Item key={CanvasEditMode.Pan}>
            <a 
              className={classnames({[styles['active']]: editMode === CanvasEditMode.Pan})}
            >
              移动
            </a>
          </Menu.Item>
          <Menu.Item key={CanvasEditMode.Filter}>
            <a
              className={classnames({[styles['active']]: editMode === CanvasEditMode.Filter})}
            >
              滤镜
            </a>
          </Menu.Item>
          <Menu.Item key={CanvasEditMode.Crop}>
            <a
              className={classnames({[styles['active']]: editMode === CanvasEditMode.Crop})}
            >
              裁剪
            </a>
          </Menu.Item>
          {/* <Menu.Item key={CanvasEditMode.Pencil}>
            <a
              className={classnames({[styles['active']]: editMode === CanvasEditMode.Pencil})}
            >
              画笔
            </a>
          </Menu.Item> */}
        </Menu>

        {
          editMode === CanvasEditMode.Filter && filterPanelVisible? (
            <FilterPanel 
              layerController={layerController}
              onToggle={() => this.changeMode({key: CanvasEditMode.Filter})}
            />
          ): null
        }

        {
          editMode === CanvasEditMode.Crop && cropperPanelVisible? (
            <CropperPanel 
              layerController={layerController} 
              onToggle={() => this.changeMode({key: CanvasEditMode.Crop})}
            />
          ): null
        }

      </div>
    )

  }

}