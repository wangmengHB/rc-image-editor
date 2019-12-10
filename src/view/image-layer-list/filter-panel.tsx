import * as React from 'react';
import { Icon, Menu, InputNumber,  Slider, message} from 'antd';
import classnames from 'classnames';
import { ViewMode } from '../../const';
import styles from './index.module.less';

const PERCENT = 100;


export interface FilterPanelProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
  item: any;
}


export default class FilterPanel extends React.Component<FilterPanelProps>{
  
  onFilterChange = (type, val) => {
    const { layerController, item } = this.props;
    
    if (!item || item.type !== 'image') {
      return message.error('请选择一个图层，再使用滤镜！');
    }

    if ( type === 'brightness') {
      item.filters[0].brightness = val; 
    }

    if (type === 'contrast') {
      item.filters[1].contrast = val;
    }

    if (type === 'hue') {
      item.filters[2].rotation = val;
    }

    if (type === 'saturation') {
      item.filters[3].saturation = val;
    }

    item.applyFilters();
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
    const { layerController, item } = this.props;
    let brightness = 0, contrast = 0, hue = 0, saturation = 0;
    let disabled = false;
    
    if (item && item.type === 'image' && item.filters.length >= 4) {
      // todo get param from target
      brightness = item.filters[0].brightness;
      contrast = item.filters[1].contrast;
      hue = item.filters[2].rotation;
      saturation = item.filters[3].saturation;
    } else {
      disabled = true;
    }

    
    return (
      <div className={styles['filter-panel']}>
        { this.createFilterItem('亮度', 'brightness', brightness, disabled) }
        { this.createFilterItem('对比度', 'contrast', contrast, disabled) }
        { this.createFilterItem('色调', 'hue', hue, disabled) }
        { this.createFilterItem('色彩饱和度', 'saturation', saturation, disabled) }
      </div>
    )

  }

}