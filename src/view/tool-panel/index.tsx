import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message} from 'antd';
import classnames from 'classnames';
import { fabric } from 'fabric';
import { CanvasEditMode } from '../../const';
const styles = require('./index.module.less');

const PERCENT = 100;

export interface ToolPanelProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}


export default class ToolPanel extends React.Component<ToolPanelProps> {

  changeMode = ({key}) => {
    const { layerController } = this.props;
    layerController.setEditMode(key);
  }

  onFilterChange = (type, val) => {
    const { layerController } = this.props;
    const target = layerController.getActiveObject();
    if (!target) {
      return message.error('请选择一个图层，再使用滤镜！');
    }

    if ( type === 'brightness') {
      target.filters[0].brightness = val; 
    }

    if (type === 'contrast') {
      target.filters[1].contrast = val;
    }

    if (type === 'hue') {
      target.filters[2].rotation = val;
    }

    if (type === 'saturation') {
      target.filters[3].saturation = val;
    }


    target.applyFilters();
    layerController.update();
  }

  createFilterImte = (
    title: string, 
    type: string, 
    value: number, 
    disabled: boolean = false,
    min: number = -1, 
    max: number = 1
  ) => {

    return (
      <div className={styles.filterItem}>
        <div className={styles.label}>
          <span>{title}</span>
          <InputNumber
            disabled={disabled}
            min={min * PERCENT}
            max={max * PERCENT}
            step={1}
            className={styles.inputNumber}
            value={parseInt(value * PERCENT as any)}
            onChange={(val:any) => this.onFilterChange(type, val/PERCENT)}
          />
        </div>
        <Slider
          disabled={disabled}
          min={min * PERCENT}
          max={max * PERCENT}
          onChange={(val:any) => this.onFilterChange(type, val/PERCENT)}
          value={value * PERCENT}
          style={{ margin: '5px', padding: '0'}}
        />
      </div>
    );
  }


  render() {
    const { className, style, layerController } = this.props;
    const editMode = layerController.editMode;
    let brightness = 0, contrast = 0, hue = 0, saturation = 0;
    let disabled = true;
    const target = layerController.getActiveObject();
    if (target) {
      disabled = false;
    }
    if (target && target.filters.length >= 4) {
      // todo get param from target
      brightness = target.filters[0].brightness;
      contrast = target.filters[1].contrast;
      hue = target.filters[2].rotation;
      saturation = target.filters[3].saturation;
    }



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
          <Menu.Item key={CanvasEditMode.Pencil}>
            <a
              className={classnames({[styles['active']]: editMode === CanvasEditMode.Pencil})}
            >
              画笔
            </a>
          </Menu.Item>
        </Menu>

        {
          editMode === CanvasEditMode.Filter? (
            <div className={styles['tool-filter']}>
              <span><Icon type="info" />请先选择图层</span>
              { this.createFilterImte('亮度', 'brightness', brightness, disabled) }
              { this.createFilterImte('对比度', 'contrast', contrast, disabled) }
              { this.createFilterImte('色调', 'hue', hue, disabled) }
              { this.createFilterImte('色彩饱和度', 'saturation', saturation, disabled) }
            </div>
          ): null
        }

      </div>
    )

  }

}