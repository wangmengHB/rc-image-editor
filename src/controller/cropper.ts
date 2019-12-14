import { 
  CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT, CROP_STYLE,
  ViewMode, CANVAS_PADDING, CROP_ZONE_ID
} from '../const';
import { fabric } from 'fabric';
import { numbers, arrays } from 'util-kit';
import { object } from 'prop-types';
// import COVER from '../../assets/cover.jpg';


export default class Crop {

  fCanvas: any;
  cropzone: any = null;

  // remove or add will lose group info
  left: number = 0;
  top: number = 0;
  width: number = 0;
  height: number = 0;

  constructor(fCanvas) {
    this.fCanvas = fCanvas;
    this.cropzone = new fabric.Group([], {});
    this.cropzone.perPixelTargetFind = true;
    this.cropzone.lockRotation = true;

    (window as any)._cropzone = this.cropzone;
    
    const rect = new fabric.Rect({    
      width: this.fCanvas.getWidth() - 40,
      height: this.fCanvas.getHeight() - 40,
      fill: 'transparent',
      hasRotatingPoint: false,
      hasBorders: true,
      lockScalingFlip: true,
      lockRotation: true,
      strokeWidth: 2,
      stroke: 'rgba(255,0,0,1)',
      cornerSize: 24,
      cornerStrokeColor: "#000",
      cornerColor: "#aaaaaa",
      strokeUniform: true,
    });

    // make sure scale to be 1
    this.cropzone.on('modified', () => {
      const w = this.cropzone.width * this.cropzone.scaleX;
      const h = this.cropzone.height * this.cropzone.scaleY;
      this.cropzone.forEachObject(item => {
        item.set({
          left: -w/2, 
          top: -h/2, 
          width: w, 
          height: h,
          scaleX: 1,
          scaleY: 1,
        });   
      });
      this.cropzone.set({
        width: w,
        height: h,
        scaleX: 1,
        scaleY: 1,
      });
      this.width = w;
      this.height = h;
      this.fCanvas.requestRenderAll();
    });
    this.cropzone.on('moving', () => {
      this.left = this.cropzone.left;
      this.top = this.cropzone.top;
    });

    // fabric.Image.fromURL(COVER, (oImg) => {
    //   this.cropzone.addWithUpdate(oImg);
    // });

    this.cropzone.addWithUpdate(rect);

  }

  alwaysShowCropzone = () => {
    const objects = this.fCanvas.getObjects();
    if (objects.indexOf(this.cropzone) > -1) {
      this.cropzone.bringToFront();
      this.fCanvas.setActiveObject(this.cropzone);
    }     
  }

  activeCropView() {
    this.fCanvas.remove(this.cropzone);
    this.fCanvas.forEachObject(function (obj) {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = false;
    });
    this.fCanvas.discardActiveObject();
    this.fCanvas.add(this.cropzone);
    this.cropzone.perPixelTargetFind = false;
    this.cropzone.set({ selectable: true});
    this.fCanvas.setActiveObject(this.cropzone);
    this.fCanvas.on('selection:cleared', this.alwaysShowCropzone);  
    this.fCanvas.renderAll();
  }

  activeNormalView() {
    this.fCanvas.off('selection:cleared', this.alwaysShowCropzone);
    this.fCanvas.defaultCursor = 'default';
    this.fCanvas.forEachObject(function (obj) {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = true;
    });
    this.cropzone.perPixelTargetFind = true;
    this.fCanvas.discardActiveObject();
    this.cropzone.bringToFront();
    this.cropzone.set({ selectable: false});
    this.fCanvas.renderAll();  
  }

  getCropperParam() {
    const cropzone = this.cropzone;
    const { left, top, width, height, scaleX, scaleY} = cropzone;
    return {
      left: Math.floor(left),
      top: Math.floor(top),
      width: Math.floor(width * scaleX),
      height: Math.floor(height * scaleY),
    };
  }

  setSize(param = {}) {
    const keys = Object.keys(param);
    keys.forEach(key => {
      if (['left', 'top', 'width', 'height'].indexOf(key) > -1) {
        this[key] = param[key];
      }
    });
    this.reset();
  }

  reset() {
    const {left, top, width, height } = this;
    this.cropzone.set({left, top, width, height});
    this.cropzone.scale(1);  
    this.cropzone.forEachObject(item => {
      item.set({left: -width/2, top: -height/2, width: width, height: height});
      item.scale(1);
    });
  }

}

