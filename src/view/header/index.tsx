import * as React from 'react';
import { Button, Icon, Modal } from 'antd';


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
      content: (<img style={{maxWidth: 500}} src={base64}/>)
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


  render() {
    return (
      <div className={styles.header}>
        
        <Button className={styles['btn']} type="primary" onClick={this.openFileDialog}>加载本地图片</Button>
        <input ref="file" className={styles.file} type="file" accept="image" onChange={this.loadImage}/>
        <Button className={styles['btn']} type="primary" onClick={this.exportImage}>合成图片</Button>

      </div>
    )
  }

}
