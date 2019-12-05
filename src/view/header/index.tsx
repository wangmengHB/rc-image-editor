import * as React from 'react';
import { Button, Icon, Modal, Slider, InputNumber } from 'antd';
import { MAX_CANVAS_PIXEL_SIZE, MIN_CANVAS_PIXEL_SIZE } from '../../const';

const PERCENT = 100;
const MIN = 0.1;
const MAX = 1;


const styles = require('./index.module.less');

export interface HeaderProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}

export default class Header extends React.Component<HeaderProps> {

  exportImage = () => {
    const { layerController } = this.props;
    const base64 = layerController.fCanvas.toDataURL();
    Modal.confirm({
      title: '预览',
      width: 600,
      content: (<img style={{maxWidth: 500, border: '1px solid red'}} src={base64}/>)
    })
  }


  loadImage = e => {
    const { layerController } = this.props;
    const reader = new FileReader();
    const filename = e.target.files[0].name;
    reader.onload = (e) => {
      const base64: any = e.target.result;    
      const image = new Image();
      image.onload = () => {
        const width = image.width;
        const height = image.height;

        console.log(filename, width, height);
        layerController.addImage(image, filename, width, height);
        (this.refs.file as any).value = null;
      }
      image.src = base64;
    };
    reader.readAsDataURL(e.target.files[0]);
    (window as any).fi = this.refs.file; 
  }

  openFileDialog = () => {
    (this.refs.file as any).click();
  }

  changeZoom = (val) => {
    const { layerController } = this.props;
    layerController.setScale(val);
    this.forceUpdate();
  }

  changeDimension = (type, val) => {
    const { layerController } = this.props;
    layerController.changeDimension(type, val);
  }

  render() {    
    const { layerController } = this.props;
    let zoom = layerController.scale;
    if (typeof zoom !== 'number') {
      zoom = 1;
    }
    const [width, height] = layerController.getSize();
    
    return (
      <div className={styles.header}>
        
        <Button className={styles['btn']} type="primary" onClick={this.openFileDialog}>加载本地图片</Button>
        <input ref="file" className={styles.file} type="file" accept="image" onChange={this.loadImage}/>
        <Button className={styles['btn']} type="primary" onClick={this.exportImage}>合成图片</Button>

        <div className={styles['control']}>
          <div className={styles['label']}>画布宽度:</div>
          <InputNumber 
            className={styles['value']}
            step={1}
            min={MIN_CANVAS_PIXEL_SIZE}
            max={MAX_CANVAS_PIXEL_SIZE}
            value={width}
            onChange={val => this.changeDimension('width', val)}
          />
          <div className={styles['label']}>画布高度:</div>
          <InputNumber 
            className={styles['value']}
            step={1}
            min={MIN_CANVAS_PIXEL_SIZE}
            max={MAX_CANVAS_PIXEL_SIZE}
            value={height}
            onChange={val => this.changeDimension('height', val)}
          />

          <div className={styles['label']}>画布缩放:</div>
          <Slider
            className={styles['slider']}
            min={MIN * PERCENT}
            max={MAX * PERCENT}
            onChange={(val:any) => this.changeZoom(val/PERCENT)}
            value={zoom * PERCENT}
          />
          <div className={styles['percent']}>{`${parseInt(zoom * PERCENT as any)} %`}</div>
        </div>

      </div>
    )
  }

}
