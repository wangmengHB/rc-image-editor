import * as React from 'react';
import { Button, Modal, Slider, InputNumber, Divider, Checkbox, message } from 'antd';
import { 
  MAX_CANVAS_PIXEL_SIZE, MAX_POS_VAL, MIN_POS_VAL,
  MIN_CANVAS_PIXEL_SIZE, 
  ViewMode,
} from '../../const';
import styles from './index.module.less';
import classnames from 'classnames';
import '../../mock/data';


const PERCENT = 100;
const MIN = 0.1;
const MAX = 1;
const PARAM_ITEM_WIDTH = 100;


let test;



export interface HeaderProps{
  className?: string;
  style?: React.CSSProperties;
  layerController: any;
}

export default class Header extends React.Component<HeaderProps> {

  changeMode = e => {
    const checked = e.target.checked;
    const { layerController } = this.props;  
    if (checked) {
      layerController.setViewMode(ViewMode.Crop);
    } else {
      layerController.setViewMode(ViewMode.Normal);
    }
  }

  enableCropper = e => {
    const checked = e.target.checked;
    const { layerController } = this.props;
    const res = layerController.enableCropper(checked);
    if (!res) {
      message.error('当前没有图片！')
    }
  }

  setCropperParam = (type, val) => {
    const { layerController } = this.props;
    layerController.setCropperParam(type, val);
  }


  exportImage = () => {
    const { layerController } = this.props;
    layerController.exportImage().then(({base64, width, height}) => {
      Modal.confirm({
        title: '预览',
        width: 600,
        content: (
          <div>
            <div>图片尺寸: {`${width} * ${height}`}</div>
            <img style={{maxWidth: 500, border: '1px solid black'}} src={base64}/>
          </div>
        )
      })
    });  
  }

  loadJSON = () => {
    const { layerController } = this.props;
    layerController.loadJSON( test || (window as any).mock1);
  }

  exportJSON = () => {
    const { layerController } = this.props;
    
    Promise.resolve(layerController.toJSON())
      .then(obj => {
        console.log(obj);
        alert(JSON.stringify(obj));
        test = obj;
      }); 
  }

  loadImage = e => {
    const { layerController } = this.props;
    const reader = new FileReader();
    const filename = e.target.files[0].name;
    reader.onload = (e: any) => {
      const base64: any = e.target.result;
      layerController.addImage({base64, name: filename});
      (this.refs.file as any).value = null;
    };
    reader.readAsDataURL(e.target.files[0]); 
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
    const { layerController, className, style } = this.props;
    let zoom = layerController.scale;
    if (typeof zoom !== 'number') {
      zoom = 1;
    }
    const [width, height] = layerController.getSize();
    const viewMode = layerController.viewMode;
    const loadEnable = viewMode === ViewMode.Normal;
    const cropperParam = layerController.getCropperParam();
    const { cropped } = layerController;
    const { forceCrop, allowAddLocalImage, } = layerController.options;
    
    
    return (
      <div className={classnames([styles.header, className])} style={style}>
        {
          allowAddLocalImage? (
            <Button 
              className={styles['btn']} 
              type="primary" 
              onClick={this.openFileDialog}
              disabled={!loadEnable}
            >
              加载本地图片
            </Button>
          ): null
        }
  
        <Button 
          className={styles['btn']} 
          type="primary" 
          onClick={this.loadJSON}
          disabled={!loadEnable}
        >
          加载MOCK
        </Button>
        <Button 
          className={styles['btn']} 
          type="primary" 
          onClick={this.exportJSON}
          disabled={!loadEnable}
        >
          导出JSON
        </Button>
        <input ref="file" className={styles.file} type="file" accept="image" onChange={this.loadImage}/>
        <Button className={styles['btn']} type="primary" onClick={this.exportImage}>合成图片</Button>

        
        <div className={styles['control']}>

          <Divider className={styles['divider']} type="vertical"/>

          <div className={styles['column-item']}>
            {
              !forceCrop? (
                <div className={styles['sub-item']}>
                  <Checkbox 
                    className={styles['checkbox']} 
                    checked={cropped} 
                    disabled={forceCrop}
                    onChange={this.enableCropper}
                  >
                    是否裁剪
                  </Checkbox>
                </div>
              ): null
            }
            
            <div className={styles['sub-item']}>
              <Checkbox 
                className={styles['checkbox']}
                disabled={!cropped}
                checked={viewMode === ViewMode.Crop}
                onChange={this.changeMode}
              >
                裁剪视图
              </Checkbox>
            </div>
          </div>

          { cropped ? (
            <>
              <div className={styles['column-item']} style={{width: PARAM_ITEM_WIDTH}}>
                <div className={styles['param-item']}>
                  <div className={styles['label']}>裁剪x:</div>
                  <InputNumber 
                    className={styles['inputNumber']}
                    step={1}
                    min={MIN_POS_VAL}
                    max={MAX_POS_VAL}
                    value={cropperParam.left}
                    onChange={val => this.setCropperParam('left', val)}
                  />
                </div>
                <div className={styles['param-item']}>
                  <div className={styles['label']}>裁剪y:</div>
                  <InputNumber 
                    className={styles['inputNumber']}
                    step={1}
                    min={MIN_POS_VAL}
                    max={MAX_POS_VAL}
                    value={cropperParam.top}
                    onChange={val => this.setCropperParam('top', val)}
                  />
                </div>
              </div>

              <div className={styles['column-item']} style={{width: PARAM_ITEM_WIDTH}}>

                <div className={styles['param-item']}>
                
                  <div className={styles['label']}>裁剪宽:</div>
                  <InputNumber 
                    className={styles['inputNumber']}
                    step={1}
                    min={0}
                    max={MAX_CANVAS_PIXEL_SIZE}
                    value={cropperParam.width}
                    onChange={val => this.setCropperParam('width', val)}
                  />
                </div>

                <div className={styles['param-item']}>
                  <div className={styles['label']}>
                    裁剪高:
                  </div>
                  <InputNumber 
                    className={styles['inputNumber']}
                    step={1}
                    min={0}
                    max={MAX_CANVAS_PIXEL_SIZE}
                    value={cropperParam.height}
                    onChange={val => this.setCropperParam('height', val)}
                  />
                </div>
              </div>

              {/* <div className={styles['column-item']} style={{width: PARAM_ITEM_WIDTH}}>

                <div className={styles['param-item']}>
                
                  <div className={styles['label']}>目标宽:</div>
                  <InputNumber 
                    className={styles['inputNumber']}
                    step={1}
                    min={MIN_CANVAS_PIXEL_SIZE}
                    max={MAX_CANVAS_PIXEL_SIZE}
                    value={cropperParam.width}
                    disabled
                    // onChange={val => this.changeDimension('height', val)}
                  />
                </div>

                <div className={styles['param-item']}>
                  <div className={styles['label']}>
                    目标高:
                  </div>
                  <InputNumber 
                    className={styles['inputNumber']}
                    step={1}
                    min={MIN_CANVAS_PIXEL_SIZE}
                    max={MAX_CANVAS_PIXEL_SIZE}
                    value={cropperParam.height}
                    disabled
                    // onChange={val => this.changeDimension('height', val)}
                  />
                </div>
              </div> */}

            </>

          ): null}


          

          


          <Divider className={styles['divider']} type="vertical"/>

          <div className={styles['column-item']} style={{width: PARAM_ITEM_WIDTH}}>
            <div className={styles['param-item']}>
              <div className={styles['label']}>画布宽:</div>
              <InputNumber 
                className={styles['inputNumber']}
                step={1}
                min={MIN_CANVAS_PIXEL_SIZE}
                max={MAX_CANVAS_PIXEL_SIZE}
                value={width}
                onChange={val => this.changeDimension('width', val)}
              />
            </div>
            <div className={styles['param-item']}>
              <div className={styles['label']}>画布高:</div>
              <InputNumber 
                className={styles['inputNumber']}
                step={1}
                min={MIN_CANVAS_PIXEL_SIZE}
                max={MAX_CANVAS_PIXEL_SIZE}
                value={height}
                onChange={val => this.changeDimension('height', val)}
              />
              
            </div>
          </div>

          
          <div className={styles['label']} style={{marginLeft: 10}}>缩放:</div>
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
