import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message} from 'antd';
import classnames from 'classnames';
import { CanvasEditMode } from '../../const';
const styles = require('./index.module.less');

const PERCENT = 100;


export interface FilterPanelProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}


export default class FilterPanel extends React.Component<FilterPanelProps>{

  onFilterChange = (type, val) => {
    const { layerController } = this.props;
    const target = layerController.getActiveObject();
    if (!target || target.type !== 'image') {
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

  createFilterItem = (
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
          className={styles.slider}
          disabled={disabled}
          min={min * PERCENT}
          max={max * PERCENT}
          onChange={(val:any) => this.onFilterChange(type, val/PERCENT)}
          value={value * PERCENT}
        />
      </div>
    );
  }



  render() {
    const { layerController } = this.props;
    const editMode = layerController.editMode;
    let brightness = 0, contrast = 0, hue = 0, saturation = 0;
    let disabled = false;
    const target = layerController.getActiveObject();
    console.log('target', target);
    (window as any)._t = target;

    // if (!target || target.type !== 'image') {
    //   disabled = false;
    // }
    if (target && target.type === 'image' && target.filters.length >= 4) {
      // todo get param from target
      brightness = target.filters[0].brightness;
      contrast = target.filters[1].contrast;
      hue = target.filters[2].rotation;
      saturation = target.filters[3].saturation;
    } else {
      disabled = true;
    }

    console.log('disabled', disabled);
      


    return (
      <div className={styles['filter-panel']}>
        <span><Icon type="info-circle" />请先选择图层</span>
        { this.createFilterItem('亮度', 'brightness', brightness, disabled) }
        { this.createFilterItem('对比度', 'contrast', contrast, disabled) }
        { this.createFilterItem('色调', 'hue', hue, disabled) }
        { this.createFilterItem('色彩饱和度', 'saturation', saturation, disabled) }
      </div>
    )

  }

}